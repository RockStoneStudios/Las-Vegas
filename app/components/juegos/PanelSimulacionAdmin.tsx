// app/components/juegos/PanelSimulacionAdmin.tsx
'use client';

import { useState, useEffect } from 'react';
import { EstadoJuego, JUEGOS_CONFIG, JuegoId } from '@/lib/types/juegos';

interface Props {
  numeroMesa: number | null;
  setNumeroMesa: (n: number) => void;
  onActivar: (parcial: Partial<EstadoJuego>) => void;
  onDesactivar: () => void;
  juegoActivo: JuegoId | null;
}

export default function PanelSimulacionAdmin({ numeroMesa, setNumeroMesa, onActivar, onDesactivar, juegoActivo }: Props) {
  // Estado LOCAL solo para lo que se ve en el input, como texto libre.
  const [textoMesa, setTextoMesa] = useState(numeroMesa?.toString() ?? '');

  useEffect(() => {
    setTextoMesa(numeroMesa?.toString() ?? '');
  }, [numeroMesa]);

  function manejarCambioMesa(valor: string) {
    setTextoMesa(valor);
    const n = Number(valor);
    if (valor !== '' && !Number.isNaN(n)) {
      setNumeroMesa(n);
    }
  }

  return (
    <div className="mb-8 w-full max-w-4xl rounded-xl border-2 border-[#ffb703] bg-[#0c0824]/90 p-5 shadow-[0_0_25px_rgba(255,183,3,0.15)] select-none relative overflow-hidden">
      {/* Línea decorativa neón superior */}
      <div className="absolute top-0 left-0 h-[2px] w-full bg-[#ffb703] shadow-[0_0_10px_#ffb703]" />

      {/* Cabecera del Panel */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#ffb703] text-sm animate-pulse">⚠️</span>
        <p className="font-orbitron text-xs font-black uppercase tracking-[0.2em] text-[#ffb703] drop-shadow-[0_0_8px_rgba(255,183,3,0.4)]">
          PANEL DE SIMULACIÓN — SOLO DESARROLLO
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 border-t border-[#ffb703]/20 pt-4">
        
        {/* Selector de Mesa - Reducido y ajustado sin w-full en el input */}
        <div className="flex items-center gap-3 bg-[#020106]/80 px-4 py-2 rounded-xl border border-[#ffb703]/30 shrink-0">
          <label className="font-space font-black text-[10px] uppercase tracking-widest text-gray-400 whitespace-nowrap">
            Mesa Actual:
          </label>
          <input
            type="number"
            value={textoMesa}
            onChange={(e) => manejarCambioMesa(e.target.value)}
            className="w-16 bg-[#0c0824] border border-[#ffb703]/40 rounded-lg px-2 py-1 font-orbitron font-bold text-center text-[#ffb703] text-sm shadow-[0_0_8px_rgba(255,183,3,0.15)] focus:outline-none focus:border-[#ffb703] focus:shadow-[0_0_12px_rgba(255,183,3,0.4)] transition-all duration-200"
          />
        </div>

        {/* Controles de Activación de Juegos */}
        <div className="flex flex-wrap gap-2 items-center flex-1">
          {JUEGOS_CONFIG.map((j) => {
            const estaActivo = juegoActivo === j.id;
            return (
              <button
                key={j.id}
                onClick={() =>
                  onActivar(
                    j.tipo === 'por_mesa'
                      ? { juegoActivo: j.id, tipo: j.tipo, mesaObjetivo: numeroMesa ?? 7 }
                      : { juegoActivo: j.id, tipo: j.tipo }
                  )
                }
                className={`font-orbitron text-[10px] font-black tracking-widest uppercase px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  estaActivo
                    ? 'bg-[#ffb703] text-black border-[#ffb703] shadow-[0_0_15px_rgba(255,183,3,0.6)] scale-[1.02]'
                    : 'bg-[#060413]/60 text-[#ffb703] border-[#ffb703]/30 hover:border-[#ffb703] hover:shadow-[0_0_10px_rgba(255,183,3,0.3)]'
                }`}
              >
                Activar {j.nombre}
              </button>
            );
          })}

          {/* Botón de Apagado Completo */}
          <button 
            onClick={onDesactivar} 
            className="font-orbitron text-[10px] font-black tracking-widest uppercase px-4 py-2.5 rounded-xl bg-red-600/10 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer md:ml-auto"
          >
            Desactivar Todo
          </button>
        </div>

      </div>
    </div>
  );
}