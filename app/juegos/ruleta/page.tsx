'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSocketStore } from '@/lib/store/useSocketStore';
import RuedaRuleta from '@/app/components/juegos/RuedaRuleta';
import { RotateCcw, Dices, PartyPopper, Frown } from 'lucide-react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

// 🔒 Lista de palabras clave que SIEMPRE indican un premio perdedor,
// sin importar lo que diga el flag "esGanador" del backend.
// Así protegemos el confeti de datos inconsistentes del servidor.
const PALABRAS_PERDEDOR = ['sigue intentando', 'no ganaste', 'perdiste', 'sin premio', 'intenta de nuevo'];

function esPremioPerdedor(texto: string): boolean {
  const textoNormalizado = texto.toLowerCase().trim();
  return PALABRAS_PERDEDOR.some((palabra) => textoNormalizado.includes(palabra));
}

export default function RuletaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mesa, setMesa] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  
  const { conectarSocket, enviarMensaje, mensajeWS, conectado } = useSocketStore();

  const PREMIOS_DEFECTO = [
    { id: 'seg-0', texto: 'Sigue intentando', esGanador: false, color: '#2a1a3a', icono: 'Frown' },
    { id: 'seg-1', texto: 'Shot de Tequila', esGanador: false, color: '#ffd700', icono: 'GlassWater' },
    { id: 'seg-2', texto: '10% OFF en Botella', esGanador: false, color: '#ff007f', icono: 'Tag' },
    { id: 'seg-3', texto: 'Botella Gratis', esGanador: true, color: '#ff6b6b', icono: 'Wine' },
  ];
  
  const [segmentos, setSegmentos] = useState<any[]>(PREMIOS_DEFECTO); 
  const [rotacion, setRotacion] = useState(0);
  const [girando, setGirando] = useState(false);
  const [premioGanado, setPremioGanado] = useState<any>(null);
  const [indiceGanador, setIndiceGanador] = useState<number | null>(null);

  const letraLRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = letraLRef.current;
    if (!el) return;

    let timeoutId: NodeJS.Timeout;

    const generarChispa = () => {
      const tl = gsap.timeline({
        onComplete: () => {
          const tiempoSiguienteFalla = Math.random() * 2200 + 300;
          timeoutId = setTimeout(generarChispa, tiempoSiguienteFalla);
        },
      });

      tl.to(el, { opacity: 0, filter: 'none', color: '#111', duration: 0.02 })
        .to(el, { opacity: 1, filter: 'drop-shadow(0 0 18px #ff0055) drop-shadow(0 0 5px #fff)', color: '#ffffff', duration: 0.01 })
        .to(el, { opacity: 0.1, filter: 'none', color: '#ff0055', duration: 0.03 })
        .to(el, { opacity: 1, filter: 'drop-shadow(0 0 25px #00f3ff) drop-shadow(0 0 8px #00f3ff)', color: '#00f3ff', duration: 0.02 })
        .to(el, { opacity: 0, filter: 'none', duration: 0.04 })
        .to(el, { opacity: 1, filter: 'drop-shadow(0 0 15px #ffee00) drop-shadow(0 0 4px #fff)', color: '#ffee00', duration: 0.01 })
        .to(el, { opacity: 0.2, filter: 'none', color: '#00f3ff', duration: 0.02 })
        .to(el, { opacity: 1, filter: 'drop-shadow(0 0 20px #00f3ff) drop-shadow(0 0 10px #00f3ff)', color: '#00f3ff', duration: 0.08 });
    };

    generarChispa();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const sessionIdParam = searchParams.get('sessionId');
    const mesaParam = searchParams.get('mesa');
    
    if (!sessionIdParam || !mesaParam) {
      router.push('/');
      return;
    }
    
    setSessionId(sessionIdParam);
    setMesa(Number(mesaParam));
    
    conectarSocket(sessionIdParam, Number(mesaParam), 'cliente');
    setCargando(false);
  }, [searchParams, conectarSocket, router]);

  useEffect(() => {
    if (conectado && sessionId) {
      console.log('📤 [RULETA PAGE] Solicitando lista de premios al backend...');
      enviarMensaje({
        tipo: 'ACTION:OBTENER_PREMIOS',
        payload: {},
      });
    }
  }, [conectado, sessionId, enviarMensaje]);

  // 🎊 CONFETI — solo cuando el texto NO es de un premio perdedor conocido.
  // Ya no dependemos del flag "esGanador" del backend como única fuente de verdad.
  useEffect(() => {
    if (premioGanado && !girando) {
      const esPerdedor = esPremioPerdedor(premioGanado.texto);

      if (!esPerdedor) {
        console.log('🎊 [RULETA PAGE] ¡Confeti activado por premio real!');
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ff007f', '#00f3ff', '#ffee00', '#a855f7'],
        });

        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 60,
            origin: { x: 0 },
            colors: ['#ff007f', '#00f3ff'],
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 60,
            origin: { x: 1 },
            colors: ['#ffee00', '#a855f7'],
          });
        }, 250);
      }
    }
  }, [premioGanado, girando]);

  useEffect(() => {
    if (!mensajeWS) return;
    
    const tipo = mensajeWS.tipo;
    const payload = mensajeWS.payload || {};

    if (tipo === 'EVENT:RULETA_CONFIGURACION_INICIAL') {
      console.log('✅ [RULETA PAGE] ¡Lista de premios recibida!');
      if (payload.premios && payload.premios.length > 0) {
        setSegmentos(prev => {
          return prev.map((seg, i) => {
            if (payload.premios[i]) {
              return {
                ...seg,
                texto: payload.premios[i].nombre || seg.texto,
                color: payload.premios[i].color || seg.color,
                icono: payload.premios[i].icono || seg.icono,
                esGanador: payload.premios[i].esPremioMayor || seg.esGanador,
              };
            }
            return seg;
          });
        });
      }
      return;
    }

    if (tipo === 'EVENT:RULETA_GIRAR') {
      const { indiceGanador: idx, premio, vueltas, duracionMs, color, icono, esGanador } = payload;
      
      if (idx === undefined || idx === null) return;

      setSegmentos(prev => {
        let nuevosSegmentos = [...prev];
        if (nuevosSegmentos[idx]) {
          nuevosSegmentos[idx] = {
            ...nuevosSegmentos[idx],
            texto: premio || nuevosSegmentos[idx].texto,
            color: color || nuevosSegmentos[idx].color,
            icono: icono || nuevosSegmentos[idx].icono,
            esGanador: esGanador ?? false
          };
        }
        return nuevosSegmentos;
      });

      const totalSegmentos = segmentos.length > 0 ? segmentos.length : 4;
      const anguloPorSegmento = 360 / totalSegmentos;
      
      const vueltasTotales = (vueltas || 20) + 4; 
      
      const anguloObjetivo = vueltasTotales * 360 + 360 - (idx * anguloPorSegmento) - (anguloPorSegmento / 2);
      
      setIndiceGanador(idx);
      setRotacion(anguloObjetivo);
      setGirando(true);
      setPremioGanado(null);
      
      const duracion = (duracionMs || 11000) + 2000; 
      
      setTimeout(() => {
        setGirando(false);
        const textoFinal = premio || '¡Premio!';
        setPremioGanado({
          id: `premio-${idx}`,
          texto: textoFinal,
          // 🔒 Ignoramos el flag del backend si el texto claramente indica que perdió.
          esGanador: esPremioPerdedor(textoFinal) ? false : (esGanador ?? false),
          color: color || '#ffffff',
          icono: icono,
        });
      }, duracion);
    }
    
  }, [mensajeWS, segmentos.length]);

  const handleGirar = () => {
    if (girando || !conectado) return;
    setGirando(true);
    setPremioGanado(null);
    enviarMensaje({ tipo: 'ACTION:GIRAR_RULETA_PREMIOS', payload: {} });
  };

  const handleReiniciar = () => {
    setRotacion(0);
    setPremioGanado(null);
    setIndiceGanador(null);
    setGirando(false);
    setSegmentos(PREMIOS_DEFECTO);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#020106] flex items-center justify-center font-orbitron text-[#00f3ff] text-xs tracking-[0.2em] animate-pulse">
        CARGANDO RULETA...
      </div>
    );
  }

  return (
    <div className="px-4 pt-20 pb-12 md:px-8 min-h-screen max-w-3xl mx-auto flex flex-col items-center select-none bg-[#020106]">
      
      <header className="text-center mb-6">
        <h1 className="font-mono text-2xl md:text-4xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_15px_rgba(0,243,255,0.6)] flex items-center justify-center gap-1">
          <span>🎡 LA RULETA GLOBA</span>
          <span ref={letraLRef} className="text-[#00f3ff] inline-block font-black ml-0.5 min-w-[0.6em]">L</span>
        </h1>
        <p className="mt-1.5 font-mono text-xs md:text-sm tracking-wider uppercase text-gray-400">
          Mesa #{mesa} {girando ? '🎲 ¡Suerte! Girando...' : premioGanado ? '¡Revisa tu premio!' : 'Presiona girar para participar'}
        </p>
        <p className="text-[10px] text-gray-500 font-mono mt-1">
          {conectado ? '🟢 Conectado' : '🔴 Desconectado'}
        </p>
      </header>

      <div className="relative flex justify-center items-center my-2">
        <RuedaRuleta
          segmentos={segmentos}
          rotacion={rotacion}
          girando={girando}
          indiceGanador={indiceGanador}
        />
      </div>

      <button
        onClick={handleGirar}
        disabled={girando || !conectado}
        className={`mt-6 font-mono font-black text-sm md:text-base tracking-widest uppercase px-8 py-3.5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-2.5 ${
          girando || !conectado
            ? 'border-gray-800 text-gray-600 bg-[#060413]/50 cursor-not-allowed scale-95'
            : 'border-[#00f3ff] text-[#00f3ff] bg-[#00f3ff]/10 hover:bg-[#00f3ff]/25 hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(0,243,255,0.35)]'
        }`}
      >
        <Dices className={`w-5 h-5 ${girando ? 'animate-spin' : ''}`} />
        {girando ? 'Girando...' : !conectado ? 'Conectando...' : 'Girar la ruleta'}
      </button>

      {premioGanado && !girando && (() => {
        const esPerdedor = esPremioPerdedor(premioGanado.texto);

        return (
          <div
            className={`mt-6 w-full max-w-sm rounded-2xl border-2 p-5 text-center flex flex-col items-center backdrop-blur-md transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 ${
              !esPerdedor
                ? 'border-[#ffd700] bg-[#ffd700]/10 shadow-[0_0_30px_rgba(255,215,0,0.35)] text-[#ffd700]'
                : 'border-[#ff007f]/70 bg-[#ff007f]/10 shadow-[0_0_25px_rgba(255,0,127,0.3)] text-[#ff007f]'
            }`}
          >
            {!esPerdedor ? (
              <PartyPopper className="w-10 h-10 mb-2 filter drop-shadow-[0_0_10px_currentColor]" />
            ) : (
              <Frown className="w-10 h-10 mb-2 filter drop-shadow-[0_0_10px_currentColor]" />
            )}

            <p className="font-mono font-black text-base md:text-lg uppercase tracking-widest text-white">
              {!esPerdedor ? '¡Felicidades, Ganaste!' : '¡Sigue intentando!'}
            </p>

            {!esPerdedor && (
              <p className="font-mono text-xs md:text-sm text-gray-200 mt-1 uppercase font-bold tracking-wide">
                {premioGanado.texto}
              </p>
            )}
          </div>
        );
      })()}

      <button
        onClick={handleReiniciar}
        disabled={girando}
        className="mt-6 font-mono text-[11px] tracking-widest uppercase text-gray-500 hover:text-[#ff007f] transition-colors disabled:opacity-30 flex items-center gap-1.5"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reordenar premios
      </button>
    </div>
  );
}