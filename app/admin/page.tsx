'use client';

import Link from 'next/link';
import { useMesa } from '@/lib/context/MesaContext';
import { useSimulacionJuego } from '@/lib/context/PanelControlContext';
import PanelSimulacionAdmin from '@/app/components/juegos/PanelSimulacionAdmin';

export default function PaginaAdmin() {
  const { numeroMesa, setNumeroMesa } = useMesa();
  const { estado, activarJuego, desactivarJuego } = useSimulacionJuego();

  return (
    <main className="relative min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#020106] flex flex-col items-center gap-8 select-none">
      {/* Capa de fondo Neo-Punk */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#060413] via-[#020106] to-[#0a071d] z-0 pointer-events-none" />

      {/* Encabezado */}
      <div className="relative z-10 text-center max-w-3xl">
        <h1 className="font-orbitron font-black text-2xl sm:text-4xl uppercase tracking-[0.2em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          CABINA DE CONTROL <span className="text-[#ff00a0]">DJ / ADMIN</span>
        </h1>
        <p className="font-space text-slate-300 text-xs sm:text-sm mt-2 font-bold tracking-wider">
          Activa eventos en tiempo real para las mesas y gestiona los juegos.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-8">
        
        {/* PANEL DE CONTROL DE JUEGOS EN VIVO */}
        <div className="flex justify-center w-full">
          <PanelSimulacionAdmin
            numeroMesa={numeroMesa}
            setNumeroMesa={setNumeroMesa}
            onActivar={activarJuego}
            onDesactivar={desactivarJuego}
            juegoActivo={estado.juegoActivo}
          />
        </div>

        {/* ACCESOS A JUEGOS Y RULETA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
          
          {/* Tarjeta 1: Ver Juegos */}
          <Link
            href="/juegos"
            className="group relative w-full p-[2px] rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#00f3ff,transparent,#ff00a0,transparent)] opacity-60 group-hover:opacity-100 transition-all duration-500" />
            <div className="relative z-10 bg-[#080516] p-6 rounded-[10px] flex flex-col gap-2 items-center text-center h-full justify-between">
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl">🎮</span>
                <h3 className="font-orbitron font-black text-white text-lg tracking-wider uppercase">
                  Ver Juegos
                </h3>
                <p className="font-space text-slate-300 text-xs font-semibold">
                  Accede a la sección principal de juegos interactivos.
                </p>
              </div>
              <span className="mt-4 text-[#00f3ff] font-orbitron text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Ver Juegos →
              </span>
            </div>
          </Link>

          {/* Tarjeta 2: Ruleta de Mesas */}
          <Link
            href="/admin/ruleta"
            className="group relative w-full p-[2px] rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#ff00a0,transparent,#00f3ff,transparent)] opacity-60 group-hover:opacity-100 transition-all duration-500" />
            <div className="relative z-10 bg-[#080516] p-6 rounded-[10px] flex flex-col gap-2 items-center text-center h-full justify-between">
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl">🎰</span>
                <h3 className="font-orbitron font-black text-white text-lg tracking-wider uppercase">
                  Ruleta de Mesas
                </h3>
                <p className="font-space text-slate-300 text-xs font-semibold">
                  Abre la pantalla completa de la ruleta para realizar sorteos en vivo.
                </p>
              </div>
              <span className="mt-4 text-[#ff00a0] font-orbitron text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Abrir Ruleta →
              </span>
            </div>
          </Link>

        </div>

      </div>
    </main>
  );
}