'use client';

import { useCincoCajones } from '@/lib/hooks/useCincoCajones';
import { useMesa } from '@/lib/context/MesaContext';
import { useSimulacionJuego } from '@/lib/context/PanelControlContext';
import type { CartaRuleta } from '@/lib/types/cajones';

export default function CajonesPage() {
  const { numeroMesa } = useMesa();
  const { estado } = useSimulacionJuego();
  const { cartas, todasReveladas, revelarCarta, reiniciarRuleta } = useCincoCajones();

  const esJuegoActivo = String(estado.juegoActivo) === 'cajones';
  const esParaMiMesa = Number(estado.mesaObjetivo) === Number(numeroMesa);
  const activa = esJuegoActivo && esParaMiMesa;

  // 1. Buscamos la primera carta que el usuario ya haya destapado/elegido
  const cartaElegida = cartas.find((c) => c.revelada);

  return (
    /* 💡 Ampliado a max-w-5xl para dar espacio cómodo a las 6 cartas */
    <div className="px-5 pt-28 pb-16 md:px-10 min-h-screen max-w-5xl mx-auto">
      <div className="flex justify-center mb-6">
        <span className="font-orbitron font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border border-[#2ee6d6]/40 bg-[#0c0824] text-[#2ee6d6] shadow-[0_0_10px_rgba(46,230,214,0.2)]">
          📍 Tu Mesa: <strong className="text-white">#{numeroMesa ?? 'Sin Asignar'}</strong>
        </span>
      </div>

      <style jsx global>{`
        @keyframes cortocircuitoVerde {
          0%, 18%, 22%, 25%, 53%, 57%, 100% {
            opacity: 1;
            text-shadow: 0 0 10px #10b981, 0 0 20px #10b981, 0 0 40px #00ff66;
          }
          20%, 24%, 55% {
            opacity: 0.3;
            text-shadow: none;
          }
        }
        .animacion-corto-verde {
          animation: cortocircuitoVerde 3.9s infinite;
        }
      `}</style>

      <h1 className="font-orbitron text-3xl md:text-5xl font-black text-[#00ff66] text-center mb-3 uppercase tracking-widest animacion-corto-verde">
        El Dilema de las Vegas
      </h1>

      {!activa && (
        <div className="mb-8 p-4 rounded-xl border border-[#ff00a0]/50 bg-[#ff00a0]/10 text-center font-space text-xs md:text-sm text-[#ff00a0] backdrop-blur-md animate-pulse">
          {!esJuegoActivo ? (
            <p>⚠️ El juego <strong>El Dilema de las Vegas</strong> no ha sido activado por el DJ.</p>
          ) : (
            <p>⚠️ El juego está activo para la <strong>Mesa {estado.mesaObjetivo}</strong>. Tú estás en la Mesa {numeroMesa}.</p>
          )}
        </div>
      )}

      <p className="text-center font-space text-xs md:text-sm tracking-widest uppercase mb-10 text-gray-400">
        {todasReveladas
          ? '🎉 ¡Ya se revelaron todos los premios!'
          : activa
          ? 'Elige una carta para probar tu suerte 👇'
          : 'Bloqueado hasta que sea el turno de tu mesa'}
      </p>

      {/* 💡 CAMBIO AQUÍ: md:grid-cols-6 ahora renderiza 6 cartas por fila en pantallas medianas y grandes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {cartas.map((carta) => (
          <CartaVoltea
            key={carta.index}
            carta={carta}
            activa={activa}
            onClick={() => revelarCarta(carta.index)}
          />
        ))}
      </div>

      {/* AVISO ABAJO */}
      {cartaElegida && (
        <div className="mt-8 p-6 rounded-2xl border-2 border-[#2ee6d6] bg-[#0c0824]/90 text-center shadow-[0_0_25px_rgba(46,230,214,0.3)] animate-bounce">
          <p className="font-space font-bold text-xs uppercase tracking-widest text-[#2ee6d6] mb-1">
            Elegiste la Carta #{cartaElegida.index + 1}
          </p>
          <div className="flex items-center justify-center gap-2 text-2xl font-orbitron font-black text-white uppercase">
            <span>{cartaElegida.premio?.emoji}</span>
            <span>{cartaElegida.premio?.texto}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-3 mt-10">
        <button
          onClick={reiniciarRuleta}
          className="font-space font-bold text-xs md:text-sm tracking-widest uppercase px-6 py-2.5 rounded-xl border border-[#ff00a0]/40 text-[#ff00a0] bg-[#060413]/60 hover:bg-[#ff00a0]/10 hover:border-[#ff00a0] transition-all duration-300 cursor-pointer"
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
      className={`aspect-3/4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 p-3 text-center transition-all duration-300 select-none ${
        carta.revelada
          ? carta.premio?.esGanador
            ? 'border-[#2ee6d6] bg-[#2ee6d6]/10 shadow-[0_0_20px_rgba(46,230,214,0.35)]'
            : 'border-gray-600 bg-[#060413]/60 opacity-60'
          : puedeClicar
          ? 'border-[#ff00a0] bg-[#060413]/90 shadow-[0_0_15px_rgba(255,0,160,0.3)] hover:scale-105 active:scale-95 cursor-pointer animate-pulse'
          : 'border-gray-800 bg-[#060413]/40 opacity-30 cursor-not-allowed'
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