'use client';

import { useMesa } from '@/lib/context/MesaContext';
import { useSimulacionJuego } from '@/lib/context/PanelControlContext';
import { JUEGOS_CONFIG } from '@/lib/types/juegos';
import TarjetaJuego from '@/app/components/juegos/TargetaJuego';

export default function JuegosPage() {
  const { numeroMesa } = useMesa();
  const { estado } = useSimulacionJuego();

  // El sistema tiene un juego activo si hay un ID asignado Y la bandera activo es true
  const hayJuegoActivo = Boolean(estado.juegoActivo && estado.activo !== false);

  return (
    <div className="px-4 pt-6 pb-10 md:px-10 min-h-screen max-w-6xl mx-auto flex flex-col justify-start">
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

      {/* Encabezado compacto y centrado */}
      <div className="text-center mb-5 flex flex-col items-center gap-2">
        {/* Indicador de estado discreto tipo Pill */}
        <span
          className={`font-space font-bold text-[10px] md:text-xs tracking-widest uppercase px-4 py-1 rounded-full border backdrop-blur-md transition-all duration-500 ${
            hayJuegoActivo
              ? 'border-[#2ee6d6] text-[#2ee6d6] bg-[#2ee6d6]/10 shadow-[0_0_15px_rgba(46,230,214,0.3)] animate-pulse'
              : 'border-white/10 text-gray-400 bg-black/40'
          }`}
        >
          {hayJuegoActivo ? '🔥 JUEGO EN VIVO DENTRO' : 'STANDBY • ESPERANDO DJ'}
        </span>

        {/* Título Principal Centrado */}
        <h1 className="font-orbitron text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-[0.15em] animacion-corto">
          Juegos de la noche
        </h1>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {JUEGOS_CONFIG.map((juego) => {
          // 1. Validar si este juego en específico es el que activó el Admin
          const esElActivo = hayJuegoActivo && estado.juegoActivo === juego.id;

          // 2. Determinar disponibilidad:
          // - Si es 'global': Disponible para todos en toda la discoteca.
          // - Si es 'por_mesa': Solo disponible si la mesa de este cliente coincide con la mesa objetivo.
          const esParaMi =
            esElActivo &&
            (juego.tipo === 'global' ||
              (juego.tipo === 'por_mesa' && estado.mesaObjetivo === numeroMesa));

          return (
            <TarjetaJuego
              key={juego.id}
              id={juego.id}
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