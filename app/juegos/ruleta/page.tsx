// app/ruleta/page.tsx (o la ruta correspondiente a tu vista)
'use client';

import { useRuletaSimulada } from '@/lib/hooks/useRuletaSimulada';
import RuedaRuleta from '@/app/components/juegos/RuedaRuleta';
import { RotateCcw, Dices } from 'lucide-react';

export default function RuletaPage() {
  const { segmentos, rotacion, girando, premioGanado, girar, reiniciarRuleta } =
    useRuletaSimulada();

  // Guardamos la referencia del icono si hay un premio ganado
  const IconoPremio = premioGanado?.icono;

  return (
    <div className="px-5 pt-28 pb-16 md:px-10 min-h-screen max-w-4xl mx-auto flex flex-col items-center select-none">
      <h1 className="font-mono text-3xl md:text-5xl font-black text-white text-center mb-3 uppercase tracking-widest drop-shadow-[0_0_12px_#00f3ff]">
        🎡 La Ruleta Global
      </h1>

      <p className="text-center font-mono text-xs md:text-sm tracking-widest uppercase mb-10 text-gray-400">
        {girando ? '🎲 Girando...' : premioGanado ? '¡Mira tu resultado!' : 'Presiona girar 👇'}
      </p>

      <RuedaRuleta
        segmentos={segmentos}
        rotacion={rotacion}
        girando={girando}
        indiceGanador={premioGanado ? segmentos.findIndex(s => s.id === premioGanado.id) : null}
      />

      {/* Botón Principal de Girar */}
      <button
        onClick={girar}
        disabled={girando}
        className={`mt-10 font-mono font-black text-sm md:text-base tracking-widest uppercase px-10 py-3 rounded-xl border-2 transition-all duration-300 flex items-center gap-2 ${
          girando
            ? 'border-gray-800 text-gray-600 bg-[#060413]/40 cursor-not-allowed'
            : 'border-[#00f3ff] text-[#00f3ff] bg-[#00f3ff]/10 hover:bg-[#00f3ff]/20 hover:scale-105 shadow-[0_0_20px_rgba(0,243,255,0.4)]'
        }`}
      >
        <Dices className={`w-5 h-5 ${girando ? 'animate-spin' : ''}`} />
        {girando ? 'Girando...' : 'Girar la ruleta'}
      </button>

      {/* Banner de Resultado */}
      {premioGanado && !girando && (
        <div
          className={`mt-8 w-full max-w-sm rounded-2xl border-2 p-6 text-center animate-pulse flex flex-col items-center transition-all ${
            premioGanado.esGanador
              ? 'border-[#ffd700] bg-[#ffd700]/10 shadow-[0_0_30px_rgba(255,215,0,0.4)]'
              : 'border-[#ff007f]/60 bg-[#ff007f]/10 shadow-[0_0_20px_rgba(255,0,127,0.3)]'
          }`}
        >
          {/* Renderizado dinámico del icono de Lucide */}
          {IconoPremio && (
            <IconoPremio
              className={`w-12 h-12 mb-3 ${
                premioGanado.esGanador
                  ? 'text-[#ffd700] filter drop-shadow-[0_0_12px_#ffd700]'
                  : 'text-[#ff007f] filter drop-shadow-[0_0_8px_#ff007f]'
              }`}
            />
          )}

          <p className="font-mono font-black text-lg text-white uppercase tracking-wider">
            {premioGanado.esGanador ? '¡Ganaste!' : 'Casi...'}
          </p>
          <p className="font-mono text-sm text-gray-300 mt-1 uppercase font-bold">
            {premioGanado.texto}
          </p>
        </div>
      )}

      {/* Botón de Reiniciar */}
      <button
        onClick={reiniciarRuleta}
        disabled={girando}
        className="mt-6 font-mono text-xs tracking-widest uppercase text-gray-500 hover:text-[#ff007f] transition-colors disabled:opacity-30 flex items-center gap-1.5"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reordenar premios (simulación)
      </button>
    </div>
  );
}