'use client';

import { useState } from 'react';
import RuletaMesas from '../components/RuletasMesa';

export default function PaginaAdmin() {
  const [numMesas, setNumMesas] = useState(16);
  const [ruletaGenerada, setRuletaGenerada] = useState(false);

  return (
    <main className="relative min-h-screen pt-28 pb-12 px-4 sm:px-6 lg:px-8 bg-[#020106] flex flex-col items-center gap-8 overflow-hidden select-none">
      {/* Capa de fondo con degradado Neo-Punk */}
      <div className="absolute inset-0 bg-linear-to-tr from-[#060413] via-[#020106] to-[#0a071d] z-0" />
      
      {/* Título Principal Ultra Llamativo - Con Orbitron e Hiper-Neón */}
      <h1 className="relative z-10 font-orbitron font-black text-2xl sm:text-4xl uppercase tracking-[0.2em] text-white text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] leading-none">
        ZONA DE JUEGO: <br className="sm:hidden" />
        <span className="text-[#2ee6d6] drop-shadow-[0_0_12px_#2ee6d6,0_0_30px_#2ee6d6] animate-pulse ml-2 sm:ml-0">
          PRUEBA TU SUERTE
        </span>
      </h1>

      {!ruletaGenerada && (
        <div className="relative z-10 flex flex-col gap-6 items-center w-full max-w-md bg-[#060413]/60 backdrop-blur-md border border-[#1f1645] p-8 rounded-2xl shadow-[0_0_25px_rgba(31,22,69,0.4)] hover:border-purple-500/30 transition-all duration-300">
          
          {/* Campo de Entrada de Datos - Con Space Grotesk */}
          <label className="font-space font-medium text-sm sm:text-base text-gray-300 flex flex-col sm:flex-row items-center gap-3 w-full justify-between">
            <span className="uppercase tracking-wider text-xs font-bold text-purple-400">
              🎰 ¿Cuántas mesas juegan?
            </span>
            <input
              type="number"
              min={2}
              max={50}
              value={numMesas}
              onChange={(e) => setNumMesas(Number(e.target.value))}
              className="w-full sm:w-24 px-3 py-2 bg-[#0c0824] border border-[#1f1645] rounded-xl font-orbitron font-bold text-center text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)] focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all duration-200"
            />
          </label>

          {/* Botón Principal Generar - Con Orbitron y Fucsia Explosivo */}
          <button
            onClick={() => setRuletaGenerada(true)}
            className="w-full py-3.5 rounded-xl bg-[#ff00a0] font-orbitron font-black text-xs sm:text-sm tracking-widest text-white uppercase shadow-[0_0_20px_rgba(255,0,160,0.6)] hover:shadow-[0_0_35px_rgba(255,0,160,0.9)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            🔥 ENCIENDE LA RULETA
          </button>
        </div>
      )}

      {ruletaGenerada && (
        <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-5xl">
          {/* Componente de la Ruleta */}
          <div className="w-full p-6 bg-[#060413]/40 backdrop-blur-sm border border-[#1f1645] rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <RuletaMesas numMesas={numMesas} />
          </div>

          {/* Botón Volver / Reset - Con Orbitron y Estilo Línea Neón */}
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