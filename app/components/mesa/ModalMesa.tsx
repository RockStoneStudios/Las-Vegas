'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  seccionActiva: 'inicio' | 'juegos_privados' | 'votaciones' | 'cancion' | 'ruleta-premios';
  onClose: () => void;
  juegosDesbloqueados: string[];
  numeroMesa: number;
  sessionId: string | null;
  votacionActiva: any;
  tiempoRestante: number;
  yaVoto: boolean;
  onVotar: (id: number) => void;
  // 🎁 Nueva prop para la ruleta de premios
  premiosRuleta: any[];
  // 🎵 Nuevas props para el modal de canción
  cancionInput: string;
  setCancionInput: (val: string) => void;
  autorInput: string;
  setAutorInput: (val: string) => void;
  onEnviarCancion: () => void;
}

export default function ModalesMesa({ 
  seccionActiva, onClose, juegosDesbloqueados, numeroMesa, sessionId, votacionActiva, tiempoRestante, yaVoto, onVotar,
  premiosRuleta,
  cancionInput, setCancionInput, autorInput, setAutorInput, onEnviarCancion
}: Props) {
  const router = useRouter();
  const [girando, setGirando] = useState(false);

  // 🎁 MODAL RULETA DE PREMIOS (NUEVO)
  if (seccionActiva === 'ruleta-premios') {
    return (
      <div className="fixed inset-0 z-50 bg-[#020106]/95 backdrop-blur-lg p-6 flex flex-col justify-between animate-fadeIn">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-orbitron font-black text-lg text-[#ffd700]">🎰 RULETA DE PREMIOS</h2>
            <button onClick={onClose} className="text-gray-400 text-sm font-bold">✕ Cerrar</button>
          </div>

          <div className="p-4 bg-[#0d0722] border border-[#ffd700]/30 rounded-xl text-center">
            <p className="text-xs text-gray-400 mb-4">
              ¡Felicidades! Tu mesa fue seleccionada. Tienes la oportunidad de girar la ruleta y ganar un premio.
            </p>

            {/* Mostrar lista de premios si existen */}
            {premiosRuleta.length > 0 && (
              <div className="flex justify-center flex-wrap gap-2 mb-4">
                {premiosRuleta.map((premio, idx) => (
                  <span key={idx} className="px-3 py-1 bg-[#1f1645] border border-[#ffd700]/30 rounded-full text-[10px] text-[#ffd700] font-bold">
                    {premio.nombre || premio.icono}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setGirando(true);
                router.push(`/juegos/ruleta?mesa=${numeroMesa}&sessionId=${sessionId}`);
              }}
              disabled={girando}
              className="w-full py-3 bg-gradient-to-r from-[#ffd700] to-[#ff8c00] rounded-xl font-orbitron font-black text-xs text-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_35px_rgba(255,215,0,0.8)] transition-all active:scale-95"
            >
              {girando ? 'Cargando...' : '🎁 ¡GIRAR AHORA!'}
            </button>
          </div>
        </div>
        <button onClick={onClose} className="w-full py-3 bg-[#1f1645] rounded-xl text-xs font-bold uppercase">Volver</button>
      </div>
    );
  }

  // MODAL JUEGOS PRIVADOS
  if (seccionActiva === 'juegos_privados') {
    return (
      <div className="fixed inset-0 z-50 bg-[#020106]/95 backdrop-blur-lg p-6 flex flex-col justify-between animate-fadeIn">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-orbitron font-black text-lg text-pink-400">🎮 JUEGOS PRIVADOS</h2>
            <button onClick={onClose} className="text-gray-400 text-sm font-bold">✕ Cerrar</button>
          </div>
          <div className="grid gap-3">
            {/* Juegos base */}
            <div className="p-4 bg-[#0d0722] border border-pink-500/30 rounded-xl">
              <h4 className="font-bold text-sm text-white mb-1">🎲 Ruleta de Shots</h4>
              <p className="text-xs text-gray-400">Gira en tu mesa para definir quién toma el siguiente shot.</p>
            </div>
            <div className="p-4 bg-[#0d0722] border border-purple-500/30 rounded-xl">
              <h4 className="font-bold text-sm text-white mb-1">🔥 Verdad o Reto</h4>
              <p className="text-xs text-gray-400">Retos exclusivos para jugar con tus amigos.</p>
            </div>
            
            {/* 🚨 RULETA DE PREMIOS */}
            {juegosDesbloqueados.includes('ruleta-premios') && (
              <button
                onClick={() => router.push(`/juegos/ruleta?mesa=${numeroMesa}&sessionId=${sessionId}`)}
                className="p-4 bg-gradient-to-r from-[#ffd700]/20 to-[#ff8c00]/20 border-2 border-[#ffd700]/50 rounded-xl cursor-pointer hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] transition-all active:scale-95 text-left"
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

            {/* 🎰 SLOT MACHINE (NUEVO) */}
            {juegosDesbloqueados.includes('slot') && (
              <button
                onClick={() => router.push(`/juegos/slot?mesa=${numeroMesa}&sessionId=${sessionId}`)}
                className="p-4 bg-linear-to-r from-[#00f3ff]/20 to-[#ff00a0]/20 border-2 border-[#00f3ff]/50 rounded-xl cursor-pointer hover:shadow-[0_0_30px_rgba(0,243,255,0.3)] transition-all active:scale-95 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#00f3ff] mb-1">🎰 Slot Machine</h4>
                    <p className="text-xs text-gray-400">¡Gira los rodillos y gana premios!</p>
                  </div>
                  <span className="text-[#00f3ff] text-xl animate-pulse">🎲</span>
                </div>
              </button>
            )}
          </div>
        </div>
        <button onClick={onClose} className="w-full py-3 bg-[#1f1645] rounded-xl text-xs font-bold uppercase">Volver</button>
      </div>
    );
  }

  // MODAL VOTACIONES
  if (seccionActiva === 'votaciones') {
    return (
      <div className="fixed inset-0 z-50 bg-[#020106]/95 backdrop-blur-lg p-6 flex flex-col justify-between animate-fadeIn">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-orbitron font-black text-lg text-cyan-400">🗳️ VOTACIÓN EN VIVO</h2>
            <button onClick={onClose} className="text-gray-400 text-sm font-bold">✕ Cerrar</button>
          </div>
          {votacionActiva ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-white font-orbitron text-base font-bold">{votacionActiva.pregunta}</h3>
                <p className="text-[#00f3ff] font-space text-xs mt-1">⏱️ {tiempoRestante}s restantes</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {votacionActiva.opciones.map((op: any) => (
                  <button
                    key={op.id}
                    onClick={() => onVotar(op.id)}
                    disabled={yaVoto}
                    className={`relative bg-[#0a0720] border rounded-xl p-4 overflow-hidden transition-all active:scale-95 ${
                      yaVoto ? 'border-gray-600 cursor-default opacity-70' : 'border-cyan-500/40 hover:border-cyan-500/80 cursor-pointer'
                    }`}
                  >
                    <div className="relative z-10 text-left">
                      <p className="text-white font-space text-sm font-bold">{op.texto}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center">No hay votación activa en este momento</p>
          )}
        </div>
        <button onClick={onClose} className="w-full py-3 bg-[#1f1645] rounded-xl text-xs font-bold uppercase">Volver</button>
      </div>
    );
  }

  // MODAL CANCIÓN (ACTUALIZADO CON CONEXIÓN REAL)
  if (seccionActiva === 'cancion') {
    return (
      <div className="fixed inset-0 z-50 bg-[#020106]/95 backdrop-blur-lg p-6 flex flex-col justify-between animate-fadeIn">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-orbitron font-black text-lg text-purple-400">🎵 PEDIR CANCIÓN</h2>
            <button onClick={onClose} className="text-gray-400 text-sm font-bold">✕ Cerrar</button>
          </div>
          <div className="p-4 bg-[#0d0722] border border-purple-500/30 rounded-xl">
            <p className="text-xs text-gray-400 mb-3">Escribe la canción que quieres escuchar:</p>
            
            <input 
              type="text" 
              value={cancionInput}
              onChange={(e) => setCancionInput(e.target.value)}
              placeholder="Ej: Bohemian Rhapsody" 
              className="w-full bg-[#0a0720] border border-[#1f1645] rounded-xl px-4 py-3 text-white text-sm font-space focus:outline-none focus:border-purple-500" 
            />
            
            <input 
              type="text" 
              value={autorInput}
              onChange={(e) => setAutorInput(e.target.value)}
              placeholder="Ej: Queen" 
              className="w-full mt-2 bg-[#0a0720] border border-[#1f1645] rounded-xl px-4 py-3 text-white text-sm font-space focus:outline-none focus:border-purple-500" 
            />

            <button 
              onClick={onEnviarCancion}
              className="w-full mt-3 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-orbitron font-black text-xs text-white uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all active:scale-95"
            >
              Enviar Sugerencia
            </button>
          </div>
        </div>
        <button onClick={onClose} className="w-full py-3 bg-[#1f1645] rounded-xl text-xs font-bold uppercase">Volver</button>
      </div>
    );
  }

  return null;
}