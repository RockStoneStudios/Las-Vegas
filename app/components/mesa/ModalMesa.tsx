'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  seccionActiva: 'inicio' | 'juegos_privados' | 'votaciones' | 'cancion' | 'ruleta-premios' | 'subasta';
  onClose: () => void;
  juegosDesbloqueados: string[];
  numeroMesa: number;
  sessionId: string | null;
  votacionActiva: any;
  tiempoRestante: number;
  yaVoto: boolean;
  onVotar: (id: number) => void;
  premiosRuleta: any[];
  cancionInput: string;
  setCancionInput: (val: string) => void;
  autorInput: string;
  setAutorInput: (val: string) => void;
  onEnviarCancion: () => void;
  cancionesUsadas: number;
  cancionesLimite: number;
  cancionesRestantes: number;
  // ⚡ Subasta
  subasta?: any;
  montoPuja?: string;
  setMontoPuja?: (val: string) => void;
  onPujar?: () => void;
}

export default function ModalesMesa({ 
  seccionActiva, onClose, juegosDesbloqueados, numeroMesa, sessionId, votacionActiva, tiempoRestante, yaVoto, onVotar,
  premiosRuleta,
  cancionInput, setCancionInput, autorInput, setAutorInput, onEnviarCancion,
  cancionesUsadas, cancionesLimite, cancionesRestantes,
  subasta, montoPuja, setMontoPuja, onPujar,
}: Props) {
  const router = useRouter();
  const [girando, setGirando] = useState(false);

  // ⚡ MODAL SUBASTA
  if (seccionActiva === 'subasta') {
    if (!subasta) {
      return (
        <div className="fixed inset-0 z-50 bg-[#020106]/95 backdrop-blur-lg p-6 flex flex-col justify-between animate-fadeIn">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-orbitron font-black text-lg text-[#00f3ff]">⚡ SUBASTA</h2>
              <button onClick={onClose} className="text-gray-400 text-sm font-bold">✕ Cerrar</button>
            </div>
            <p className="text-gray-400 text-center text-sm">No hay subasta activa en este momento</p>
          </div>
          <button onClick={onClose} className="w-full py-3 bg-[#1f1645] rounded-xl text-xs font-bold uppercase">Volver</button>
        </div>
      );
    }

    const soyGanador = subasta.mesaGanadora === numeroMesa;

    return (
      <div className="fixed inset-0 z-50 bg-[#020106]/95 backdrop-blur-lg p-6 flex flex-col justify-between animate-fadeIn">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-orbitron font-black text-lg text-[#00f3ff] drop-shadow-[0_0_10px_#00f3ff]">⚡ SUBASTA EN VIVO</h2>
            <button onClick={onClose} className="text-gray-400 text-sm font-bold">✕ Cerrar</button>
          </div>

          <div className="p-4 bg-[#0d0722] border border-[#00f3ff]/40 rounded-xl shadow-[0_0_25px_rgba(0,243,255,0.15)]">
            <p className="text- text-[#00f3ff] font-space tracking-widest">TERMINA {subasta.cierraA} • MESA #{numeroMesa}</p>
            <h3 className="text-white font-orbitron font-bold text-xl mt-2">{subasta.producto}</h3>
            <p className="text-gray-400 font-space text-xs mt-1">{subasta.descripcion}</p>

            <div className="text-center my-4">
              <p className="text- text-gray-400 font-space">PRECIO ACTUAL</p>
              <p className="text-4xl font-orbitron font-black text-[#ffe600] drop-shadow-[0_0_15px_#ffe600]">${subasta.precioActual?.toLocaleString()}</p>
              <p className="text-xs font-space mt-2">
                {subasta.mesaGanadora
                  ? soyGanador
                    ? <span className="text-[#00f3ff] font-bold">🏆 ¡VAS GANANDO TÚ!</span>
                    : <span className="text-white">Va ganando Mesa <span className="text-[#ff00a0] font-bold">{subasta.mesaGanadora}</span></span>
                  : <span className="text-gray-400">Sin pujas todavía</span>}
              </p>
            </div>

            {/* Últimas pujas */}
            {subasta.pujas?.length > 0 && (
              <div className="space-y-1 border-t border-[#1f1645] pt-3 mb-4">
                {subasta.pujas.slice(-3).reverse().map((p: any, i: number) => (
                  <p key={i} className="text- font-space text-zinc-300">Mesa {p.mesa} → <span className="text-[#00f3ff]">${p.monto?.toLocaleString()}</span></p>
                ))}
              </div>
            )}

            <label className="text-xs text-gray-400 font-space block mb-1">Tu puja (debe ser mayor a ${subasta.precioActual?.toLocaleString()})</label>
            <input
              type="number"
              value={montoPuja || ''}
              onChange={(e) => setMontoPuja?.(e.target.value)}
              className="w-full bg-[#0a0720] border border-[#1f1645] rounded-xl px-4 py-3 text-white text-lg font-space font-bold focus:outline-none focus:border-[#00f3ff] focus:shadow-[0_0_15px_rgba(0,243,255,0.3)]"
            />

            <div className="flex gap-2 mt-3">
              {[10000, 20000, 50000].map((extra) => (
                <button
                  key={extra}
                  onClick={() => setMontoPuja?.(String(subasta.precioActual + extra))}
                  className="flex-1 py-2 bg-[#1f1645] border border-[#00f3ff]/30 rounded-lg text- font-space text-[#00f3ff]"
                >
                  +${extra.toLocaleString()}
                </button>
              ))}
            </div>

            <button
              onClick={onPujar}
              className="w-full mt-4 py-3 bg-gradient-to-r from-[#00f3ff] to-[#ff00a0] rounded-xl font-orbitron font-black text-sm text-white uppercase tracking-widest shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_35px_rgba(255,0,160,0.7)] transition-all active:scale-95"
            >
              🔥 PUJAR ${Number(montoPuja || 0).toLocaleString()}
            </button>
          </div>
        </div>
        <button onClick={onClose} className="w-full py-3 bg-[#1f1645] rounded-xl text-xs font-bold uppercase">Volver</button>
      </div>
    );
  }

  // 🎁 MODAL RULETA DE PREMIOS
  if (seccionActiva === 'ruleta-premios') {
    return (
      <div className="fixed inset-0 z-50 bg-[#020106]/95 backdrop-blur-lg p-6 flex flex-col justify-between animate-fadeIn">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-orbitron font-black text-lg text-[#ffd700]">🎰 RULETA DE PREMIOS</h2>
            <button onClick={onClose} className="text-gray-400 text-sm font-bold">✕ Cerrar</button>
          </div>
          <div className="p-4 bg-[#0d0722] border border-[#ffd700]/30 rounded-xl text-center">
            <p className="text-xs text-gray-400 mb-4">¡Felicidades! Tu mesa fue seleccionada. Tienes la oportunidad de girar la ruleta y ganar un premio.</p>
            {premiosRuleta.length > 0 && (
              <div className="flex justify-center flex-wrap gap-2 mb-4">
                {premiosRuleta.map((premio, idx) => (
                  <span key={idx} className="px-3 py-1 bg-[#1f1645] border border-[#ffd700]/30 rounded-full text- text-[#ffd700] font-bold">{premio.nombre || premio.icono}</span>
                ))}
              </div>
            )}
            <button onClick={() => { setGirando(true); router.push(`/juegos/ruleta?mesa=${numeroMesa}&sessionId=${sessionId}`); }} disabled={girando} className="w-full py-3 bg-gradient-to-r from-[#ffd700] to-[#ff8c00] rounded-xl font-orbitron font-black text-xs text-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_35px_rgba(255,215,0,0.8)] transition-all active:scale-95">
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
            <div className="p-4 bg-[#0d0722] border border-pink-500/30 rounded-xl">
              <h4 className="font-bold text-sm text-white mb-1">🎲 Ruleta de Shots</h4>
              <p className="text-xs text-gray-400">Gira en tu mesa para definir quién toma el siguiente shot.</p>
            </div>
            <div className="p-4 bg-[#0d0722] border border-purple-500/30 rounded-xl">
              <h4 className="font-bold text-sm text-white mb-1">🔥 Verdad o Reto</h4>
              <p className="text-xs text-gray-400">Retos exclusivos para jugar con tus amigos.</p>
            </div>
            {juegosDesbloqueados.includes('ruleta-premios') && (
              <button onClick={() => router.push(`/juegos/ruleta?mesa=${numeroMesa}&sessionId=${sessionId}`)} className="p-4 bg-gradient-to-r from-[#ffd700]/20 to-[#ff8c00]/20 border-2 border-[#ffd700]/50 rounded-xl cursor-pointer hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] transition-all active:scale-95 text-left">
                <div className="flex items-center justify-between">
                  <div><h4 className="font-bold text-sm text-[#ffd700] mb-1">🎰 Ruleta de Premios</h4><p className="text-xs text-gray-400">¡Has ganado un turno! Gira y gana premios.</p></div>
                  <span className="text-[#ffd700] text-xl animate-pulse">✨</span>
                </div>
              </button>
            )}
            {juegosDesbloqueados.includes('slot') && (
              <button onClick={() => router.push(`/juegos/slot?mesa=${numeroMesa}&sessionId=${sessionId}`)} className="p-4 bg-linear-to-r from-[#00f3ff]/20 to-[#ff00a0]/20 border-2 border-[#00f3ff]/50 rounded-xl cursor-pointer hover:shadow-[0_0_30px_rgba(0,243,255,0.3)] transition-all active:scale-95 text-left">
                <div className="flex items-center justify-between">
                  <div><h4 className="font-bold text-sm text-[#00f3ff] mb-1">🎰 Slot Machine</h4><p className="text-xs text-gray-400">¡Gira los rodillos y gana premios!</p></div>
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
            <h2 className="font-orbitron font-black text-lg text-cyan-400">🗳 VOTACIÓN EN VIVO</h2>
            <button onClick={onClose} className="text-gray-400 text-sm font-bold">✕ Cerrar</button>
          </div>
          {votacionActiva ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-white font-orbitron text-base font-bold">{votacionActiva.pregunta}</h3>
                <p className="text-[#00f3ff] font-space text-xs mt-1">⏱ {tiempoRestante}s restantes</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {votacionActiva.opciones.map((op: any) => (
                  <button key={op.id} onClick={() => onVotar(op.id)} disabled={yaVoto} className={`relative bg-[#0a0720] border rounded-xl p-4 overflow-hidden transition-all active:scale-95 ${yaVoto ? 'border-gray-600 cursor-default opacity-70' : 'border-cyan-500/40 hover:border-cyan-500/80 cursor-pointer'}`}>
                    <div className="relative z-10 text-left"><p className="text-white font-space text-sm font-bold">{op.texto}</p></div>
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

  // MODAL CANCIÓN
  if (seccionActiva === 'cancion') {
    const bloqueado = cancionesRestantes <= 0;
    return (
      <div className="fixed inset-0 z-50 bg-[#020106]/95 backdrop-blur-lg p-6 flex flex-col justify-between animate-fadeIn">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-orbitron font-black text-lg text-purple-400">🎵 PEDIR CANCIÓN</h2>
            <button onClick={onClose} className="text-gray-400 text-sm font-bold">✕ Cerrar</button>
          </div>
          <div className="p-4 bg-[#0d0722] border border-purple-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text- text-gray-400 font-space">Canciones pedidas: <span className="text-purple-400 font-bold">{cancionesUsadas}/{cancionesLimite}</span></span>
              {bloqueado && <span className="text- text-red-400 font-bold animate-pulse">⛔ LÍMITE ALCANZADO</span>}
            </div>
            <p className="text-xs text-gray-400 mb-3">Escribe la canción que quieres escuchar:</p>
            <input type="text" value={cancionInput} onChange={(e) => setCancionInput(e.target.value)} placeholder="Ej: Bohemian Rhapsody" disabled={bloqueado} className="w-full bg-[#0a0720] border border-[#1f1645] rounded-xl px-4 py-3 text-white text-sm font-space focus:outline-none focus:border-purple-500 disabled:opacity-50" />
            <input type="text" value={autorInput} onChange={(e) => setAutorInput(e.target.value)} placeholder="Ej: Queen" disabled={bloqueado} className="w-full mt-2 bg-[#0a0720] border border-[#1f1645] rounded-xl px-4 py-3 text-white text-sm font-space focus:outline-none focus:border-purple-500 disabled:opacity-50" />
            <button onClick={onEnviarCancion} disabled={bloqueado} className={`w-full mt-3 py-2.5 rounded-xl font-orbitron font-black text-xs uppercase tracking-widest transition-all ${bloqueado ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] active:scale-95'}`}>
              {bloqueado ? 'Límite alcanzado' : 'Enviar Sugerencia'}
            </button>
          </div>
        </div>
        <button onClick={onClose} className="w-full py-3 bg-[#1f1645] rounded-xl text-xs font-bold uppercase">Volver</button>
      </div>
    );
  }

  return null;
}