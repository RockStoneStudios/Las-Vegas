"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSocketStore } from "@/lib/store/useSocketStore";

export default function VisualPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mensajeWS, conectarSocket, conectado } = useSocketStore();
  const [started, setStarted] = useState(false);
  const [visualActivo, setVisualActivo] = useState(false);

  // 🔌 CONECTAR WEBSOCKET CON SESSIONID DE LA URL
  useEffect(() => {
    const sessionIdFromUrl = searchParams.get('sessionId');
    
    if (sessionIdFromUrl) {
      console.log('🔌 [Visual] SessionId desde URL:', sessionIdFromUrl);
      
      if (!conectado) {
        console.log('🔌 [Visual] Conectando WebSocket...');
        conectarSocket(sessionIdFromUrl, 0, 'admin');
      }
    } else {
      console.warn('⚠️ [Visual] No hay sessionId en la URL');
      // Intentar recuperar de localStorage
      const adminSessionId = localStorage.getItem('admin_sessionId') || localStorage.getItem('admin_session_id');
      if (adminSessionId && !conectado) {
        console.log('🔌 [Visual] SessionId desde localStorage:', adminSessionId);
        conectarSocket(adminSessionId, 0, 'admin');
      }
    }
  }, [searchParams, conectarSocket, conectado]);

  // 📡 Escuchar eventos del Admin
  useEffect(() => {
    if (!mensajeWS) return;

    const tipo = mensajeWS.tipo;
    const payload = mensajeWS.payload || {};

    console.log('📩 [Visual] Evento recibido:', tipo, payload);

    if (tipo === 'EVENT:TOGGLE_VISUAL_BASS') {
      console.log('📺 [Visual] Admin cambió estado:', payload.activo);
      setVisualActivo(payload.activo);
      
      if (payload.activo && !started) {
        setStarted(true);
      }
      
      if (!payload.activo && started) {
        setStarted(false);
      }
    }
  }, [mensajeWS, started]);

  // 🎨 Canvas Visual
  useEffect(() => {
    if (!started) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId: number;
    let bass = 0;

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 512;
      const data = new Uint8Array(analyser.frequencyBinCount);

      const draw = () => {
        animationId = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(data);

        const bassArray = data.slice(0, 15);
        bass = bassArray.reduce((a, b) => a + b, 0) / bassArray.length;
        const normalizedBass = bass / 255;

        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        const layers = 8;
        for (let i = 0; i < layers; i++) {
          const radius = 60 + i * 65 + normalizedBass * 180;
          const hue = 280 + i * 12 + normalizedBass * 80;

          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsl(${hue}, 100%, ${55 + normalizedBass * 25}%)`;
          ctx.lineWidth = 2 + normalizedBass * 10;
          ctx.shadowBlur = 20 + normalizedBass * 50;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.stroke();
        }

        if (normalizedBass > 0.3) {
          const pulseRadius = 30 + normalizedBass * 150;
          const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseRadius);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${0.3 + normalizedBass * 0.5})`);
          gradient.addColorStop(1, `rgba(0, 200, 255, 0)`);
          ctx.beginPath();
          ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        if (normalizedBass > 0.5) {
          const fontSize = 50 + normalizedBass * 50;
          ctx.font = `bold ${fontSize}px Arial`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          ctx.shadowBlur = 40 + normalizedBass * 60;
          ctx.shadowColor = "#ff00a0";
          
          const grad = ctx.createLinearGradient(cx - 150, cy, cx + 150, cy);
          grad.addColorStop(0, "#ff00a0");
          grad.addColorStop(0.5, "#00f3ff");
          grad.addColorStop(1, "#9b5de5");
          ctx.fillStyle = grad;
          ctx.fillText("LAS VEGAS", cx, cy);
          
          if (normalizedBass > 0.7) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = "#00f3ff";
            ctx.font = `bold ${14 + normalizedBass * 20}px Arial`;
            ctx.fillStyle = "rgba(255,255,255,0.6)";
            ctx.fillText("🎵 DISCO BAR 🎵", cx, cy + fontSize / 1.5 + 20);
          }
        }

        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2 + normalizedBass * 0.5;
          const dist = 200 + normalizedBass * 150 + Math.sin(Date.now() / 1000 + i) * 30;
          const x = cx + Math.cos(angle) * dist;
          const y = cy + Math.sin(angle) * dist;
          
          const size = 3 + normalizedBass * 8;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${280 + i * 20}, 100%, ${70 + normalizedBass * 30}%)`;
          ctx.shadowBlur = 15 + normalizedBass * 30;
          ctx.shadowColor = ctx.fillStyle;
          ctx.fill();
        }
      };
      draw();
    });

    return () => cancelAnimationFrame(animationId);
  }, [started]);

  // Si no está conectado
  if (!conectado) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">📡</div>
          <p className="text-gray-400 text-xl font-orbitron animate-pulse">
            Conectando con el servidor...
          </p>
          <p className="text-gray-600 text-sm mt-2 font-space">
            Esperando señal del Admin
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-8 px-6 py-3 bg-[#1f1645] rounded-xl text-white text-sm hover:bg-[#2a1e5c] transition border border-white/10"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // Si no está activado por el Admin
  if (!visualActivo) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">📺</div>
          <h1 className="text-2xl font-orbitron font-bold text-gray-400 uppercase tracking-widest mb-4">
            Visual de Bajos
          </h1>
          <p className="text-gray-500 font-space text-sm">
            Esperando que el Admin active el visual...
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-yellow-500 text-xs font-space">Esperando señal...</span>
          </div>
        </div>
        <button
          onClick={() => router.push('/')}
          className="mt-8 px-6 py-3 bg-[#1f1645] rounded-xl text-white text-sm hover:bg-[#2a1e5c] transition border border-white/10"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  // Visual activo
  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      <canvas ref={canvasRef} className="h-screen w-screen" />
      
      <div className="absolute top-4 right-4 bg-green-500/20 border border-green-500/40 px-3 py-1 rounded-full">
        <span className="text-green-400 text-xs font-orbitron font-bold animate-pulse">
          ● EN VIVO
        </span>
      </div>
      
      <div className="absolute bottom-4 left-4 text-gray-600 text-xs font-space">
        Las Vegas Disco Bar
      </div>
    </div>
  );
}