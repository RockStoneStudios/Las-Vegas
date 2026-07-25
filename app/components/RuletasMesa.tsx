'use client';

import { useState, useRef, useEffect } from 'react';

// Colores neón contrastados para estética Neo-Punk
const COLORES_RULETA = ['#ff007f', '#0d0722'];

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
  onInicioGiro?: () => void;
}

export default function RuletaMesas({ numMesas, onResultado, onInicioGiro }: RuletaMesasProps) {
  const segmentosRuleta = Array.from({ length: numMesas }, (_, i) => i + 1);
  const totalSegmentos = segmentosRuleta.length;
  const anguloSegmento = 360 / totalSegmentos;

  const [rotacion, setRotacion] = useState(0);
  const [girando, setGirando] = useState(false);
  const [ganadora, setGanadora] = useState<number | null>(null);
  const [duracionActual, setDuracionActual] = useState(12); // ✅ Cambiado: 12 segundos por defecto
  const [indiceRuletaGanador, setIndiceRuletaGanador] = useState<number | null>(null);

  const rotacionAcumulada = useRef(0);
  const timeoutRuletaRef = useRef<NodeJS.Timeout | null>(null);

  // Dimensiones SVG
  const cx = 300, cy = 300;
  const r = 285; 
  const radioTexto = r * 0.82; 

  const limpiarTimers = () => {
    if (timeoutRuletaRef.current) clearTimeout(timeoutRuletaRef.current);
  };

  useEffect(() => {
    return () => limpiarTimers();
  }, []);

  function obtenerAleatorio(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  function reiniciarEstado() {
    limpiarTimers();
    setGanadora(null);
    setIndiceRuletaGanador(null);
  }

  function iniciarSorteo() {
    if (girando) return;
    
    if (onInicioGiro) {
      onInicioGiro();
    }

    setGirando(true);
    reiniciarEstado();

    // ✅ CAMBIADO: Duración entre 11 y 14 segundos (antes 7-10)
    const segundosAleatorios = obtenerAleatorio(13, 18);
    setDuracionActual(segundosAleatorios);
    const milisegundosSorteo = segundosAleatorios * 1000;

    const indiceGanador = Math.floor(Math.random() * totalSegmentos);
    const anguloCentroSegmento = (indiceGanador * anguloSegmento) + (anguloSegmento / 2);
    
    // ✅ CAMBIADO: Muchas más vueltas (15-25 en lugar de 10-14)
    const vueltasExtra = Math.floor(obtenerAleatorio(18, 25));
    const anguloObjetivo = (360 * vueltasExtra) - anguloCentroSegmento;

    const anguloActualMod = ((rotacionAcumulada.current % 360) + 360) % 360;
    let diferencia = anguloObjetivo - anguloActualMod;
    if (diferencia <= 0) diferencia += 360;

    const nuevaRotacion = rotacionAcumulada.current + vueltasExtra * 360 + diferencia;
    rotacionAcumulada.current = nuevaRotacion;
    setRotacion(nuevaRotacion);

    // ✅ Log para debug
    console.log(`🎰 Girando ${vueltasExtra} vueltas en ${segundosAleatorios.toFixed(1)}s`);

    timeoutRuletaRef.current = setTimeout(() => {
      const mesaGanadora = segmentosRuleta[indiceGanador];
      setGirando(false);
      setGanadora(mesaGanadora);
      setIndiceRuletaGanador(indiceGanador);

      if (onResultado) {
        onResultado(mesaGanadora);
      }
    }, milisegundosSorteo);
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      
      {/* 🏆 1. GANADOR ARRIBA DE LA RULETA */}
      <div className="min-h-[3rem] flex items-center justify-center">
        {ganadora && (
          <div className="text-xl sm:text-3xl text-[#ffd700] font-black font-orbitron tracking-widest text-center animate-pulse drop-shadow-[0_0_20px_#ffd700] bg-[#0c0824]/90 px-6 py-3 rounded-2xl border-2 border-[#ffd700]">
            ¡MESA {ganadora} SE LLEVA EL JUEGO LIBRE!
          </div>
        )}
      </div>

      {/* 🎯 2. RULETA CON ESTILO NEO-PUNK */}
      <div className="relative w-full max-w-[520px] aspect-square flex items-center justify-center">
        {/* Aguja apuntadora superior con luz Neón Cyan */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[36px] border-t-[#2ee6d6] z-20 drop-shadow-[0_0_15px_#2ee6d6]" />
        
        <svg
          width="100%" 
          height="100%" 
          viewBox="0 0 600 600"
          className="drop-shadow-[0_0_35px_rgba(255,0,127,0.35)] will-change-transform"
          style={{
            transform: `rotate(${rotacion}deg)`,
            // ✅ CAMBIADO: cubic-bezier para desaceleración más suave
            transition: girando ? `transform ${duracionActual}s cubic-bezier(0.08, 0.82, 0.17, 1)` : 'none',
          }}
        >
          <defs>
            {/* Núcleo neón central */}
            <radialGradient id="hub-punk" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2ee6d6" />
              <stop offset="60%" stopColor="#ff007f" />
              <stop offset="100%" stopColor="#060413" />
            </radialGradient>

            {/* Brillo Neón Dorado para el Segmento Ganador */}
            <filter id="neon-dorado-punk" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur1" />
              <feGaussianBlur stdDeviation="12" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Borde exterior cromado / neón */}
          <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke="#2ee6d6" strokeWidth="4" className="drop-shadow-[0_0_10px_#2ee6d6]" />

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
                  stroke={esSegmentoGanador ? '#ffffff' : '#ff007f'} 
                  strokeWidth={esSegmentoGanador ? "4" : "1.5"} 
                  filter={esSegmentoGanador ? "url(#neon-dorado-punk)" : "none"}
                  className="transition-all duration-300"
                />
                <text
                  x={posTexto.x} 
                  y={posTexto.y} 
                  fill={esSegmentoGanador ? '#000000' : '#ffffff'} 
                  fontSize={esSegmentoGanador ? "22" : "17"} 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  transform={`rotate(${anguloMedio}, ${posTexto.x}, ${posTexto.y})`}
                  className="font-black font-sans tracking-wider"
                  style={{
                    textShadow: esSegmentoGanador ? '0 0 8px #ffffff' : '0 0 6px rgba(255,0,127,0.8)'
                  }}
                >
                  {mesa}
                </text>
              </g>
            );
          })}

          {/* Centro de la ruleta */}
          <circle cx={cx} cy={cy} r="38" fill="url(#hub-punk)" stroke="#ffffff" strokeWidth="2" className="drop-shadow-[0_0_15px_#2ee6d6]" />
        </svg>
      </div>

      {/* 🔘 3. BOTÓN DE SORTEO */}
      <button
        onClick={iniciarSorteo}
        disabled={girando}
        className={`px-10 py-4 text-sm sm:text-base font-black font-orbitron rounded-full text-white tracking-widest uppercase transition-all duration-300 disabled:cursor-not-allowed
          ${girando 
            ? 'bg-[#1f1645] opacity-60 border border-purple-900' 
            : 'bg-gradient-to-r from-[#ff00a0] via-[#9b5de5] to-[#2ee6d6] shadow-[0_0_25px_rgba(255,0,160,0.6)] hover:shadow-[0_0_35px_rgba(46,230,214,0.8)] hover:scale-105 active:scale-95'
          }
        `}
      >
        {girando ? '⚡ SORTEANDO... ⚡' : 'INICIAR SORTEO'}
      </button>

    </div>
  );
}