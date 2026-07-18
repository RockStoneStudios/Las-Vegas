'use client';

import { TipoJuego } from '@/lib/types/juegos';

interface Props {
  nombre: string;
  icono: string;
  tipo: TipoJuego;
  activo: boolean;
  disponibleParaMi: boolean;
  mesaObjetivo: number | null;
}

export default function TarjetaJuego({ nombre, icono, tipo, activo, disponibleParaMi, mesaObjetivo }: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-6 flex flex-col items-center text-center gap-4 transition-all duration-300 select-none ${
        disponibleParaMi
          ? 'border-[#2ee6d6] bg-[#0c0824]/90 shadow-[0_0_25px_rgba(46,230,214,0.3)] scale-[1.03]'
          : activo
          ? 'border-[#ff00a0]/40 bg-[#060413]/70 opacity-80 shadow-[0_0_15px_rgba(255,0,160,0.1)]'
          : 'border-white/5 bg-[#020106]/40 opacity-40 grayscale pointer-events-none'
      }`}
    >
      {/* Indicador de Estado Superior Derecho (Estilo Badge Hacker) */}
      <div className="absolute top-3 right-3 font-orbitron font-black text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-sm border bg-[#020106]/90 shadow-[0_0_8px_rgba(0,0,0,0.5)]">
        {disponibleParaMi ? (
          <span className="text-[#2ee6d6] drop-shadow-[0_0_5px_#2ee6d6] animate-pulse">LIVE ⚡</span>
        ) : activo ? (
          <span className="text-[#ff00a0] drop-shadow-[0_0_5px_#ff00a0]">OCUPADO</span>
        ) : (
          <span className="text-gray-600">OFFLINE</span>
        )}
      </div>

      {/* Icono del Juego con Sombra Neón */}
      <div className={`text-5xl my-1 filter transition-all duration-300 ${disponibleParaMi ? 'drop-shadow-[0_0_12px_rgba(46,230,214,0.6)]' : ''}`}>
        {icono}
      </div>

      {/* Nombre con Orbitron */}
      <h3 className="font-orbitron font-black text-white text-base tracking-wider uppercase leading-snug">
        {nombre}
      </h3>

      {/* Tag de Tipo de Juego (Global vs Premium) */}
      <span
        className={`font-space font-black text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-md border bg-[#020106]/60 ${
          tipo === 'global' 
            ? 'border-[#9b5de5] text-[#9b5de5] shadow-[0_0_8px_rgba(155,93,229,0.2)]' 
            : 'border-[#ff00a0] text-[#ff00a0] shadow-[0_0_8px_rgba(255,0,160,0.2)]'
        }`}
      >
        {tipo === 'global' ? '🌐 Evento Global' : '💎 Reto Premium'}
      </span>

      {/* BOTÓN REACIVO (Si está disponible para la mesa) */}
      {disponibleParaMi && (
        <button className="w-full mt-2 py-3 rounded-xl bg-[#2ee6d6] font-orbitron font-black text-xs tracking-widest text-black uppercase shadow-[0_0_20px_rgba(46,230,214,0.5)] hover:shadow-[0_0_35px_rgba(46,230,214,0.8)] hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer">
          ¡INGRESAR AL RETO!
        </button>
      )}

      {/* Textos Informativos de Estado con Space Grotesk */}
      <div className="font-space font-medium text-xs tracking-wide">
        {activo && !disponibleParaMi && tipo === 'por_mesa' && (
          <p className="text-[#ff00a0] drop-shadow-[0_0_4px_rgba(255,0,160,0.3)] animate-pulse">
            🎮 Jugando ahora: <span className="font-bold text-white bg-[#ff00a0]/20 px-1.5 py-0.5 rounded-sm">Mesa {mesaObjetivo}</span>
          </p>
        )}

        {!activo && (
          <p className="text-gray-500 uppercase text-[10px] tracking-widest">
            🔒 Bloqueado por la cabina DJ
          </p>
        )}
      </div>

      {/* Línea decorativa neón inferior (Solo si está disponible) */}
      {disponibleParaMi && (
        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[#2ee6d6] shadow-[0_0_10px_#2ee6d6]" />
      )}
    </div>
  );
}