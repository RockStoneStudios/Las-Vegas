// app/components/juegos/RuedaRuleta.tsx
'use client';

import type { SegmentoRuleta } from '@/lib/types/ruleta';

interface Props {
  segmentos: SegmentoRuleta[];
  rotacion: number;
  girando: boolean;
  indiceGanador?: number | null;
}

export default function RuedaRuleta({ segmentos, rotacion, girando, indiceGanador }: Props) {
  const total = segmentos.length || 1;
  const gradosPorSegmento = 360 / total;

  const gradiente = segmentos
    .map((s, i) => `${s.color} ${i * gradosPorSegmento}deg ${(i + 1) * gradosPorSegmento}deg`)
    .join(', ');

  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto select-none p-2">
      {/* Resplandor ambiental de fondo Cyberpunk */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ff007f]/20 via-[#00f3ff]/20 to-[#ffee00]/20 blur-2xl animate-pulse pointer-events-none" />

      {/* Indicador / Flecha Neón Superior */}
      <div className="absolute left-1/2 -top-3 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
        <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-[#ff007f] drop-shadow-[0_0_12px_#ff007f]" />
        <div className="w-2 h-2 rounded-full bg-[#00f3ff] shadow-[0_0_8px_#00f3ff] -mt-1" />
      </div>

      {/* Marco Exterior Estilo Neon Punk */}
      <div className="relative w-full h-full rounded-full p-2 bg-[#0d0a1a] border-2 border-[#00f3ff]/80 shadow-[0_0_25px_rgba(0,243,255,0.4),inset_0_0_15px_rgba(255,0,127,0.3)]">
        
        {/* Rueda giratoria */}
        <div
          className="w-full h-full rounded-full border-2 border-[#ff007f] shadow-[0_0_30px_rgba(255,0,127,0.6)] relative overflow-hidden"
          style={{
            background: `conic-gradient(from 0deg, ${gradiente})`,
            transform: `rotate(${rotacion}deg)`,
            transition: girando ? 'transform 4s cubic-bezier(0.17, 0.67, 0.16, 0.99)' : 'none',
          }}
        >
          {/* Overlay de Trama/Líneas Cyberpunk */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000015_1px,transparent_1px),linear-gradient(to_bottom,#00000015_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none z-10" />

          {segmentos.map((s, i) => {
            const anguloCentro = i * gradosPorSegmento + gradosPorSegmento / 2;
            const esElGanador = !girando && indiceGanador === i;
            const IconoSegmento = s.icono;

            // Detectamos si el color de fondo es claro (amarillo, cian, etc.) para ajustar legibilidad
            const esColorClaro = ['#ffee00', '#00f3ff', '#ffd23f', '#2ee6d6'].includes(s.color.toLowerCase());

            return (
              <div
                key={s.id ?? i}
                // 💡 FIX 1: Incrementamos el padding-top (pt-7 md:pt-9) para alejar la calavera/ícono del borde superior
                className={`absolute top-0 left-1/2 h-1/2 -translate-x-1/2 origin-bottom flex flex-col items-center justify-start pt-7 md:pt-9 z-20 transition-all duration-300 ${
                  esElGanador ? 'scale-105' : ''
                }`}
                style={{
                  transform: `rotate(${anguloCentro}deg)`,
                }}
              >
                {/* Iluminación dorada de fondo solo para la sección ganadora */}
                {esElGanador && (
                  <div 
                    className="absolute inset-0 bg-gradient-to-b from-[#ffd700]/70 via-[#ffae00]/40 to-transparent blur-sm animate-pulse rounded-t-full pointer-events-none" 
                  />
                )}

                <div className={`relative flex flex-col items-center gap-1 transition-all duration-300 ${
                  esElGanador ? 'animate-bounce' : ''
                }`}>
                  {/* Icono con alto contraste */}
                  {IconoSegmento && (
                    <IconoSegmento
                      className={`w-5 h-5 md:w-6 md:h-6 transition-all ${
                        esElGanador 
                          ? 'text-[#ffd700] filter drop-shadow-[0_0_10px_#000000] drop-shadow-[0_0_12px_#ffd700] scale-125' 
                          : esColorClaro
                          ? 'text-[#060413] filter drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]'
                          : 'text-white filter drop-shadow-[0_0_6px_rgba(0,243,255,0.8)]'
                      }`}
                    />
                  )}

                  {/* 💡 FIX 2: Texto con colores ajustados a fondos claros y stroke negro agresivo */}
                  <span className={`font-mono text-[8px] md:text-[10px] font-black uppercase tracking-wider text-center leading-tight max-w-[60px] md:max-w-[75px] ${
                    esElGanador
                      ? 'text-[#ffd700] drop-shadow-[0_2px_4px_#000000] drop-shadow-[0_0_10px_#ffd700]'
                      : esColorClaro
                      ? 'text-[#060413] font-extrabold drop-shadow-[0_0_2px_rgba(255,255,255,0.9)]'
                      : 'text-white drop-shadow-[0_2px_4px_#000000] drop-shadow-[0_0_6px_rgba(0,243,255,0.8)]'
                  }`}>
                    {s.texto}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Eje Central Futurista / Reactor Cyberpunk */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#05030a] border-2 border-[#00f3ff] shadow-[0_0_20px_#00f3ff,inset_0_0_10px_#ff007f] flex items-center justify-center z-20 pointer-events-none">
          <div className="w-10 h-10 rounded-full border border-[#ff007f] bg-gradient-to-br from-[#1a0b2e] to-[#05030a] flex items-center justify-center shadow-[inset_0_0_8px_#ff007f]">
            <span className="text-xl filter drop-shadow-[0_0_8px_#ffee00] animate-pulse">
              ⚡
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}