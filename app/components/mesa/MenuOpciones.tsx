'use client';

import { useRouter } from 'next/navigation';

interface Props {
  juegosDesbloqueados: string[];
  numeroMesa: number;
  sessionId: string | null;
  pedirCancionActivo: boolean;
  // 🆕 Cupo de canciones
  cancionesRestantes: number;
  cancionesLimite: number;
  // ⚡ Subasta
  subastaActiva: boolean;
  onSelect: (seccion: 'juegos_privados' | 'votaciones' | 'cancion' | 'subasta') => void;
}

export default function MenuOpciones({ 
  juegosDesbloqueados, 
  numeroMesa, 
  sessionId, 
  pedirCancionActivo,
  cancionesRestantes,
  cancionesLimite,
  subastaActiva,
  onSelect 
}: Props) {
  const router = useRouter();

  const handleIrARuletaPremios = () => {
    router.push(`/juegos/ruleta?mesa=${numeroMesa}&sessionId=${sessionId}`);
  };

  const puedePedirCancion = pedirCancionActivo && cancionesRestantes > 0;

  return (
    <div className="grid grid-cols-2 gap-3 mt-1">
      {/* Tarjeta 1: Ruleta Bar */}
      <div className="p-4 bg-[#0a071e]/80 border border-purple-500/30 rounded-2xl flex flex-col justify-between">
        <div>
          <div className="text-2xl mb-1">🎰</div>
          <h3 className="font-orbitron font-bold text-xs text-purple-300">Ruleta Bar</h3>
          <p className="text- text-gray-400 mt-1">Participas automáticamente en vivo.</p>
        </div>
        <span className="text- text-cyan-400 font-mono mt-3">EN VIVO</span>
      </div>

      {/* Tarjeta 2: Juegos Privados */}
      <button onClick={() => onSelect('juegos_privados')} className="p-4 bg-[#0a071e]/80 border border-pink-500/30 hover:border-pink-500/70 rounded-2xl text-left flex flex-col justify-between transition-all active:scale-95">
        <div>
          <div className="text-2xl mb-1">🎮</div>
          <h3 className="font-orbitron font-bold text-xs text-pink-400">Juegos Privados</h3>
          <p className="text- text-gray-400 mt-1">Shots, verdad o reto para la mesa.</p>
        </div>
        <span className="text- text-pink-400 font-mono mt-3">ABRIR ➔</span>
      </button>

      {/* 🚨 CONDICIONAL: Ruleta de Premios (Solo si está desbloqueada) */}
      {juegosDesbloqueados.includes('ruleta-premios') && (
        <button
          onClick={handleIrARuletaPremios}
          className="col-span-2 p-4 bg-gradient-to-r from-[#ffd700]/20 to-[#ff8c00]/20 border-2 border-[#ffd700]/50 rounded-xl cursor-pointer hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] transition-all active:scale-95"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-[#ffd700] mb-1">🎰 Ruleta de Premios</h4>
              <p className="text-xs text-gray-400">¡Has ganado un turno! Gira y gana premios.</p>
            </div>
            <span className="text-[#ffd700] text-xl animate-pulse">✨</span>
          </div>
        </button>
      )}

      {/* Tarjeta 3: Votaciones */}
      <button onClick={() => onSelect('votaciones')} className="p-4 bg-[#0a071e]/80 border border-cyan-500/30 hover:border-cyan-500/70 rounded-2xl text-left flex flex-col justify-between transition-all active:scale-95">
        <div>
          <div className="text-2xl mb-1">🗳</div>
          <h3 className="font-orbitron font-bold text-xs text-cyan-300">Votaciones</h3>
          <p className="text- text-gray-400 mt-1">Vota música y eventos de la noche.</p>
        </div>
        <span className="text- text-cyan-400 font-mono mt-3">VOTAR ➔</span>
      </button>

      {/* Tarjeta 4: Pedir Canción (CON CONTADOR DE CUPO) */}
      <button 
        onClick={() => onSelect('cancion')}
        disabled={!puedePedirCancion}
        className={`p-4 bg-[#0a071e]/80 border rounded-2xl text-left flex flex-col justify-between transition-all active:scale-95 ${
          puedePedirCancion 
            ? 'border-purple-500/30 hover:border-purple-500/70 cursor-pointer' 
            : 'border-gray-800/50 opacity-50 cursor-not-allowed grayscale'
        }`}
      >
        <div>
          <div className="text-2xl mb-1">🎵</div>
          <h3 className="font-orbitron font-bold text-xs text-purple-300">Pedir Canción</h3>
          <p className="text- text-gray-400 mt-1">
            {!pedirCancionActivo
              ? '⛔ Desactivado por el DJ'
              : cancionesRestantes <= 0
                ? `⛔ Ya pediste tus ${cancionesLimite} canciones`
                : `Te quedan ${cancionesRestantes} de ${cancionesLimite}`}
          </p>
        </div>
        <span className={`text- font-mono mt-3 ${
          puedePedirCancion ? 'text-purple-400' : 'text-gray-500'
        }`}>
          {!pedirCancionActivo
            ? 'ESPERA...'
            : cancionesRestantes <= 0
              ? 'LÍMITE'
              : 'PEDIR ➔'}
        </span>
      </button>

      {/* ⚡ Tarjeta 5: Subasta - GRIS si no hay activa, NEÓN si el admin la activó */}
      <button
        onClick={() => subastaActiva && onSelect('subasta')}
        disabled={!subastaActiva}
        className={`col-span-2 p-4 rounded-2xl text-left flex flex-col justify-between transition-all active:scale-95 ${
          subastaActiva
            ? 'bg-[#0a071e]/80 border border-[#00f3ff]/50 shadow-[0_0_20px_rgba(0,243,255,0.25)] cursor-pointer hover:border-[#00f3ff]'
            : 'bg-[#0a071e]/40 border border-gray-800/50 opacity-50 cursor-not-allowed grayscale'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <div>
            <div className="text-2xl mb-1">⚡</div>
            <h3 className={`font-orbitron font-bold text-xs ${subastaActiva ? 'text-[#00f3ff]' : 'text-gray-500'}`}>Subasta</h3>
            <p className="text- text-gray-400 mt-1">
              {subastaActiva ? '¡Botella en vivo! Pujá y ganala.' : 'Próximamente - el admin la activa'}
            </p>
          </div>
          <span className={`text- font-mono ${subastaActiva ? 'text-[#ff00a0] animate-pulse' : 'text-gray-500'}`}>
            {subastaActiva ? 'EN VIVO ➔' : 'INACTIVA'}
          </span>
        </div>
      </button>
    </div>
  );
}