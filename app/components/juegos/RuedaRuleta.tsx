'use client';

import type { SegmentoRuleta } from '@/lib/types/ruleta';
import { useEffect, useState } from 'react';
import { Wine, Beer, GlassWater, Sparkles, Sparkle, Frown, PartyPopper, Tag } from 'lucide-react';

interface Props {
  segmentos: SegmentoRuleta[];
  rotacion: number;
  girando: boolean;
  indiceGanador?: number | null;
  duracionSegundos?: number;
}

export default function RuedaRuleta({ 
  segmentos, 
  rotacion, 
  girando, 
  indiceGanador,
  duracionSegundos = 11
}: Props) {
  const listaSegmentos = segmentos || [];
  const total = listaSegmentos.length || 1;
  const gradosPorSegmento = 360 / total;
  const [rotation, setRotation] = useState(rotacion);

  useEffect(() => {
    setRotation(rotacion);
  }, [rotacion]);

  // ❌ EL CONFETI SE HA ELIMINADO DE AQUÍ. AHORA SOLO SE ACTIVA EN EL PADRE.

  const gradiente = listaSegmentos
    .map((s, i) => `${s.color} ${i * gradosPorSegmento}deg ${(i + 1) * gradosPorSegmento}deg`)
    .join(', ');

  const duracionReal = Math.min(Math.max(duracionSegundos, 11), 14);

  return (
    <div className="relative w-80 h-80 md:w-104 md:h-104 bg-[#020106] mx-auto select-none p-3">
      
      <div className="absolute inset-0 rounded-full bg-radial from-[#ff007f]/30 via-[#00f3ff]/20 to-transparent blur-3xl animate-pulse pointer-events-none" />

      <div className="absolute left-1/2 -top-4 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center">
        <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-[#ff007f] filter drop-shadow-[0_0_12px_#ff007f]" />
        <div className="w-3 h-3 rounded-full bg-[#00f3ff] shadow-[0_0_12px_#00f3ff] -mt-2 border border-white" />
      </div>

      <div className="relative w-full h-full rounded-full p-2 bg-[#080511] border-2 border-[#00f3ff] shadow-[0_0_30px_rgba(0,243,255,0.4),inset_0_0_20px_rgba(255,0,127,0.4)]">
        <div className="absolute inset-1 rounded-full border border-dashed border-[#ff007f]/40 pointer-events-none z-20" />

        <div
          className="w-full h-full rounded-full border-2 border-[#ff007f] shadow-[0_0_20px_rgba(255,0,127,0.7)] relative overflow-hidden"
          style={{
            background: `conic-gradient(from 0deg, ${gradiente})`,
            transform: `rotate(${rotation}deg)`,
            transition: girando 
              ? `transform ${duracionReal}s cubic-bezier(0.08, 0.82, 0.17, 1)` 
              : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[8px_8px] opacity-25 pointer-events-none z-10" />

          {listaSegmentos.map((s, i) => {
            const anguloCentro = i * gradosPorSegmento + gradosPorSegmento / 2;
            
            const esElGanador = !girando && indiceGanador === i;
            
            const nombreIcono = (s.icono as unknown as string) || '';
            let IconoSegmento = null;
            
            switch (nombreIcono) {
              case 'Wine': IconoSegmento = Wine; break;
              case 'Beer': IconoSegmento = Beer; break;
              case 'GlassWater': IconoSegmento = GlassWater; break;
              case 'Sparkles': IconoSegmento = Sparkles; break;
              case 'Sparkle': IconoSegmento = Sparkle; break;
              case 'Frown': IconoSegmento = Frown; break;
              case 'PartyPopper': IconoSegmento = PartyPopper; break;
              case 'Tag': IconoSegmento = Tag; break;
              default: IconoSegmento = null;
            }

            return (
              <div
                key={s.id ?? i}
                className={`absolute top-0 left-1/2 h-1/2 -translate-x-1/2 origin-bottom flex flex-col items-center justify-start pt-4 md:pt-5 z-20 transition-transform duration-300 ${
                  esElGanador ? 'scale-110' : ''
                }`}
                style={{ transform: `rotate(${anguloCentro}deg)` }}
              >
                <div 
                  className="absolute top-0 left-1/2 h-full w-px bg-black/40 -translate-x-1/2 pointer-events-none"
                  style={{ transform: `rotate(-${gradosPorSegmento / 2}deg)` }}
                />

                {esElGanador && (
                  <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-[#ffd700]/80 via-[#ffd700]/30 to-transparent blur-md animate-pulse pointer-events-none" />
                )}

                <div className={`relative flex flex-col items-center gap-1 transition-all duration-300 ${
                  esElGanador ? 'animate-bounce' : ''
                }`}>
                  
                  {IconoSegmento && (
                    <div className="p-1 rounded-full bg-black/30 backdrop-blur-xs">
                      <IconoSegmento
                        className={`w-4 h-4 md:w-5 md:h-5 transition-all ${
                          esElGanador 
                            ? 'text-[#ffd700] filter drop-shadow-[0_0_12px_#ffd700] scale-125' 
                            : 'text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
                        }`}
                      />
                    </div>
                  )}

                  <span 
                    className={`font-mono text-[9px] md:text-[10px] font-black uppercase tracking-wider text-center leading-snug max-w-22 md:max-w-26 line-clamp-2 ${
                      esElGanador
                        ? 'text-[#ffd700] drop-shadow-[0_2px_6px_#000000]'
                        : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]'
                    }`}
                  >
                    {s.texto}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#05030a] border-2 border-[#00f3ff] shadow-[0_0_25px_#00f3ff,inset_0_0_12px_#ff007f] flex items-center justify-center z-30 pointer-events-none">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#ff007f] bg-linear-to-br from-[#240a36] to-[#05030a] flex items-center justify-center shadow-[inset_0_0_10px_#ff007f]">
            <span className="text-lg md:text-xl filter drop-shadow-[0_0_10px_#ffee00] animate-pulse">
              ⚡
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}