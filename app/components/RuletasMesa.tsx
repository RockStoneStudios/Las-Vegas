'use client';

import { useState, useRef, useEffect } from 'react';

// Colores originales
const COLORES_RULETA = ['#ff3ea5', '#1c1030'];

function polarACartesiano(cx: number, cy: number, r: number, anguloGrados: number) {
  const rad = ((anguloGrados - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describirPorcion(cx: number, cy: number, r: number, anguloInicio: number, anguloFin: number) {
  const inicio = polarACartesiano(cx, cy, r, anguloFin);
  const fin = polarACartesiano(cx, cy, r, anguloInicio);
  const arcoLargo = anguloFin - anguloInicio <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${inicio.x} ${inicio.y} A ${r} ${r} 0 ${arcoLargo} 0 ${fin.x} ${fin.y} Z`;
}

interface RuletaMesasProps {
  numMesas: number;
  onResultado?: (mesaGanadora: number) => void;
}

type ModoVisual = 'ruleta' | 'mosaico';

export default function RuletaMesas({ numMesas, onResultado }: RuletaMesasProps) {
  const [modo, setModo] = useState<ModoVisual>('ruleta');
  
  const listaMesasMosaico = Array.from({ length: numMesas }, (_, i) => i + 1);
  const segmentosRuleta = Array.from({ length: numMesas }, (_, i) => i + 1);
  const totalSegmentos = segmentosRuleta.length;
  const anguloSegmento = 360 / totalSegmentos;

  const [rotacion, setRotacion] = useState(0);
  const [girando, setGirando] = useState(false);
  const [ganadora, setGanadora] = useState<number | null>(null);
  const [duracionActual, setDuracionActual] = useState(7); 
  
  const [indiceMosaicoActivo, setIndiceMosaicoActivo] = useState<number | null>(null);
  const [indiceRuletaGanador, setIndiceRuletaGanador] = useState<number | null>(null);

  const rotacionAcumulada = useRef(0);
  const intervaloMosaicoRef = useRef<NodeJS.Timeout | null>(null);

  // Dimensiones del SVG
  const cx = 300, cy = 300;
  const r = 290; 
  const radioTexto = r * 0.85; 

  useEffect(() => {
    return () => {
      if (intervaloMosaicoRef.current) clearInterval(intervaloMosaicoRef.current);
    };
  }, []);

  function obtenerAleatorio(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  function iniciarSorteo() {
    if (girando) return;
    setGirando(true);
    setGanadora(null);
    setIndiceMosaicoActivo(null);
    setIndiceRuletaGanador(null);

    // Ajustado estrictamente entre 7 y 11 segundos
    const segundosAleatorios = obtenerAleatorio(18, 23);
    setDuracionActual(segundosAleatorios);
    const milisegundosSorteo = segundosAleatorios * 1000;

    if (modo === 'ruleta') {
      const indiceGanador = Math.floor(Math.random() * totalSegmentos);
      const anguloCentroSegmento = (indiceGanador * anguloSegmento) + (anguloSegmento / 2);
      
      const vueltasExtra = Math.floor(obtenerAleatorio(6, 12));
      const anguloObjetivo = (360 * vueltasExtra) - anguloCentroSegmento;

      const anguloActualMod = ((rotacionAcumulada.current % 360) + 360) % 360;
      let diferencia = anguloObjetivo - anguloActualMod;
      if (diferencia <= 0) diferencia += 360;

      const nuevaRotacion = rotacionAcumulada.current + vueltasExtra * 360 + diferencia;
      rotacionAcumulada.current = nuevaRotacion;
      setRotacion(nuevaRotacion);

      setTimeout(() => {
        const mesaGanadora = segmentosRuleta[indiceGanador];
        setGirando(false);
        setGanadora(mesaGanadora);
        setIndiceRuletaGanador(indiceGanador);
        if (onResultado) onResultado(mesaGanadora);
      }, milisegundosSorteo);

    } else {
      const indiceFinalMosaico = Math.floor(Math.random() * numMesas);
      let tiempoPaso = 60; 
      let tiempoAcumulado = 0;
      let ultimoIndiceActivo = -1;

      const animarMosaico = () => {
        let siguienteIndice;
        do {
          siguienteIndice = Math.floor(Math.random() * numMesas);
        } while (siguienteIndice === ultimoIndiceActivo && numMesas > 1);

        ultimoIndiceActivo = siguienteIndice;
        setIndiceMosaicoActivo(siguienteIndice);
        tiempoAcumulado += tiempoPaso;

        const progreso = tiempoAcumulado / milisegundosSorteo;
        if (progreso > 0.6 && progreso <= 0.85) {
          tiempoPaso += 40; 
        } else if (progreso > 0.85) {
          tiempoPaso += 110;
        }

        if (tiempoAcumulado < milisegundosSorteo) {
          intervaloMosaicoRef.current = setTimeout(animarMosaico, tiempoPaso);
        } else {
          setIndiceMosaicoActivo(indiceFinalMosaico);
          const mesaGanadora = listaMesasMosaico[indiceFinalMosaico];
          setGirando(false);
          setGanadora(mesaGanadora);
          if (onResultado) onResultado(mesaGanadora);
        }
      };

      intervaloMosaicoRef.current = setTimeout(animarMosaico, tiempoPaso);
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      
      {/* Selector de Modo visual */}
      <div className="flex bg-[#0d0720] rounded-full p-1 border border-[#331b58] shadow-[0_0_15px_rgba(155,93,229,0.15)]">
        <button
          disabled={girando}
          onClick={() => { setModo('ruleta'); setGanadora(null); setIndiceMosaicoActivo(null); setIndiceRuletaGanador(null); }}
          className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 disabled:cursor-not-allowed text-white ${
            modo === 'ruleta' 
              ? 'bg-gradient-to-r from-[#ff3ea5] to-[#9b5de5] shadow-[0_0_8px_rgba(255,255,255,0.5)]' 
              : 'bg-transparent'
          }`}
        >
          Ruleta
        </button>
        <button
          disabled={girando}
          onClick={() => { setModo('mosaico'); setGanadora(null); setIndiceMosaicoActivo(null); setIndiceRuletaGanador(null); }}
          className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 disabled:cursor-not-allowed text-white ${
            modo === 'mosaico' 
              ? 'bg-gradient-to-r from-[#ff3ea5] to-[#9b5de5] shadow-[0_0_8px_rgba(255,255,255,0.5)]' 
              : 'bg-transparent'
          }`}
        >
          Mosaico
        </button>
      </div>

      {/* Contenedor Fijo Grande */}
      <div className="relative w-full max-w-[550px] aspect-square flex items-center justify-center">
        {modo === 'ruleta' ? (
          <>
            {/* Indicador de aguja superior (Usando color cian plano de Tailwind) */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 height-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[32px] border-t-cyan-400 z-10 drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
            
            <svg
              width="100%" 
              height="100%" 
              viewBox="0 0 600 600"
              className="drop-shadow-[0_0_25px_rgba(255,62,165,0.2)] will-change-transform"
              style={{
                transform: `rotate(${rotacion}deg)`,
                transition: girando ? `transform ${duracionActual}s cubic-bezier(0.1, 0.8, 0.1, 1)` : 'none',
              }}
            >
              <defs>
                <radialGradient id="hub" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#2ee6d6" />
                  <stop offset="100%" stopColor="#ff3ea5" />
                </radialGradient>

                {/* Filtro Neón Dorado SVG */}
                <filter id="neon-dorado" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur1" />
                  <feGaussianBlur stdDeviation="15" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              
              {segmentosRuleta.map((mesa, i) => {
                const anguloInicio = i * anguloSegmento;
                const anguloFin = anguloInicio + anguloSegmento;
                const anguloMedio = anguloInicio + anguloSegmento / 2;
                const posTexto = polarACartesiano(cx, cy, radioTexto, anguloMedio);
                const esSegmentoGanador = i === indiceRuletaGanador;

                return (
                  <g key={i}>
                    <path
                      d={describirPorcion(cx, cy, r, anguloInicio, anguloFin)}
                      fill={esSegmentoGanador ? '#ffd700' : COLORES_RULETA[i % 2]} 
                      stroke={esSegmentoGanador ? '#fff' : '#0a0612'} 
                      strokeWidth={esSegmentoGanador ? "3" : "1.5"} 
                      filter={esSegmentoGanador ? "url(#neon-dorado)" : "none"}
                      className="transition-all duration-300"
                    />
                    <text
                      x={posTexto.x} 
                      y={posTexto.y} 
                      fill={esSegmentoGanador ? '#000' : '#fff'} 
                      fontSize={esSegmentoGanador ? "20" : "16"} 
                      textAnchor="middle" 
                      dominantBaseline="middle"
                      transform={`rotate(${anguloMedio}, ${posTexto.x}, ${posTexto.y})`}
                      className="font-black font-sans tracking-tight transition-all duration-300"
                      style={{
                        textShadow: esSegmentoGanador ? '0 0 5px #fff' : 'none'
                      }}
                    >
                      {mesa}
                    </text>
                  </g>
                );
              })}
              <circle cx={cx} cy={cy} r="35" fill="url(#hub)" />
            </svg>
          </>
        ) : (
          /* MODO MOSAICO */
          <div className="w-full h-full grid grid-cols-4 gap-2.5 p-2.5 box-border">
            {listaMesasMosaico.map((mesa, index) => {
              const activo = index === indiceMosaicoActivo;
              const esElGanador = ganadora === mesa;
              const mostrarNeonGanador = !girando && esElGanador;
              
              return (
                <div
                  key={mesa}
                  className={`flex items-center justify-center rounded-xl font-black font-sans select-none transition-all
                    ${activo && girando 
                      ? 'bg-gradient-to-br from-[#2ee6d6] to-[#9b5de5] border-2 border-white shadow-[0_0_25px_#2ee6d6,inset_0_0_10px_rgba(255,255,255,0.4)] scale-[1.06] duration-75' 
                      : mostrarNeonGanador
                      ? 'bg-gradient-to-br from-[#ffe066] to-[#f5b041] border-[3px] border-white shadow-[0_0_35px_#ffd700,0_0_15px_#ffb300,inset_0_0_15px_#fff] scale-[1.08] text-[#0a0612] text-2xl duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]'
                      : 'bg-[#1c1030] border-2 border-[#3c1e6d] text-white text-xl duration-75'
                    }
                    ${!girando && ganadora && !esElGanador ? 'opacity-25' : 'opacity-100'}
                  `}
                >
                  {mesa}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botón de Sorteo */}
      <button
        onClick={iniciarSorteo}
        disabled={girando}
        className={`px-10 py-3.5 text-lg font-extrabold rounded-full text-white transition-all duration-200 disabled:cursor-not-allowed
          ${girando 
            ? 'bg-[#2a1a40]' 
            : 'bg-gradient-to-r from-[#ff3ea5] to-[#9b5de5] hover:shadow-[0_0_20px_rgba(255,62,165,0.5)] active:scale-95'
          }
        `}
      >
        {girando ? 'SORTEANDO...' : 'INICIAR SORTEO'}
      </button>

      {/* Alerta de Ganador Dorada */}
      <div className="min-h-[2.5rem] flex items-center">
        {ganadora && (
          <div className="text-2xl text-[#ffd700] font-black font-sans tracking-wider animate-pulse drop-shadow-[0_0_20px_#ffd700]">
            ¡MESA {ganadora} SE LLEVA EL JUEGO LIBRE! 
          </div>
        )}
      </div>
    </div>
  );
}