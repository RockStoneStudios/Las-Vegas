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
  const idStr = id as string;
  const rutaJuego =
    idStr === 'cajas' || idStr === 'cajones'
      ? '/juegos/cajones'
      : idStr === 'ruleta'
      ? '/juegos/ruleta'
      : `/juegos/${id}`;

  // Si está disponible para mí o viene activo, el juego está encendido
  const estaEncendido = activo || disponibleParaMi;

  return (
    <div className="relative group p-[2px] rounded-xl overflow-hidden transition-all duration-300">
      {/* ⚡ ANIMACIÓN DE LUZ NEÓN QUE RECORRE LOS BORDES */}
      <style jsx>{`
        @keyframes moverNeon {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .borde-neon-animado {
          animation: moverNeon 4s linear infinite;
        }
      `}</style>

      {/* Haz de luz neón giratorio */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl">
        <div
          className={`borde-neon-animado aspect-square w-[250%] origin-center transition-all duration-500 ${
            disponibleParaMi
              ? 'bg-[conic-gradient(from_0deg,#2ee6d6,#ff00a0,#ffee00,#2ee6d6)] opacity-100'
              : estaEncendido
              ? 'bg-[conic-gradient(from_0deg,#ff00a0,transparent,#ff00a0,transparent)] opacity-100'
              : 'bg-[conic-gradient(from_0deg,#00f3ff,transparent,#ff007f,transparent,#00f3ff)] opacity-60 group-hover:opacity-100'
          }`}
        />
      </div>

      {/* Tarjeta Interna (Contenido) */}
      <div
        className={`relative z-10 w-full h-full rounded-[10px] p-6 flex flex-col items-center text-center gap-4 transition-all duration-300 select-none ${
          disponibleParaMi
            ? 'bg-[#0a061d] shadow-[0_0_25px_rgba(46,230,214,0.4)]'
            : estaEncendido
            ? 'bg-[#080516] shadow-[0_0_20px_rgba(255,0,160,0.3)]'
            : 'bg-[#090714] hover:bg-[#0d091f]'
        }`}
      >
        {/* Indicador de Estado (Badge Superior) */}
        <div className="absolute top-3 right-3 font-orbitron font-black text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-md border border-white/20 bg-[#020106] shadow-[0_0_8px_rgba(0,0,0,0.8)] z-20">
          {disponibleParaMi ? (
            <span className="text-[#2ee6d6] drop-shadow-[0_0_8px_#2ee6d6] animate-pulse">
              LIVE ⚡
            </span>
          ) : estaEncendido ? (
            <span className="text-[#ff00a0] drop-shadow-[0_0_8px_#ff00a0]">
              OCUPADO
            </span>
          ) : (
            <span className="text-cyan-400 drop-shadow-[0_0_4px_#00f3ff]">
              OFFLINE
            </span>
          )}
        </div>

        {/* Icono del Juego (Brillante) */}
        <div className="relative z-10 my-1 transition-all duration-300">
          {Icono && (
            <Icono
              className={`w-12 h-12 transition-all duration-300 ${
                disponibleParaMi
                  ? 'text-[#2ee6d6] filter drop-shadow-[0_0_12px_rgba(46,230,214,0.9)]'
                  : estaEncendido
                  ? 'text-[#ff00a0] filter drop-shadow-[0_0_12px_rgba(255,0,160,0.9)]'
                  : 'text-white filter drop-shadow-[0_0_8px_rgba(0,243,255,0.6)] group-hover:scale-110'
              }`}
            />
          )}
        </div>

        {/* Nombre del Juego */}
        <h3 className="relative z-10 font-orbitron font-black text-white text-base md:text-lg tracking-wider uppercase leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
          {nombre}
        </h3>

        {/* Tag de Tipo */}
        <span
          className={`relative z-10 font-space font-black text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-md border bg-[#020106]/90 ${
            tipo === 'global'
              ? 'border-[#9b5de5] text-[#d8b4fe] shadow-[0_0_10px_rgba(155,93,229,0.4)]'
              : 'border-[#ff00a0] text-[#ff77d9] shadow-[0_0_10px_rgba(255,0,160,0.4)]'
          }`}
        >
          {tipo === 'global' ? '🌐 Evento Global' : '💎 Reto Premium'}
        </span>

        {/* BOTÓN REACTIVO CUANDO ESTÁ ENCENDIDO */}
        {estaEncendido && (
          <Link
            href={rutaJuego}
            className={`relative z-10 w-full mt-2 py-3 rounded-xl font-orbitron font-black text-xs tracking-widest uppercase transition-all duration-200 block text-center cursor-pointer ${
              disponibleParaMi
                ? 'bg-[#2ee6d6] text-black shadow-[0_0_20px_rgba(46,230,214,0.6)] hover:shadow-[0_0_35px_rgba(46,230,214,0.9)] hover:bg-white hover:scale-[1.02]'
                : 'border border-[#ff00a0] text-white bg-[#ff00a0]/30 hover:bg-[#ff00a0]/50 shadow-[0_0_15px_rgba(255,0,160,0.4)]'
            }`}
          >
            {disponibleParaMi ? '¡INGRESAR AL RETO!' : 'VER JUEGO EN VIVO'}
          </Link>
        )}

        {/* Mensaje de Estado Inferior */}
        <div className="relative z-10 font-space font-bold text-xs tracking-wide">
          {estaEncendido && !disponibleParaMi && tipo === 'por_mesa' && (
            <p className="text-[#ff77d9] drop-shadow-[0_0_6px_rgba(255,0,160,0.5)]">
              🎮 Jugando ahora:{' '}
              <span className="font-black text-white bg-[#ff00a0]/40 px-2 py-0.5 rounded-sm border border-[#ff00a0]">
                Mesa {mesaObjetivo}
              </span>
            </p>
          )}

          {!estaEncendido && (
            <p className="text-white text-[11px] tracking-widest font-black uppercase drop-shadow-[0_0_6px_rgba(0,243,255,0.5)] flex items-center justify-center gap-1.5">
              <span>🔒</span> Bloqueado por el DJ
            </p>
          )}
        </div>
      </div>
    </div>
  );
}