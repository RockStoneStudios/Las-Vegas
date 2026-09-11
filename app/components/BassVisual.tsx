"use client";

import { useEffect, useRef, useState } from "react";

export default function BassVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);

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

        const layers = 6;
        for (let i = 0; i < layers; i++) {
          const radius = 80 + i * 70 + normalizedBass * 150;
          const hue = 280 + i * 10 + normalizedBass * 60;

          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsl(${hue}, 100%, ${60 + normalizedBass*20}%)`;
          ctx.lineWidth = 3 + normalizedBass * 8;
          ctx.shadowBlur = 20 + normalizedBass * 40;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.stroke();
        }

        if (normalizedBass > 0.6) {
          ctx.beginPath();
          ctx.arc(cx, cy, 50 + normalizedBass * 200, 0, Math.PI * 2);
          ctx.strokeStyle = "#00D1FF";
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = `bold ${60 + normalizedBass * 40}px Arial`;
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("LAS VEGAS", cx, cy + 10);
        }
      };
      draw();
    });

    return () => cancelAnimationFrame(animationId);
  }, [started]);

  if (!started) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <button
          onClick={() => setStarted(true)}
          className="bg-gradient-to-r from-[#ff00a0] to-[#9b5de5] text-white px-8 py-4 rounded-full font-orbitron font-black text-xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,0,160,0.6)] border-2 border-white/20"
        >
          🎵 ACTIVAR VISUAL BASS
        </button>
      </div>
    );
  }

  return <canvas ref={canvasRef} className="h-screen w-screen bg-black" />;
}