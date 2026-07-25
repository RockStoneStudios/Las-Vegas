'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
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

  // Buscamos la carta elegida por el usuario
  const cartaElegida = cartas.find((c) => c.revelada);

  // 🎊 EFECTO DE CONFETI AL GANAR
  useEffect(() => {
    if (cartaElegida && cartaElegida.premio?.esGanador) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00ff66', '#00f3ff', '#ffee00', '#ff00a0'],
      });
    }
  }, [cartaElegida]);

  return (
    <div className="px-4 pt-28 pb-16 md:px-8 min-h-screen max-w-6xl mx-auto select-none">
      <div className="flex justify-center mb-6">
        <span className="font-orbitron font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border border-[#2ee6d6]/40 bg-[#0c0824] text-[#2ee6d6] shadow-[0_0_12px_rgba(46,230,214,0.3)]">
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

        /* 🔄 Animación de Flotación para cartas */
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: floatCard 3.5s ease-in-out infinite;
        }

        /* 3D Flip Setup */
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

      <h1 className="font-orbitron text-3xl md:text-5xl font-black text-[#00ff66] text-center mb-3 uppercase tracking-widest animacion-corto-verde">
        El Dilema de las Vegas
      </h1>

      {!activa && (
        <div className="mb-6 p-4 rounded-xl border border-[#ff00a0]/50 bg-[#ff00a0]/10 text-center font-space text-xs md:text-sm text-[#ff00a0] backdrop-blur-md animate-pulse">
          {!esJuegoActivo ? (
            <p>⚠️ El juego <strong>El Dilema de las Vegas</strong> no ha sido activado por el DJ.</p>
          ) : (
            <p>⚠️ El juego está activo para la <strong>Mesa {estado.mesaObjetivo}</strong>. Tú estás en la Mesa {numeroMesa}.</p>
          )}
        </div>
      )}

      {/* 🏆 AVISO DEL PREMIO SELECCIONADO (UBICADO ARRIBA) */}
      {cartaElegida ? (
        <div className="mb-8 p-5 rounded-2xl border-2 border-[#2ee6d6] bg-[#0c0824]/90 text-center shadow-[0_0_30px_rgba(46,230,214,0.4)] animate-bounce backdrop-blur-md max-w-xl mx-auto">
          <p className="font-space font-bold text-xs uppercase tracking-widest text-[#2ee6d6] mb-1">
            Elegiste la Carta #{cartaElegida.index + 1}
          </p>
          <div className="flex items-center justify-center gap-3 text-2xl md:text-3xl font-orbitron font-black text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
            <span className="text-3xl md:text-4xl">{cartaElegida.premio?.emoji}</span>
            <span>{cartaElegida.premio?.texto}</span>
          </div>
        </div>
      ) : (
        <p className="text-center font-space text-xs md:text-sm tracking-widest uppercase mb-8 text-gray-400">
          {todasReveladas
            ? '🎉 ¡Ya se revelaron todos los premios!'
            : activa
            ? 'Elige una carta para probar tu suerte 👇'
            : 'Bloqueado hasta que sea el turno de tu mesa'}
        </p>
      )}

      {/* Grid de Cartas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6 perspective-1000">
        {cartas.map((carta) => (
          <CartaVoltea
            key={carta.index}
            carta={carta}
            activa={activa}
            onClick={() => revelarCarta(carta.index)}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 mt-12">
        <button
          onClick={reiniciarRuleta}
          className="font-space font-bold text-xs md:text-sm tracking-widest uppercase px-6 py-2.5 rounded-xl border border-[#ff00a0]/40 text-[#ff00a0] bg-[#060413]/60 hover:bg-[#ff00a0]/15 hover:border-[#ff00a0] hover:shadow-[0_0_15px_rgba(255,0,160,0.4)] transition-all duration-300 cursor-pointer"
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
    <div
      onClick={puedeClicar ? onClick : undefined}
      className={`relative w-full aspect-[2/3] transition-transform duration-500 transform-style-3d select-none ${
        carta.revelada ? 'rotate-y-180' : ''
      } ${
        puedeClicar
          ? 'cursor-pointer hover:-translate-y-2 hover:scale-105 active:scale-95 animate-float'
          : 'cursor-not-allowed'
      }`}
      style={{ animationDelay: `${carta.index * 0.15}s` }}
    >
      {/* 🔴 REVERSO DE LA CARTA (CARA OCULTA) */}
      <div
        className={`absolute inset-0 rounded-2xl border-2 backface-hidden p-3 flex flex-col items-center justify-between overflow-hidden backdrop-blur-md transition-all duration-300 ${
          puedeClicar
            ? 'border-[#ff00a0] bg-gradient-to-b from-[#18082a] via-[#080516] to-[#03010a] shadow-[0_0_20px_rgba(255,0,160,0.4)] hover:shadow-[0_0_35px_rgba(255,0,160,0.8)] hover:border-[#00f3ff]'
            : 'border-gray-800 bg-[#060413]/40 opacity-30'
        }`}
      >
        {/* Trama cibernética de fondo */}
        <div className="absolute inset-0 bg-[radial-gradient(#ff00a0_1px,transparent_1px)] bg-[size:10px_10px] opacity-20 pointer-events-none" />

        {/* Borde interior neón */}
        <div className="w-full h-full rounded-xl border border-dashed border-[#ff00a0]/40 flex flex-col items-center justify-between p-2 relative z-10">
          <span className="font-orbitron text-xs font-bold text-[#ff00a0] tracking-widest opacity-80">
            #{carta.index + 1}
          </span>

          <div className="relative flex items-center justify-center">
            <div className="absolute w-12 h-12 rounded-full bg-[#ff00a0]/20 blur-md animate-ping" />
            <span className="text-4xl md:text-5xl filter drop-shadow-[0_0_12px_#ff00a0]">🎴</span>
          </div>

          <span className="font-orbitron text-xs md:text-sm font-black text-[#00f3ff] uppercase tracking-wider text-center leading-none drop-shadow-[0_0_8px_#00f3ff]">
            LAS VEGAS
          </span>
        </div>
      </div>

      {/* 🟢 FRENTE DE LA CARTA (CARA REVELADA) */}
      <div
        className={`absolute inset-0 rounded-2xl border-2 backface-hidden rotate-y-180 p-3 flex flex-col items-center justify-center gap-3 text-center overflow-hidden backdrop-blur-md ${
          carta.premio?.esGanador
            ? 'border-[#00ff66] bg-gradient-to-b from-[#0a2618] via-[#05140d] to-[#020a06] shadow-[0_0_25px_rgba(0,255,102,0.5)]'
            : 'border-gray-700 bg-gradient-to-b from-[#1a1824] via-[#0d0c14] to-[#050508] shadow-[0_0_15px_rgba(255,255,255,0.1)] opacity-70'
        }`}
      >
        {/* Destello de fondo si es ganador */}
        {carta.premio?.esGanador && (
          <div className="absolute inset-0 bg-radial from-[#00ff66]/20 via-transparent to-transparent blur-xl animate-pulse" />
        )}

        <span className="text-4xl md:text-5xl filter drop-shadow-[0_0_12px_currentColor] relative z-10">
          {carta.premio?.emoji}
        </span>

        <span
          className={`font-orbitron text-xs md:text-sm font-black uppercase leading-tight relative z-10 ${
            carta.premio?.esGanador
              ? 'text-[#00ff66] drop-shadow-[0_0_10px_#00ff66]'
              : 'text-gray-300'
          }`}
        >
          {carta.premio?.texto}
        </span>
      </div>
    </div>
  );
}