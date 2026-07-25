'use client';

import { useEffect, useRef } from 'react';
import { useRuletaSimulada } from '@/lib/hooks/useRuletaSimulada';
import RuedaRuleta from '@/app/components/juegos/RuedaRuleta';
import { RotateCcw, Dices, PartyPopper, Frown } from 'lucide-react';
import gsap from 'gsap';

export default function RuletaPage() {
  const { segmentos, rotacion, girando, premioGanado, girar, reiniciarRuleta } =
    useRuletaSimulada();

  const letraLRef = useRef<HTMLSpanElement>(null);
  const IconoPremio = premioGanado?.icono;

  // ⚡ CORTOCIRCUITO ELÉCTRICO REAL Y CAÓTICO CON GSAP
  useEffect(() => {
    const el = letraLRef.current;
    if (!el) return;

    // Función recursiva que genera destellos y apagones con tiempos e intensidades aleatorias
    let timeoutId: NodeJS.Timeout;

    const generarChispa = () => {
      const tl = gsap.timeline({
        onComplete: () => {
          // Espera un tiempo aleatorio entre cortocircuitos (entre 0.3s y 2.5s)
          const tiempoSiguienteFalla = Math.random() * 2200 + 300;
          timeoutId = setTimeout(generarChispa, tiempoSiguienteFalla);
        },
      });

      // Ráfaga caótica de micro-apagones y chispazos (0.01s a 0.04s)
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

  return (
    <div className="px-4 pt-20 pb-12 md:px-8 min-h-screen max-w-3xl mx-auto flex flex-col items-center select-none">
      
      {/* 🎡 HEADER CON CORTOCIRCUITO REAL EN LA 'L' */}
      <header className="text-center mb-6">
        <h1 className="font-mono text-2xl md:text-4xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_15px_rgba(0,243,255,0.6)] flex items-center justify-center gap-1">
          <span>🎡 LA RULETA GLOBA</span>
          <span 
            ref={letraLRef} 
            className="text-[#00f3ff] inline-block font-black ml-0.5 min-w-[0.6em]"
          >
            L
          </span>
        </h1>
        <p className="mt-1.5 font-mono text-xs md:text-sm tracking-wider uppercase text-gray-400">
          {girando ? '🎲 ¡Suerte! Girando...' : premioGanado ? '¡Revisa tu premio!' : 'Presiona girar para participar'}
        </p>
      </header>

      {/* RUEDA DE LA RULETA */}
      <div className="relative flex justify-center items-center my-2">
        <RuedaRuleta
          segmentos={segmentos}
          rotacion={rotacion}
          girando={girando}
          indiceGanador={premioGanado ? segmentos.findIndex(s => s.id === premioGanado.id) : null}
        />
      </div>

      {/* BOTÓN PRINCIPAL */}
      <button
        onClick={girar}
        disabled={girando}
        className={`mt-6 font-mono font-black text-sm md:text-base tracking-widest uppercase px-8 py-3.5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-2.5 ${
          girando
            ? 'border-gray-800 text-gray-600 bg-[#060413]/50 cursor-not-allowed scale-95'
            : 'border-[#00f3ff] text-[#00f3ff] bg-[#00f3ff]/10 hover:bg-[#00f3ff]/25 hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(0,243,255,0.35)]'
        }`}
      >
        <Dices className={`w-5 h-5 ${girando ? 'animate-spin' : ''}`} />
        {girando ? 'Girando...' : 'Girar la ruleta'}
      </button>

      {/* BANNER DE RESULTADO */}
      {premioGanado && !girando && (
        <div
          className={`mt-6 w-full max-w-sm rounded-2xl border-2 p-5 text-center flex flex-col items-center backdrop-blur-md transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 ${
            premioGanado.esGanador
              ? 'border-[#ffd700] bg-[#ffd700]/10 shadow-[0_0_30px_rgba(255,215,0,0.35)] text-[#ffd700]'
              : 'border-[#ff007f]/70 bg-[#ff007f]/10 shadow-[0_0_25px_rgba(255,0,127,0.3)] text-[#ff007f]'
          }`}
        >
          {IconoPremio ? (
            <IconoPremio className="w-10 h-10 mb-2 filter drop-shadow-[0_0_10px_currentColor]" />
          ) : premioGanado.esGanador ? (
            <PartyPopper className="w-10 h-10 mb-2 filter drop-shadow-[0_0_10px_currentColor]" />
          ) : (
            <Frown className="w-10 h-10 mb-2 filter drop-shadow-[0_0_10px_currentColor]" />
          )}

          <p className="font-mono font-black text-base md:text-lg uppercase tracking-widest text-white">
            {premioGanado.esGanador ? '¡Felicidades, Ganaste!' : 'Sigue intentando'}
          </p>
          <p className="font-mono text-xs md:text-sm text-gray-200 mt-1 uppercase font-bold tracking-wide">
            {premioGanado.texto}
          </p>
        </div>
      )}

      {/* BOTÓN REINICIAR */}
      <button
        onClick={reiniciarRuleta}
        disabled={girando}
        className="mt-6 font-mono text-[11px] tracking-widest uppercase text-gray-500 hover:text-[#ff007f] transition-colors disabled:opacity-30 flex items-center gap-1.5"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reordenar premios
      </button>
    </div>
  );
}