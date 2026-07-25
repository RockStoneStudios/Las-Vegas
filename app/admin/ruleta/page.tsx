'use client';

import { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import RuletaMesas from '@/app/components/RuletasMesa';

interface MensajeSuerte {
  id: number;
  top: string;
  left: string;
  colorClass: string;
}

export default function PaginaAdmin() {
  const [numMesas, setNumMesas] = useState<number>(16);
  const [ruletaGenerada, setRuletaGenerada] = useState<boolean>(false);
  
  // Estado para el mensaje individual actual
  const [mensajeActual, setMensajeActual] = useState<MensajeSuerte | null>(null);
  
  // Referencias para controlar los timers del ciclo de 5 segundos
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const lanzarConfeti = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { x: 0.15, y: 0.6 },
      zIndex: 9999,
      colors: ['#ff00a0', '#2ee6d6', '#ffd700', '#9b5de5'],
    });

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { x: 0.85, y: 0.6 },
      zIndex: 9999,
      colors: ['#ff00a0', '#2ee6d6', '#ffd700', '#9b5de5'],
    });
  };

  // Limpia cualquier intervalo o timeout en curso
  const limpiarAnimacionSuerte = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (totalTimeoutRef.current) clearTimeout(totalTimeoutRef.current);
    setMensajeActual(null);
  };

  // Función para activar la secuencia de 1 en 1 durante 5 segundos
  const activarBuenaSuerte = () => {
    limpiarAnimacionSuerte();

    // Estilos de color neón: Rojo, Azul (Cyan) y Verde
    const colores = [
      'text-[#ff0055] drop-shadow-[0_0_15px_#ff0055,0_0_30px_#ff0055]', // Rojo Neón
      'text-[#00f0ff] drop-shadow-[0_0_15px_#00f0ff,0_0_30px_#00f0ff]', // Azul / Cyan Neón
      'text-[#00ff66] drop-shadow-[0_0_15px_#00ff66,0_0_30px_#00ff66]', // Verde Neón
    ];

    // Posiciones en los bordes fuera del centro de la ruleta
    const posiciones = [
      { top: '15%', left: '18%' },
      { top: '15%', left: '80%' },
      { top: '80%', left: '18%' },
      { top: '80%', left: '80%' },
      { top: '48%', left: '10%' },
      { top: '48%', left: '90%' },
    ];

    let indiceCiclo = 0;

    // Función interna para mostrar el mensaje de turno
    const mostrarSiguienteMensaje = () => {
      const pos = posiciones[Math.floor(Math.random() * posiciones.length)];
      const color = colores[indiceCiclo % colores.length];

      setMensajeActual({
        id: Date.now(),
        top: pos.top,
        left: pos.left,
        colorClass: color,
      });

      indiceCiclo++;
    };

    // Muestra el primero inmediatamente
    mostrarSiguienteMensaje();

    // Cambia el mensaje cada 1.3 segundos (1300 ms)
    intervalRef.current = setInterval(() => {
      mostrarSiguienteMensaje();
    }, 1300);

    // Detiene todo el ciclo a los 5 segundos (5000 ms)
    totalTimeoutRef.current = setTimeout(() => {
      limpiarAnimacionSuerte();
    }, 5000);
  };

  return (
    <main className="relative min-h-screen pt-4 sm:pt-6 pb-8 px-4 sm:px-6 lg:px-8 bg-[#020106] flex flex-col items-center gap-4 select-none overflow-hidden">
      {/* Capa de fondo con degradado Neo-Punk */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#060413] via-[#020106] to-[#0a071d] z-0" />
      
      {/* ⚡ Renderizado de 1 en 1 de "¡BUENA SUERTE!" rotando de color y posición */}
      {mensajeActual && (
        <div 
          key={mensajeActual.id}
          style={{ top: mensajeActual.top, left: mensajeActual.left }}
          className="fixed z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-bounce"
        >
          <span className={`font-orbitron font-black text-xl sm:text-3xl lg:text-4xl uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${mensajeActual.colorClass}`}>
            ¡BUENA SUERTE! 
          </span>
        </div>
      )}

      {/* Título Principal (Solo antes de encender la ruleta) */}
      {!ruletaGenerada && (
        <h1 className="relative z-10 font-orbitron font-black text-2xl sm:text-4xl uppercase tracking-[0.2em] text-white text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] leading-none mb-2">
          ZONA DE JUEGO: <br className="sm:hidden" />
          <span className="text-[#2ee6d6] drop-shadow-[0_0_12px_#2ee6d6,0_0_30px_#2ee6d6] animate-pulse ml-2 sm:ml-0">
            PRUEBA TU SUERTE
          </span>
        </h1>
      )}

      {/* Formulario de Configuración */}
      {!ruletaGenerada && (
        <div className="relative z-10 flex flex-col gap-6 items-center w-full max-w-md bg-[#060413]/60 backdrop-blur-md border border-[#1f1645] p-8 rounded-2xl shadow-[0_0_25px_rgba(31,22,69,0.4)] hover:border-purple-500/30 transition-all duration-300">
          <label className="font-space font-medium text-sm sm:text-base text-gray-300 flex flex-col sm:flex-row items-center gap-3 w-full justify-between">
            <span className="uppercase tracking-wider text-xs font-bold text-purple-400">
              🎰 ¿Cuántas mesas juegan?
            </span>
            <input
              type="number"
              min={2}
              max={50}
              value={numMesas || ''}
              onChange={(e) => setNumMesas(Number(e.target.value) || 2)}
              className="w-full sm:w-24 px-3 py-2 bg-[#0c0824] border border-[#1f1645] rounded-xl font-orbitron font-bold text-center text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)] focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all duration-200"
            />
          </label>

          <button
            onClick={() => setRuletaGenerada(true)}
            className="w-full py-3.5 rounded-xl bg-[#ff00a0] font-orbitron font-black text-xs sm:text-sm tracking-widest text-white uppercase shadow-[0_0_20px_rgba(255,0,160,0.6)] hover:shadow-[0_0_35px_rgba(255,0,160,0.9)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            🔥 ENCIENDE LA RULETA
          </button>
        </div>
      )}

      {/* Vista de la Ruleta (Sin contenedor) */}
      {ruletaGenerada && (
        <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-5xl">
          <RuletaMesas 
            numMesas={numMesas} 
            onInicioGiro={activarBuenaSuerte}
            onResultado={() => lanzarConfeti()} 
          />

          <button
            onClick={() => setRuletaGenerada(false)}
            className="px-5 py-2.5 rounded-lg border border-gray-600 bg-transparent font-orbitron font-bold text-xs tracking-wider text-gray-400 uppercase hover:border-white hover:text-white hover:shadow-[0_0_12px_rgba(255,255,255,0.4)] active:scale-95 transition-all duration-200"
          >
            ← CAMBIAR NÚMERO DE MESAS
          </button>
        </div>
      )}
    </main>
  );
}