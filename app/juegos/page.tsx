'use client';

import { useMesa } from '@/lib/context/MesaContext';
import { useSimulacionJuego } from '@/lib/hooks/useSimulacionJuego';
import { JUEGOS_CONFIG } from '@/lib/types/juegos';
import TarjetaJuego from '@/app/components/juegos/TargetaJuego';
import PanelSimulacionAdmin from '@/app/components/juegos/PanelSimulacionAdmin';

export default function JuegosPage() {
  const { numeroMesa, setNumeroMesa } = useMesa();
  const { estado, activarJuego, desactivarJuego } = useSimulacionJuego();

  const hayJuegoActivo = estado.juegoActivo !== null;

  return (
    <div className="px-5 pt-28 pb-16 md:px-10 min-h-screen max-w-5xl mx-auto">
      <PanelSimulacionAdmin
        numeroMesa={numeroMesa}
        setNumeroMesa={setNumeroMesa}
        onActivar={activarJuego}
        onDesactivar={desactivarJuego}
        juegoActivo={estado.juegoActivo}
      />
<style jsx global>{`
        @keyframes cortocircuito {
          0%, 18%, 22%, 25%, 53%, 57%, 100% {
            opacity: 1;
            text-shadow: 0 0 10px #ff00a0, 0 0 20px #ff00a0, 0 0 40px #2ee6d6;
          }
          20%, 24%, 55% {
            opacity: 0.3;
            text-shadow: none;
          }
        }
        .animacion-corto {
          animation: cortocircuito 3s infinite;
        }
      `}</style>

      {/* Título Principal con Fuente Orbitron, Neón y Efecto de Cortocircuito */}
      <h1 className="font-orbitron text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-[0.2em] animacion-corto">
        Juegos de la noche
      </h1>

      {/* Subtítulo Dinámico con Badge Reactivo y la fuente Space */}
      <div className="flex justify-center">
        <p
          className={`font-space font-bold text-xs md:text-sm tracking-widest uppercase px-6 py-2.5 rounded-xl border backdrop-blur-md transition-all duration-500 ${
            hayJuegoActivo
              ? 'border-[#2ee6d6] text-[#2ee6d6] bg-[#2ee6d6]/10 shadow-[0_0_20px_rgba(46,230,214,0.25)] animate-pulse'
              : 'border-[#ff00a0]/30 text-gray-400 bg-[#060413]/60'
          }`}
        >
          {hayJuegoActivo ? (
            <span>🔥 ¡Hay un juego en vivo! Mira abajo 👇</span>
          ) : (
            <span>🚫 Esperando que el DJ active un concurso...</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {JUEGOS_CONFIG.map((juego) => {
          const esElActivo = estado.juegoActivo === juego.id;
          const esParaMi =
            esElActivo &&
            (juego.tipo === 'global' || (juego.tipo === 'por_mesa' && estado.mesaObjetivo === numeroMesa));

          return (
            <TarjetaJuego
              key={juego.id}
              nombre={juego.nombre}
              icono={juego.icono}
              tipo={juego.tipo}
              activo={esElActivo}
              disponibleParaMi={esParaMi}
              mesaObjetivo={estado.mesaObjetivo}
            />
          );
        })}
      </div>
    </div>
  );
}