'use client';

import { Flame, Heart, PartyPopper, ThumbsUp, HandMetal } from 'lucide-react';
import { useState } from 'react';

interface Props {
  enviarMensaje: (msg: any) => void;
}

export default function PanelReacciones({ enviarMensaje }: Props) {
  const [activo, setActivo] = useState<string | null>(null);
  // 🆕 Estado para el emoji volador local
  const [emojiVolador, setEmojiVolador] = useState<string | null>(null);

  // 🟢 COLORES NEÓN
  const reacciones = [
    { 
      id: 'fuego', 
      icono: Flame, 
      color: '#ff3300', 
      payload: '🔥'
    },
    { 
      id: 'corazon', 
      icono: Heart, 
      color: '#ff00a0', 
      payload: '❤️'
    },
    { 
      id: 'fiesta', 
      icono: PartyPopper, 
      color: '#ffdd00', 
      payload: '🎉'
    },
    { 
      id: 'aplauso', 
      icono: ThumbsUp, 
      color: '#00e5ff', 
      payload: '👏'
    },
    { 
      id: 'metal', 
      icono: HandMetal, 
      color: '#b300ff', 
      payload: '🤘'
    },
  ];

  const handleClick = (id: string, payload: string) => {
    // 🆕 Efecto visual local: el emoji vuela sobre la mesa
    setEmojiVolador(payload);
    setTimeout(() => setEmojiVolador(null), 800); // Desaparece a los 800ms

    // Efecto del botón neón
    setActivo(id);
    enviarMensaje({ tipo: 'ACTION:ENVIAR_REACCION', payload: { emoji: payload } });
    setTimeout(() => setActivo(null), 600);
  };

  return (
    <div className="w-full bg-[#05030a] border border-[#00e5ff]/30 rounded-2xl p-5 relative overflow-hidden shadow-[inset_0_0_50px_rgba(0,229,255,0.05)]">
      
      {/* 🆕 EMOJI VOLADOR LOCAL (solo en esta mesa) */}
      {emojiVolador && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center animate-bounce-once">
          <span className="text-9xl drop-shadow-[0_0_50px_rgba(255,255,255,0.6)]">
            {emojiVolador}
          </span>
        </div>
      )}

      <p className="text-center text-white font-orbitron text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center justify-center gap-3 drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#ff00a0] animate-pulse shadow-[0_0_15px_#ff00a0]" />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff00a0] to-[#00e5ff]">
          ENVÍA TU ENERGÍA
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse shadow-[0_0_15px_#00e5ff]" />
      </p>

      <div className="flex justify-around items-center gap-2">
        {reacciones.map((item) => {
          const Icono = item.icono;
          const esActivo = activo === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id, item.payload)}
              className={`
                relative w-12 h-12 md:w-14 md:h-14 rounded-full 
                border-[2px] border-white/10 bg-[#020106] 
                flex items-center justify-center
                transition-all duration-200 ease-out
                hover:scale-110 active:scale-95
                ${esActivo ? 'border-white/50' : ''}
              `}
            >
              {/* 🔥 EFECTO NEÓN TUBO */}
              <div className="relative z-10 flex items-center justify-center">
                <Icono
                  className={`
                    w-6 h-6 md:w-7 md:h-7 absolute
                    transition-all duration-200
                    text-white
                    ${esActivo ? 'opacity-100 scale-110' : 'opacity-0'}
                  `}
                  strokeWidth={3}
                />

                <Icono
                  className={`
                    w-6 h-6 md:w-7 md:h-7
                    transition-all duration-200
                    text-[${item.color}] 
                    ${esActivo ? 'scale-110 drop-shadow-[0_0_15px_currentColor]' : 'drop-shadow-[0_0_8px_currentColor]'}
                  `}
                  strokeWidth={2}
                />

                <div 
                  className={`absolute inset-0 rounded-full transition-all duration-300 ${
                    esActivo ? `bg-[${item.color}]/30 blur-[12px] scale-150` : `bg-[${item.color}]/10 blur-[8px]`
                  }`}
                />
              </div>
              
              {esActivo && (
                <div className="absolute inset-0 rounded-full border border-white/30 animate-ping duration-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}