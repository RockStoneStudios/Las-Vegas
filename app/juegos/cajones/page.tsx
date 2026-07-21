'use client';

import { useRuletaSimulada } from '@/lib/hooks/useCincoCajones';
import type { CartaRuleta } from '@/lib/types/cajones';

export default function RuletaPage() {
  const { cartas, activa, todasReveladas, revelarCarta, reiniciarRuleta } = useRuletaSimulada();

  return (
    <div className="px-5 pt-28 pb-16 md:px-10 min-h-screen max-w-4xl mx-auto">
      <h1 className="font-orbitron text-3xl md:text-5xl font-black text-white text-center mb-3 uppercase tracking-widest">
        🎡 La Ruleta Global
      </h1>

      <p className="text-center font-space text-xs md:text-sm tracking-widest uppercase mb-10 text-gray-400">
        {todasReveladas ? '🎉 ¡Ya se revelaron todos los premios!' : 'Elige una tarjeta 👇'}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {cartas.map((carta) => (
          <CartaVoltea
            key={carta.index}
            carta={carta}
            activa={activa}
            onClick={() => revelarCarta(carta.index)}
          />
        ))}
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={reiniciarRuleta}
          className="font-space font-bold text-xs md:text-sm tracking-widest uppercase px-6 py-2.5 rounded-xl border border-[#ff00a0]/40 text-[#ff00a0] bg-[#060413]/60 hover:bg-[#ff00a0]/10 hover:border-[#ff00a0] transition-all duration-300"
        >
          🔄 Reiniciar ronda (simulación)
        </button>
      </div>
    </div>
  );
}

function CartaVoltea({
  carta,
  activa,
  onClick,
}: {
  carta: CartaRuleta;
  activa: boolean;
  onClick: () => void;
}) {
  const puedeClicar = activa && !carta.revelada;

  return (
    <button
      onClick={onClick}
      disabled={!puedeClicar}
      className={`aspect-[3/4] rounded-2xl border-2 flex flex-col items-center justify-center gap-2 p-3 text-center transition-all duration-300 ${
        carta.revelada
          ? carta.premio?.esGanador
            ? 'border-[#2ee6d6] bg-[#2ee6d6]/10 shadow-[0_0_20px_rgba(46,230,214,0.35)]'
            : 'border-gray-600 bg-[#060413]/60 opacity-60'
          : puedeClicar
          ? 'border-[#ff00a0]/50 bg-[#060413]/80 hover:border-[#ff00a0] hover:scale-105 cursor-pointer'
          : 'border-gray-700 bg-[#060413]/40 opacity-40 cursor-not-allowed'
      }`}
    >
      {carta.revelada ? (
        <>
          <span className="text-3xl">{carta.premio?.emoji}</span>
          <span className="font-space text-xs font-bold text-white uppercase leading-tight">
            {carta.premio?.texto}
          </span>
        </>
      ) : (
        <span className="text-4xl">🎴</span>
      )}
    </button>
  );
}