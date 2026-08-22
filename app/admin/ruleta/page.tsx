'use client';

import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import RuletaMesas from '@/app/components/RuletasMesa';
import { useSocketStore } from '@/lib/store/useSocketStore';

interface MensajeSuerte {
  id: number;
  top: string;
  left: string;
  colorClass: string;
}

export default function VistaRuletaGeneral() {
  const [montado, setMontado] = useState<boolean>(false);
  const [numMesas, setNumMesas] = useState<number>(16);
  const [ruletaGenerada, setRuletaGenerada] = useState<boolean>(false);
  const [duracionGiroWS, setDuracionGiroWS] = useState<number>(11);
  const [mesaGanadoraTarget, setMesaGanadoraTarget] = useState<number | null>(null);

  const { conectarSocket, enviarMensaje, mensajeWS } = useSocketStore();

  const [mensajeActual, setMensajeActual] = useState<MensajeSuerte | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🛡️ Prevenimos errores de hidratación asegurando que esto corra solo en el cliente
  useEffect(() => {
    setMontado(true);

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      let sessionId = urlParams.get('sessionId') || localStorage.getItem('sessionId');

      if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
        sessionId = 'sala-' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('sessionId', sessionId);
        
        const newUrl = `${window.location.pathname}?sessionId=${sessionId}`;
        window.history.replaceState({}, '', newUrl);
      }

      // Conectamos como administrador general (mesa 0, rol admin)
      conectarSocket(sessionId, 0, 'admin');
    }
  }, [conectarSocket]);

  // 📩 REACCIÓN AL WEBSOCKET
  useEffect(() => {
    if (!mensajeWS) return;

    if (
      mensajeWS.tipo === 'EVENT:SORTEO_MESA_RESULTADO' ||
      mensajeWS.tipo === 'ACTION:GIRAR_RULETA' ||
      mensajeWS.tipo === 'EVENT:RULETA_GIRAR'
    ) {
      const { mesaGanadora, totalMesasParticipantes, totalMesas, mesasManuales, duracionSegundos, duracionAnimacionMs } = mensajeWS.payload || {};

      const total = totalMesasParticipantes || totalMesas || (typeof mesasManuales === 'number' ? mesasManuales : 16);
      setNumMesas(total);

      if (duracionSegundos) {
        setDuracionGiroWS(duracionSegundos);
      } else if (duracionAnimacionMs) {
        setDuracionGiroWS(Math.round(duracionAnimacionMs / 1000));
      }

      if (mesaGanadora) {
        setMesaGanadoraTarget(mesaGanadora);
      }

      setRuletaGenerada(true);
    }
  }, [mensajeWS]);

  useEffect(() => {
    return () => limpiarAnimacionSuerte();
  }, []);

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

  const limpiarAnimacionSuerte = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (totalTimeoutRef.current) clearTimeout(totalTimeoutRef.current);
    setMensajeActual(null);
  };

  const activarBuenaSuerte = () => {
    limpiarAnimacionSuerte();

    const colores = [
      'text-[#ff0055] drop-shadow-[0_0_15px_#ff0055,0_0_30px_#ff0055]',
      'text-[#00f0ff] drop-shadow-[0_0_15px_#00f0ff,0_0_30px_#00f0ff]',
      'text-[#00ff66] drop-shadow-[0_0_15px_#00ff66,0_0_30px_#00ff66]',
    ];

    const posiciones = [
      { top: '15%', left: '18%' },
      { top: '15%', left: '80%' },
      { top: '80%', left: '18%' },
      { top: '80%', left: '80%' },
      { top: '48%', left: '10%' },
      { top: '48%', left: '90%' },
    ];

    let indiceCiclo = 0;

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

    mostrarSiguienteMensaje();

    intervalRef.current = setInterval(() => {
      mostrarSiguienteMensaje();
    }, 1300);

    totalTimeoutRef.current = setTimeout(() => {
      limpiarAnimacionSuerte();
    }, (duracionGiroWS || 11) * 1000);
  };

  const manejarGiroManual = () => {
    const socketState = useSocketStore.getState();

    setRuletaGenerada(true);

    if (socketState.socket && socketState.socket.readyState === WebSocket.OPEN) {
      enviarMensaje('ACTION:GIRAR_RULETA', {
        mesasManuales: numMesas,
        duracionSegundos: duracionGiroWS,
      });
    } else {
      console.warn('⚠️ El WebSocket no está conectado, pero la ruleta girará localmente.');
    }
  };

  // Evita renderizar diferencias estructurales antes de que el cliente monte el DOM completo
  if (!montado) {
    return <div className="min-h-screen bg-[#020106]" />;
  }

  return (
    <main className="relative min-h-screen pt-4 sm:pt-6 pb-8 px-4 sm:px-6 lg:px-8 bg-[#020106] flex flex-col items-center gap-4 select-none overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-tr from-[#060413] via-[#020106] to-[#0a071d] z-0" />

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

      <h1 className="relative z-10 font-orbitron font-black text-2xl sm:text-4xl uppercase tracking-[0.2em] text-white text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] leading-none mb-2">
        ZONA DE JUEGO: <br className="sm:hidden" />
        <span className="text-[#2ee6d6] drop-shadow-[0_0_12px_#2ee6d6,0_0_30px_#2ee6d6] animate-pulse ml-2 sm:ml-0">
          PRUEBA TU SUERTE
        </span>
      </h1>

      {!ruletaGenerada ? (
        <div className="relative z-10 mt-6 flex flex-col gap-6 items-center w-full max-w-md bg-[#060413]/60 backdrop-blur-md border border-[#1f1645] p-8 rounded-2xl shadow-[0_0_25px_rgba(31,22,69,0.4)] hover:border-purple-500/30 transition-all duration-300">
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
            onClick={manejarGiroManual}
            className="w-full py-3.5 rounded-xl bg-[#ff00a0] font-orbitron font-black text-xs sm:text-sm tracking-widest text-white uppercase shadow-[0_0_20px_rgba(255,0,160,0.6)] hover:shadow-[0_0_35px_rgba(255,0,160,0.9)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            🔥 ENCIENDE LA RULETA GLOBAL
          </button>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-5xl animate-fadeIn">
          <RuletaMesas
            numMesas={numMesas}
            mesaGanadoraTarget={mesaGanadoraTarget}
            duracionSegundos={duracionGiroWS}
            onInicioGiro={activarBuenaSuerte}
            onResultado={() => lanzarConfeti()}
            onVolverGirar={manejarGiroManual}
          />

          <button
            onClick={() => setRuletaGenerada(false)}
            className="px-5 py-2.5 rounded-lg border border-gray-600 bg-transparent font-orbitron font-bold text-xs tracking-wider text-gray-400 uppercase hover:border-white hover:text-white hover:shadow-[0_0_12px_rgba(255,255,255,0.4)] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            ← DETENER / RECONFIGURAR
          </button>
        </div>
      )}
    </main>
  );
}