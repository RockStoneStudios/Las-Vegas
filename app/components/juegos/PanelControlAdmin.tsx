'use client';

import { useState, useEffect } from 'react';
import { useSocketStore } from '@/lib/store/useSocketStore';

interface Props {
  sessionId: string;
  numeroMesa: number | null;
  setNumeroMesa: (n: number | null) => void;
}

export default function PanelControlAdmin({ sessionId, numeroMesa, setNumeroMesa }: Props) {
  const [textoMesa, setTextoMesa] = useState(numeroMesa?.toString() ?? '2');

  // 🎡 Estados para la Ruleta General de Mesas
  const [mesasManualesInput, setMesasManualesInput] = useState<string>('');
  const [duracionGiro, setDuracionGiro] = useState<number>(10);

  // Obtenemos los métodos del WebSocket Store
  const { conectarSocket, enviarMensaje, conectado } = useSocketStore();

  // 1. Conectamos al WebSocket usando el sessionId real proveniente del Login
  useEffect(() => {
    if (sessionId) {
      conectarSocket(sessionId);
    }

    // Limpieza al desmontar
    return () => {
      useSocketStore.getState().desconectarSocket();
    };
  }, [sessionId, conectarSocket]);

  useEffect(() => {
    setTextoMesa(numeroMesa?.toString() ?? '2');
  }, [numeroMesa]);

  function manejarCambioMesa(valor: string) {
    setTextoMesa(valor);
    const n = Number(valor);
    if (valor !== '' && !Number.isNaN(n)) {
      setNumeroMesa(n);
    } else if (valor === '') {
      setNumeroMesa(null);
    }
  }

  // 2. Emitir habilitación del juego privado para una mesa específica
  function habilitarJuegoEnMesa(juegoId: string) {
    const mesaObjetivo = Number(textoMesa) || 2;

    enviarMensaje('ACTION:HABILITAR_JUEGO_PRIVADO', {
      juegoId,
      mesaDestino: mesaObjetivo,
    });
  }

  // 3. Disparar la Ruleta General para TODAS las mesas
  function dispararRuletaGeneral() {
    const cantidadMesas = mesasManualesInput.trim() !== '' ? Number(mesasManualesInput) : undefined;

    enviarMensaje('ACTION:GIRAR_RULETA', {
      duracionSegundos: duracionGiro,
      mesasManuales: cantidadMesas, // Envía el número (ej. 20) o undefined si se dejó vacío
    });
  }

  return (
    <div className="mb-8 w-full max-w-4xl rounded-xl border-2 border-[#ffb703] bg-[#0c0824]/90 p-5 shadow-[0_0_25px_rgba(255,183,3,0.15)] select-none relative overflow-hidden font-orbitron flex flex-col gap-6">
      {/* Línea decorativa neón superior */}
      <div className="absolute top-0 left-0 h-[2px] w-full bg-[#ffb703] shadow-[0_0_10px_#ffb703]" />

      {/* Cabecera del Panel */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#ffb703] text-sm animate-pulse">⚡</span>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffb703] drop-shadow-[0_0_8px_rgba(255,183,3,0.4)]">
            CABINA DE CONTROL EN VIVO
          </p>
        </div>

        {/* Status WS */}
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            conectado
              ? 'bg-green-500/10 border-green-500/50 text-green-400'
              : 'bg-red-500/10 border-red-500/50 text-red-400'
          }`}
        >
          {conectado ? 'ONLINE' : 'DESCONECTADO'}
        </span>
      </div>

      {/* SECCIÓN 1: ACTIVACIÓN DE JUEGOS INDIVIDUALES POR MESA */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 border-t border-[#ffb703]/20 pt-4">
        {/* Selector de Mesa */}
        <div className="flex items-center gap-3 bg-[#020106]/80 px-4 py-2 rounded-xl border border-[#ffb703]/30 shrink-0">
          <label className="font-space font-black text-[10px] uppercase tracking-widest text-gray-400 whitespace-nowrap">
            Mesa Objetivo:
          </label>
          <input
            type="number"
            value={textoMesa}
            onChange={(e) => manejarCambioMesa(e.target.value)}
            className="w-16 bg-[#0c0824] border border-[#ffb703]/40 rounded-lg px-2 py-1 font-bold text-center text-[#ffb703] text-sm shadow-[0_0_8px_rgba(255,183,3,0.15)] focus:outline-none focus:border-[#ffb703] focus:shadow-[0_0_12px_rgba(255,183,3,0.4)] transition-all duration-200"
          />
        </div>

        {/* Botones de Juegos Privados (Hechos a mano) */}
        <div className="flex flex-wrap gap-2 items-center flex-1">
          
          {/* 1. Ruleta de Premios */}
          <button
            onClick={() => habilitarJuegoEnMesa('ruleta-premios')}
            disabled={!conectado}
            className="text-[10px] font-black tracking-widest uppercase px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer disabled:opacity-50 bg-[#060413]/60 text-[#ffb703] border-[#ffb703]/30 hover:border-[#ffb703] hover:shadow-[0_0_10px_rgba(255,183,3,0.3)]"
          >
            🎁 HABILITAR RULETA DE PREMIOS
          </button>

          {/* 2. Slot Machine (Tragamonedas) - Reemplazó a "Mesa que más Aplauda" */}
          <button
            onClick={() => habilitarJuegoEnMesa('slot')}
            disabled={!conectado}
            className="text-[10px] font-black tracking-widest uppercase px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer disabled:opacity-50 bg-[#060413]/60 text-[#ffb703] border-[#ffb703]/30 hover:border-[#ffb703] hover:shadow-[0_0_10px_rgba(255,183,3,0.3)]"
          >
            🎰 HABILITAR SLOT (TRAGAMONEDAS)
          </button>

          {/* 3. Reto de los 100 clics (o el que tengas) */}
          <button
            onClick={() => habilitarJuegoEnMesa('reto-100-clics')}
            disabled={!conectado}
            className="text-[10px] font-black tracking-widest uppercase px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer disabled:opacity-50 bg-[#060413]/60 text-[#ffb703] border-[#ffb703]/30 hover:border-[#ffb703] hover:shadow-[0_0_10px_rgba(255,183,3,0.3)]"
          >
            🔥 HABILITAR RETO 100 CLICS
          </button>

        </div>
      </div>

      {/* SECCIÓN 2: CONTROL DE RULETA GENERAL DE MESAS EN TIEMPO REAL */}
      <div className="flex flex-col gap-4 border-t border-[#ffb703]/20 pt-4">
        <div className="flex items-center gap-2">
          <span className="text-[#00f3ff] text-sm">🎡</span>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#00f3ff] drop-shadow-[0_0_8px_rgba(0,243,255,0.4)]">
            SORTEO RULETA GENERAL (TODAS LAS MESAS)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Input para número de mesas manuales */}
          <div className="flex flex-col gap-1.5 bg-[#020106]/60 p-3 rounded-xl border border-[#00f3ff]/20">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">
              # Mesas en Ruleta (Opcional):
            </label>
            <input
              type="number"
              min="1"
              max="50"
              placeholder="Auto (Solo conectadas)"
              value={mesasManualesInput}
              onChange={(e) => setMesasManualesInput(e.target.value)}
              className="bg-[#0c0824] border border-[#00f3ff]/40 rounded-lg px-3 py-1.5 font-bold text-white text-xs shadow-[0_0_8px_rgba(0,243,255,0.15)] focus:outline-none focus:border-[#00f3ff] transition-all"
            />
            <span className="text-[9px] text-slate-400 font-space">
              * Vacío = usa automáticamente las mesas activas.
            </span>
          </div>

          {/* Input para la duración del giro */}
          <div className="flex flex-col gap-1.5 bg-[#020106]/60 p-3 rounded-xl border border-[#00f3ff]/20">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">
              Duración Giro (Segundos):
            </label>
            <input
              type="number"
              min="5"
              max="22"
              value={duracionGiro}
              onChange={(e) => setDuracionGiro(Number(e.target.value))}
              className="bg-[#0c0824] border border-[#00f3ff]/40 rounded-lg px-3 py-1.5 font-bold text-[#00f3ff] text-xs shadow-[0_0_8px_rgba(0,243,255,0.15)] focus:outline-none focus:border-[#00f3ff] transition-all"
            />
            <span className="text-[9px] text-slate-400 font-space">
              * Mínimo recomendado: 10 a 15 segs.
            </span>
          </div>
        </div>

        {/* Botón Disparador de la Ruleta General */}
        <button
          onClick={dispararRuletaGeneral}
          disabled={!conectado}
          className="w-full bg-[#00f3ff] hover:bg-[#00d0ff] text-black font-black text-xs py-3 rounded-xl uppercase tracking-[0.2em] transition-all duration-200 shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:shadow-[0_0_25px_rgba(0,243,255,0.7)] cursor-pointer disabled:opacity-50"
        >
          🚀 LANZAR RULETA GENERAL EN TIEMPO REAL
        </button>
      </div>
    </div>
  );
}