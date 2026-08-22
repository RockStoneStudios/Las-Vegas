'use client';

import { Suspense } from 'react';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSocketStore } from '@/lib/store/useSocketStore';
import { Dices, Martini, Wine, Beer, Gem, CircleDashed } from 'lucide-react';

const SIMBOLOS_ANIMACION = ['🍸', '🍷', '🍺', '🎲', '💎', '7️⃣'];
const ICONOS_FINALES: Record<string, React.ElementType> = {
  '🍸': Martini,
  '🍷': Wine,
  '🍺': Beer,
  '🎲': Dices,
  '💎': Gem,
  '7️⃣': CircleDashed,
};

function SlotPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const mesa = searchParams.get('mesa');
  
  const { conectado, enviarMensaje, mensajeWS, conectarSocket } = useSocketStore();
  
  const [rodillos, setRodillos] = useState<string[][]>([
    ['🍸', '🍸', '🍸'],
    ['🍷', '🍷', '🍷'],
    ['🍺', '🍺', '🍺']
  ]);
  const [girando, setGirando] = useState(false);
  const [premio, setPremio] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [lineaPremio, setLineaPremio] = useState<{ puntos: {x: number, y: number}[] } | null>(null);

  const resultadoFinalRef = useRef<{ rodillos: string[][]; premio: number } | null>(null);
  const intervalRefs = useRef<NodeJS.Timeout[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const [palancaAbajo, setPalancaAbajo] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const palancaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionId && mesa) {
      conectarSocket(sessionId, Number(mesa), 'cliente');
    }
  }, [sessionId, mesa, conectarSocket]);

  useEffect(() => {
    if (!mensajeWS) return;
    const tipo = mensajeWS.tipo;
    const payload = mensajeWS.payload || {};

    if (tipo === 'EVENT:SLOT_RESULTADO') {
      console.log('🎰 [SLOT] Resultado final recibido del backend:', payload);
      resultadoFinalRef.current = { rodillos: payload.rodillos, premio: payload.premio };
    }
  }, [mensajeWS]);

  const generarColumna = () => [
    SIMBOLOS_ANIMACION[Math.floor(Math.random() * SIMBOLOS_ANIMACION.length)],
    SIMBOLOS_ANIMACION[Math.floor(Math.random() * SIMBOLOS_ANIMACION.length)],
    SIMBOLOS_ANIMACION[Math.floor(Math.random() * SIMBOLOS_ANIMACION.length)]
  ];

  const handleGirar = () => {
    if (girando || !conectado) return;
    
    setGirando(true);
    setPremio(null);
    setMensaje('🎰 Girando...');
    setLineaPremio(null);
    resultadoFinalRef.current = null;

    intervalRefs.current.forEach(i => clearInterval(i));
    intervalRefs.current = [];

    enviarMensaje({ tipo: 'ACTION:GIRAR_SLOT', payload: {} });

    // 🔥 FORZAR PREMIO PARA PRUEBA
    resultadoFinalRef.current = {
      rodillos: [
        ['🍸', '🍷', '🍺'],
        ['🍸', '🍷', '🍺'],
        ['🍸', '🍷', '🍺']
      ],
      premio: 100
    };

    // 🟢 COLUMNA 1: Gira 4 segundos
    const intervalo1 = setInterval(() => {
      setRodillos(prev => [generarColumna(), prev[1], prev[2]]);
    }, 65);
    intervalRefs.current.push(intervalo1);

    setTimeout(() => {
      clearInterval(intervalo1);
      if (resultadoFinalRef.current) {
        setRodillos(prev => [resultadoFinalRef.current!.rodillos[0], prev[1], prev[2]]);
      }
    }, 4000);

    // 🟡 COLUMNA 2: Gira 3 segundos más (total 7s)
    const intervalo2 = setInterval(() => {
      setRodillos(prev => [prev[0], generarColumna(), prev[2]]);
    }, 65);
    intervalRefs.current.push(intervalo2);

    setTimeout(() => {
      clearInterval(intervalo2);
      if (resultadoFinalRef.current) {
        setRodillos(prev => [prev[0], resultadoFinalRef.current!.rodillos[1], prev[2]]);
      }
    }, 7000);

    // 🔵 COLUMNA 3: Gira 2 segundos más (total 9s)
    const intervalo3 = setInterval(() => {
      setRodillos(prev => [prev[0], prev[1], generarColumna()]);
    }, 65);
    intervalRefs.current.push(intervalo3);

    setTimeout(() => {
      clearInterval(intervalo3);
      if (resultadoFinalRef.current) {
        setRodillos(resultadoFinalRef.current.rodillos);
        setPremio(resultadoFinalRef.current.premio);
        setGirando(false);

        const nuevosRodillos = resultadoFinalRef.current.rodillos;
        let mejorLinea = null;
        let mayorPuntaje = 0;

        for (let f0 = 0; f0 < 3; f0++) {
          for (let f1 = 0; f1 < 3; f1++) {
            for (let f2 = 0; f2 < 3; f2++) {
              const s0 = nuevosRodillos[0][f0];
              const s1 = nuevosRodillos[1][f1];
              const s2 = nuevosRodillos[2][f2];

              let puntaje = 1;
              let simboloBase = s0;

              if (s1 === simboloBase) puntaje++;
              if (s2 === simboloBase) puntaje++;

              if (s1 === s2 && s1 !== simboloBase) {
                puntaje = 2;
              }

              if (puntaje > mayorPuntaje) {
                mayorPuntaje = puntaje;
                mejorLinea = { filas: [f0, f1, f2], simbolo: simboloBase };
              }
            }
          }
        }

        if (mejorLinea && mayorPuntaje > 1) {
          if (mayorPuntaje === 3) {
            setMensaje(`🎉 ¡GANASTE! +$${resultadoFinalRef.current.premio}`);
          } else {
            setMensaje(`🔥 ¡Por poco!`);
          }

          const grid = document.getElementById('slot-grid');
          if (grid) {
            const rect = grid.getBoundingClientRect();
            const boxWidth = rect.width / 3;
            const boxHeight = rect.height / 3;

            const puntos = [
              { x: rect.left + (0 * boxWidth) + (boxWidth / 2), y: rect.top + (mejorLinea.filas[0] * boxHeight) + (boxHeight / 2) },
              { x: rect.left + (1 * boxWidth) + (boxWidth / 2), y: rect.top + (mejorLinea.filas[1] * boxHeight) + (boxHeight / 2) },
              { x: rect.left + (2 * boxWidth) + (boxWidth / 2), y: rect.top + (mejorLinea.filas[2] * boxHeight) + (boxHeight / 2) }
            ];

            setLineaPremio({ puntos });
          }
        } else {
          setMensaje('😅 Sigue intentando');
        }
      } else {
        setGirando(false);
        setMensaje('⚠️ Error de conexión');
      }
      resultadoFinalRef.current = null;
    }, 9000);
  };

  const renderizarSimbolo = (simbolo: string, fila: number, col: number) => {
    const Icono = ICONOS_FINALES[simbolo];
    const esGirando = girando;
    
    if (!esGirando && Icono) {
      let neonColor = 'text-[#ff00a0]';
      let glowColor = 'rgba(255,0,160,0.8)';

      if (simbolo === '🍸') { neonColor = 'text-cyan-400'; glowColor = 'rgba(34,211,238,0.8)'; }
      if (simbolo === '🍷') { neonColor = 'text-red-500'; glowColor = 'rgba(239,68,68,0.8)'; }
      if (simbolo === '🍺') { neonColor = 'text-amber-400'; glowColor = 'rgba(251,191,36,0.8)'; }
      if (simbolo === '🎲') { neonColor = 'text-purple-400'; glowColor = 'rgba(168,85,247,0.8)'; }
      if (simbolo === '💎') { neonColor = 'text-cyan-400'; glowColor = 'rgba(34,211,238,0.8)'; }
      if (simbolo === '7️⃣') { neonColor = 'text-blue-500'; glowColor = 'rgba(59,130,246,0.8)'; }

      return (
        <div className="relative flex items-center justify-center w-full h-full">
          <Icono className={`w-16 h-16 md:w-20 md:h-20 ${neonColor} drop-shadow-[0_0_15px_${glowColor}]`} strokeWidth={2.5} />
          <div className={`absolute inset-0 rounded-full blur-xl opacity-40 bg-${neonColor}`} />
        </div>
      );
    }

    return (
      <span className="text-6xl md:text-7xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
        {simbolo}
      </span>
    );
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (girando) return;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !palancaRef.current || !trackRef.current) return;

    const trackRect = trackRef.current.getBoundingClientRect();
    const relativeY = e.clientY - trackRect.top;
    const maxY = trackRect.height - palancaRef.current.offsetHeight;
    const newY = Math.max(0, Math.min(maxY, relativeY));

    palancaRef.current.style.top = `${newY}px`;

    if (newY >= maxY * 0.8) {
      setPalancaAbajo(true);
    } else {
      setPalancaAbajo(false);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && palancaAbajo && !girando) {
      handleGirar();
    }
    setIsDragging(false);
    setPalancaAbajo(false);
    if (palancaRef.current) {
      palancaRef.current.style.top = `0px`;
    }
  };

  return (
    <div className="min-h-screen bg-[#020106] flex items-center justify-center p-4 text-white relative">
      
      <div className="flex flex-col items-center w-full max-w-4xl">
        
        <div className="text-center mb-6 md:mb-10">
          <h1 className="text-4xl md:text-7xl font-orbitron font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#ffd700] via-[#ff00a0] to-[#00f3ff] drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">
            CASINO LAS VEGAS
          </h1>
          <p className="text-[#00f3ff] font-space text-xs md:text-sm tracking-[0.3em] font-semibold uppercase mt-[-6px] md:mt-[-10px] drop-shadow-[0_0_8px_#22d3ee]">
            DISCOBAR
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full">
          
          <div id="slot-grid" className="bg-[#0d0718] border-4 border-[#ff00a0] rounded-2xl p-4 md:p-8 shadow-[0_0_40px_rgba(255,0,160,0.3)] relative w-full max-w-md">
            
            {lineaPremio && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-50" style={{ width: '100%', height: '100%' }}>
                <polyline
                  points={lineaPremio.puntos.map(p => `${p.x}, ${p.y}`).join(' ')}
                  fill="none"
                  stroke="#ff0000"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] animate-pulse"
                />
              </svg>
            )}

            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {rodillos.map((col, i) => (
                <div key={i} className="flex flex-col gap-2 md:gap-4 bg-black/50 p-1 md:p-2 rounded-xl">
                  {col.map((sym, j) => (
                    <div key={j} className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center bg-[#05030a] rounded-lg border-2 border-[#00f3ff]/30">
                      {renderizarSimbolo(sym, i, j)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center gap-4 md:gap-6 mt-2 md:mt-0">
            
            {/* PALANCA MEJORADA (Más ancha y fácil de agarrar) */}
            <div className="relative h-[100px] md:h-[140px] w-12 md:w-16 flex flex-col items-center justify-center">
              <div 
                ref={trackRef}
                className="relative w-8 md:w-10 h-full bg-[#0d0718] border-2 border-[#00f3ff]/60 rounded-full shadow-[0_0_15px_rgba(0,243,255,0.3)] flex items-end overflow-hidden cursor-pointer"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* POMO MÁS GRANDE */}
                <div
                  ref={palancaRef}
                  className="absolute left-1/2 -translate-x-1/2 top-0 w-8 md:w-10 h-8 md:h-10 bg-[#ff00a0] rounded-full border-2 md:border-4 border-[#ff00a0] shadow-[0_0_20px_rgba(255,0,160,0.6)] cursor-grab active:cursor-grabbing transition-all duration-200 ease-out z-10"
                  onMouseDown={handleMouseDown}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow-[inset_0_0_10px_rgba(255,255,255,0.5)]" />
                </div>
              </div>
            </div>

            <button
              onClick={handleGirar}
              disabled={girando}
              className="px-3 py-1 md:px-4 md:py-1.5 text-[9px] md:text-[10px] font-black text-white bg-[#00f3ff]/20 border border-[#00f3ff] rounded-full hover:bg-[#00f3ff]/40 transition-all disabled:opacity-50"
            >
              🎲 TIRAR
            </button>

            {mensaje && !girando && (
              <div className={`text-center text-xl md:text-3xl font-bold transition-all duration-300 ${
                premio ? 'text-[#ffd700] drop-shadow-[0_0_30px_#ffd700]' : 'text-gray-400'
              }`}>
                {mensaje}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function SlotPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SlotPageContent />
    </Suspense>
  );
}