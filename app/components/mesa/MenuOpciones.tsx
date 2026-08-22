'use client';

import { useRouter } from 'next/navigation';

interface Props {
  juegosDesbloqueados: string[];
  numeroMesa: number;
  sessionId: string | null;
  pedirCancionActivo: boolean; // ✅ NUEVO
  onSelect: (seccion: 'juegos_privados' | 'votaciones' | 'cancion') => void;
}

export default function MenuOpciones({ 
  juegosDesbloqueados, 
  numeroMesa, 
  sessionId, 
  pedirCancionActivo, // ✅ RECIBIMOS EL ESTADO
  onSelect 
}: Props) {
  const router = useRouter();

  const handleIrARuletaPremios = () => {
    router.push(`/juegos/ruleta?mesa=${numeroMesa}&sessionId=${sessionId}`);
  };

  return (
    <div className="grid grid-cols-2 gap-3 mt-1">
      {/* Tarjeta 1: Ruleta Bar */}
      <div className="p-4 bg-[#0a071e]/80 border border-purple-500/30 rounded-2xl flex flex-col justify-between">
        <div>
          <div className="text-2xl mb-1">🎰</div>
          <h3 className="font-orbitron font-bold text-xs text-purple-300">Ruleta Bar</h3>
          <p className="text-[10px] text-gray-400 mt-1">Participas automáticamente en vivo.</p>
        </div>
        <span className="text-[9px] text-cyan-400 font-mono mt-3">EN VIVO</span>
      </div>

      {/* Tarjeta 2: Juegos Privados */}
      <button onClick={() => onSelect('juegos_privados')} className="p-4 bg-[#0a071e]/80 border border-pink-500/30 hover:border-pink-500/70 rounded-2xl text-left flex flex-col justify-between transition-all active:scale-95">
        <div>
          <div className="text-2xl mb-1">🎮</div>
          <h3 className="font-orbitron font-bold text-xs text-pink-400">Juegos Privados</h3>
          <p className="text-[10px] text-gray-400 mt-1">Shots, verdad o reto para la mesa.</p>
        </div>
        <span className="text-[9px] text-pink-400 font-mono mt-3">ABRIR ➔</span>
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
          <div className="text-2xl mb-1">🗳️</div>
          <h3 className="font-orbitron font-bold text-xs text-cyan-300">Votaciones</h3>
          <p className="text-[10px] text-gray-400 mt-1">Vota música y eventos de la noche.</p>
        </div>
        <span className="text-[9px] text-cyan-400 font-mono mt-3">VOTAR ➔</span>
      </button>

      {/* Tarjeta 4: Pedir Canción (CON DESHABILITACIÓN) */}
      <button 
        onClick={() => onSelect('cancion')}
        disabled={!pedirCancionActivo}
        className={`p-4 bg-[#0a071e]/80 border rounded-2xl text-left flex flex-col justify-between transition-all active:scale-95 ${
          pedirCancionActivo 
            ? 'border-purple-500/30 hover:border-purple-500/70 cursor-pointer' 
            : 'border-gray-800/50 opacity-50 cursor-not-allowed grayscale'
        }`}
      >
        <div>
          <div className="text-2xl mb-1">🎵</div>
          <h3 className="font-orbitron font-bold text-xs text-purple-300">Pedir Canción</h3>
          <p className="text-[10px] text-gray-400 mt-1">
            {pedirCancionActivo ? 'Sugerencias directo al DJ.' : '⛔ Desactivado por el DJ'}
          </p>
        </div>
        <span className={`text-[9px] font-mono mt-3 ${pedirCancionActivo ? 'text-purple-400' : 'text-gray-500'}`}>
          {pedirCancionActivo ? 'PEDIR ➔' : 'ESPERA...'}
        </span>
      </button>
    </div>
  );
}