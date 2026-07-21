'use client';

import Link from 'next/link';
import { TipoJuego, JuegoId } from '@/lib/types/juegos';
import { type LucideIcon } from 'lucide-react';

interface Props {
  id: JuegoId;
  nombre: string;
  icono: LucideIcon;
  tipo: TipoJuego;
  activo: boolean;
  disponibleParaMi: boolean;
  mesaObjetivo: number | null;
}

export default function TarjetaJuego({
  id,
  nombre,
  icono: Icono,
  tipo,
  activo,
  disponibleParaMi,
  mesaObjetivo,
}: Props) {
  // 💡 Solución al error de TypeScript: Casteo a string para permitir ambos alias ('cajones' o 'cajas')
  const idStr = id as string;
  const rutaJuego = idStr === 'cajas' || idStr === 'cajones' 
    ? '/juegos/cajones' 
    : idStr === 'ruleta' 
    ? '/juegos/ruleta' 
    : `/juegos/${id}`;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-6 flex flex-col items-center text-center gap-4 transition-all duration-300 select-none ${
        disponibleParaMi
          ? 'border-[#2ee6d6] bg-[#0c0824]/90 shadow-[0_0_25px_rgba(46,230,214,0.3)] scale-[1.03]'
          : activo
          ? 'border-[#ff00a0]/40 bg-[#060413]/70 opacity-90 shadow-[0_0_15px_rgba(255,0,160,0.15)]'
          : 'border-white/5 bg-[#020106]/40 opacity-40 grayscale pointer-events-none'
      }`}
    >
      {/* Indicador de Estado */}
      <div className="absolute top-3 right-3 font-orbitron font-black text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-sm border bg-[#020106]/90 shadow-[0_0_8px_rgba(0,0,0,0.5)] z-10">
        {disponibleParaMi ? (
          <span className="text-[#2ee6d6] drop-shadow-[0_0_5px_#2ee6d6] animate-pulse">LIVE ⚡</span>
        ) : activo ? (
          <span className="text-[#ff00a0] drop-shadow-[0_0_5px_#ff00a0]">OCUPADO</span>
        ) : (
          <span className="text-gray-600">OFFLINE</span>
        )}
      </div>

      {/* Icono del Juego */}
      <div className={`my-1 transition-all duration-300 ${disponibleParaMi ? 'filter drop-shadow-[0_0_12px_rgba(46,230,214,0.8)]' : ''}`}>
        {Icono && (
          <Icono className={`w-12 h-12 ${disponibleParaMi ? 'text-[#2ee6d6]' : activo ? 'text-[#ff00a0]' : 'text-gray-400'}`} />
        )}
      </div>

      {/* Nombre */}
      <h3 className="font-orbitron font-black text-white text-base tracking-wider uppercase leading-snug">
        {nombre}
      </h3>

      {/* Tag de Tipo */}
      <span
        className={`font-space font-black text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-md border bg-[#020106]/60 ${
          tipo === 'global' 
            ? 'border-[#9b5de5] text-[#9b5de5] shadow-[0_0_8px_rgba(155,93,229,0.2)]' 
            : 'border-[#ff00a0] text-[#ff00a0] shadow-[0_0_8px_rgba(255,0,160,0.2)]'
        }`}
      >
        {tipo === 'global' ? '🌐 Evento Global' : '💎 Reto Premium'}
      </span>

      {/* BOTÓN REACTIVO */}
      {activo && (
        <Link
          href={rutaJuego}
          className={`w-full mt-2 py-3 rounded-xl font-orbitron font-black text-xs tracking-widest uppercase transition-all duration-200 block text-center cursor-pointer ${
            disponibleParaMi
              ? 'bg-[#2ee6d6] text-black shadow-[0_0_20px_rgba(46,230,214,0.5)] hover:shadow-[0_0_35px_rgba(46,230,214,0.8)] hover:bg-white hover:scale-[1.02]'
              : 'border border-[#ff00a0]/60 text-[#ff00a0] bg-[#ff00a0]/10 hover:bg-[#ff00a0]/20 shadow-[0_0_15px_rgba(255,0,160,0.3)]'
          }`}
        >
          {disponibleParaMi ? '¡INGRESAR AL RETO!' : 'VER JUEGO EN VIVO'}
        </Link>
      )}

      {/* Mensajes de Estado */}
      <div className="font-space font-medium text-xs tracking-wide">
        {activo && !disponibleParaMi && tipo === 'por_mesa' && (
          <p className="text-[#ff00a0] drop-shadow-[0_0_4px_rgba(255,0,160,0.3)]">
            🎮 Jugando ahora: <span className="font-bold text-white bg-[#ff00a0]/20 px-1.5 py-0.5 rounded-sm">Mesa {mesaObjetivo}</span>
          </p>
        )}

        {!activo && (
          <p className="text-gray-500 uppercase text-[10px] tracking-widest">
            🔒 Bloqueado por la cabina DJ
          </p>
        )}
      </div>
    </div>
  );
}