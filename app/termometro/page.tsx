'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSocketStore } from '@/lib/store/useSocketStore';
import gsap from 'gsap';

function TermometroPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter(); // 🔥 Importamos el router
  const sessionId = searchParams.get('sessionId');
  
  const { conectado, mensajeWS, conectarSocket, enviarMensaje } = useSocketStore();
  
  const [nivel, setNivel] = useState(0);
  
  // 🆕 Array de emojis con ID único y tiempo de expiración
  const [emojis, setEmojis] = useState<{ id: string; emoji: string }[]>([]);

  // 1. Conectar
  useEffect(() => {
    if (sessionId) {
      conectarSocket(sessionId, 0, 'admin');
    }
  }, [sessionId, conectarSocket]);

  // 2. Pedir estado
  useEffect(() => {
    if (!conectado) return;
    const intervalo = setInterval(() => {
      enviarMensaje({ tipo: 'ACTION:OBTENER_ESTADO_TERMOMETRO', payload: {} });
    }, 2000);
    return () => clearInterval(intervalo);
  }, [conectado, enviarMensaje]);

  // 3. Recibir emojis y programar su destrucción
  useEffect(() => {
    if (!mensajeWS) return;
    const tipo = mensajeWS.tipo;
    const payload = mensajeWS.payload || {};

    // 🟢 Nuevo emoji
    if (tipo === 'EVENT:NUEVO_EMOJI_EN_TV') {
      const nuevoEmoji = { id: Date.now() + Math.random() + '', emoji: payload.emoji };
      
      // 1. Lo agregamos al DOM
      setEmojis(prev => {
        const nuevaLista = [...prev, nuevoEmoji];
        if (nuevaLista.length > 15) {
          return nuevaLista.slice(-15);
        }
        return nuevaLista;
      });

      // 2. Programamos su muerte exactamente en 2.5 segundos
      setTimeout(() => {
        setEmojis(prev => prev.filter(e => e.id !== nuevoEmoji.id));
      }, 2500); // <--- CAMBIA ESTE NÚMERO PARA QUE DURE MÁS O MENOS (Milisegundos)
    }

    // 📊 Barra
    if (tipo === 'EVENT:ACTUALIZAR_TERMOMETRO') {
      const porcentaje = Math.min(100, Math.round((payload.total / 1000) * 100));
      setNivel(porcentaje);
    }

    // 🔄 Reiniciar
    if (tipo === 'EVENT:TERMOMETRO_REINICIADO') {
      setNivel(0);
      setEmojis([]);
    }
  }, [mensajeWS]);

  // 4. Animar los nuevos emojis con GSAP
  useEffect(() => {
    if (emojis.length === 0) return;

    const ultimoEmoji = emojis[emojis.length - 1];
    const el = document.getElementById(ultimoEmoji.id);

    if (el) {
      gsap.killTweensOf(el);
      
      gsap.fromTo(el, 
        { 
          y: '100vh', 
          opacity: 0, 
          scale: 0.5,
          rotation: Math.random() * 40 - 20
        },
        {
          y: '-10vh', 
          opacity: 1, 
          scale: 1.5,
          rotation: Math.random() * 40 - 20,
          duration: 1.3, // La subida dura solo 1 segundo
          ease: 'power2.out',
        }
      );
    }
  }, [emojis]);

  return (
    <main className="min-h-screen bg-[#020106] flex flex-col items-center justify-center overflow-hidden relative p-4">
      
      {/* 🔙 BOTÓN PARA VOLVER A LA PÁGINA DE ADMIN */}
      <div className="absolute top-6 left-6 z-30">
        <button
          onClick={() => router.push('/admin')} // 🔥 CAMBIO AQUÍ: Ir directo a /admin
          className="flex items-center justify-center w-12 h-12 rounded-full border border-[#00f3ff]/50 bg-[#020106]/80 backdrop-blur-md text-[#00f3ff] hover:bg-[#00f3ff]/10 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="absolute top-10 left-0 right-0 text-center z-20">
        <h1 className="text-[#00f3ff] font-orbitron text-4xl md:text-6xl font-black uppercase tracking-[0.3em] drop-shadow-[0_0_30px_rgba(0,243,255,0.5)]">
          ENERGÍA DE LA PISTA
        </h1>
        <p className="text-white/60 font-space text-sm mt-2 tracking-wider">
          {conectado ? '🟢 EN VIVO' : '🔴 DESCONECTADO'}
        </p>
      </div>

      {/* 🎈 CONTENEDOR DE EMOJIS */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
        {emojis.map((item) => (
          <div
            key={item.id}
            id={item.id}
            className="absolute text-[6rem] md:text-[10rem] font-black select-none drop-shadow-[0_0_50px_rgba(255,255,255,0.6)]"
            style={{
              left: `${20 + Math.random() * 60}%`,
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* 📊 BARRA */}
      <div className="w-full max-w-5xl z-20 flex flex-col items-center gap-6">
        <div className="w-full h-16 md:h-20 bg-[#0a071e] rounded-full border-2 border-[#00f3ff]/40 shadow-[0_0_50px_rgba(0,243,255,0.2)] overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-[#ff007f] via-[#ffd700] to-[#00f3ff] transition-all duration-500 ease-out shadow-[0_0_30px_rgba(255,0,127,0.5)]"
            style={{ width: `${nivel}%` }}
          />
        </div>

        <span className="text-white font-orbitron text-8xl md:text-9xl font-black drop-shadow-[0_0_40px_rgba(0,243,255,0.4)] tabular-nums">
          {nivel}%
        </span>

        <div className="mt-4 flex gap-2 items-center text-[#00f3ff]/60 font-mono text-xs tracking-widest">
          <div className={`w-2 h-2 rounded-full ${conectado ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span>{conectado ? 'CONECTADO' : 'ESPERANDO...'}</span>
        </div>
      </div>
    </main>
  );
}

export default function TermometroPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <TermometroPageContent />
    </Suspense>
  );
}