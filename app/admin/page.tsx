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

        {/* ACCESO ÚNICO A JUEGOS */}
        <div className="flex justify-center w-full">
          <Link
            href="/juegos"
            className="group relative w-full max-w-md p-[2px] rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#00f3ff,transparent,#ff00a0,transparent)] opacity-60 group-hover:opacity-100 transition-all duration-500" />
            <div className="relative z-10 bg-[#080516] p-6 rounded-[10px] flex flex-col gap-2 items-center text-center h-full">
              <span className="text-4xl">🎮</span>
              <h3 className="font-orbitron font-black text-white text-lg tracking-wider uppercase">
                Ver Juegos
              </h3>
              <p className="font-space text-slate-300 text-xs font-semibold">
                Accede a la sección principal de juegos interactivos y ruletas.
              </p>
              <span className="mt-2 text-[#00f3ff] font-orbitron text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Ver Juegos →
              </span>
            </div>
          </Link>
        </div>

      </div>
    </main>
  );
}