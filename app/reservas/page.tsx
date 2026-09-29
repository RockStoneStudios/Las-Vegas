'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import QuickPinchZoom, { make3dTransformValue } from 'react-quick-pinch-zoom';
import {
  Calendar,
  Clock,
  Users,
  User,
  Phone,
  Mail,
  CheckCircle,
  Disc,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';

interface IMesa {
  id: string;
  numero: string;
  tipo: 'MESA' | 'BARRA' | 'ESCENARIO' | 'VIP' | 'PISTA_BAILE';
  capacidad: number;
  posX: number;
  posY: number;
  width: number;
  height: number;
  estado?: 'DISPONIBLE' | 'OCUPADA' | 'RESERVADA';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ReservasClientePage() {
  const [mesas, setMesas] = useState<IMesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<IMesa | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reservaExitosa, setReservaExitosa] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pinchZoomRef = useRef<any>(null);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora: '20:00',
    personas: 2,
    nombreCliente: '',
    telefonoCliente: '',
    emailCliente: '',
  });

  useEffect(() => {
    fetchMesas();
  }, [formData.fecha, formData.hora]);

  const fetchMesas = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/mesas?fecha=${formData.fecha}&hora=${formData.hora}`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setMesas(data);
      }
    } catch (error) {
      console.error('Error cargando el mapa de mesas:', error);
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = useCallback(({ x, y, scale }: { x: number; y: number; scale: number }) => {
    if (containerRef.current) {
      const value = make3dTransformValue({ x, y, scale });
      containerRef.current.style.setProperty('transform', value);
    }
  }, []);

  const handleZoomIn = () => {
    if (pinchZoomRef.current) {
      pinchZoomRef.current.scaleTo({ x: 300, y: 250, scale: 1.5 });
    }
  };

  const handleZoomOut = () => {
    if (pinchZoomRef.current) {
      pinchZoomRef.current.scaleTo({ x: 300, y: 250, scale: 0.8 });
    }
  };

  const handleResetZoom = () => {
    if (pinchZoomRef.current) {
      pinchZoomRef.current.scaleTo({ x: 0, y: 0, scale: 1 });
    }
  };

  const handleSeleccionarMesa = (mesa: IMesa) => {
    if (mesa.tipo === 'ESCENARIO' || mesa.tipo === 'PISTA_BAILE') return;
    if (mesa.estado === 'OCUPADA' || mesa.estado === 'RESERVADA') return;

    setMesaSeleccionada(mesa);
    setFormData((prev) => ({
      ...prev,
      personas: Math.min(prev.personas, mesa.capacidad),
    }));
  };

  const handleCrearReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesaSeleccionada) {
      alert('Por favor selecciona una mesa disponible en el mapa');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mesaId: mesaSeleccionada.id,
          fecha: formData.fecha,
          hora: formData.hora,
          personas: Number(formData.personas),
          nombreCliente: formData.nombreCliente,
          telefonoCliente: formData.telefonoCliente,
          emailCliente: formData.emailCliente,
        }),
      });

      if (res.ok) {
        setReservaExitosa(true);
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || 'No se pudo procesar la reserva'}`);
      }
    } catch (error) {
      console.error('Error al crear reserva:', error);
      alert('Error de conexión al enviar la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  const getEstiloMesa = (mesa: IMesa) => {
    const esSeleccionada = mesaSeleccionada?.id === mesa.id;
    const esOcupada = mesa.estado === 'OCUPADA' || mesa.estado === 'RESERVADA';

    if (mesa.tipo === 'ESCENARIO') {
      return 'bg-purple-950/60 border-purple-500 text-purple-200 font-bold uppercase pointer-events-none';
    }
    if (mesa.tipo === 'PISTA_BAILE') {
      return 'bg-pink-950/40 border-pink-500/80 text-pink-300 font-bold uppercase border-dashed pointer-events-none';
    }
    if (esOcupada) {
      return 'bg-red-950/40 border-red-800 text-red-400 opacity-60 cursor-not-allowed';
    }
    if (esSeleccionada) {
      return 'bg-amber-500/30 border-amber-400 text-amber-200 ring-2 ring-amber-400 scale-105 transition-transform cursor-pointer shadow-amber-500/20';
    }
    if (mesa.tipo === 'VIP') {
      return 'bg-amber-950/30 border-amber-600/60 text-amber-300 hover:border-amber-400 cursor-pointer';
    }
    if (mesa.tipo === 'BARRA') {
      return 'bg-cyan-950/40 border-cyan-600/60 text-cyan-300 hover:border-cyan-400 cursor-pointer';
    }

    return 'bg-zinc-800/80 border-zinc-600 text-zinc-200 hover:border-zinc-400 cursor-pointer';
  };

  // Calcular tamaño del contenedor basado en las mesas
  const containerWidth = Math.max(...mesas.map(m => m.posX + (m.width || 80)), 600) + 100;
  const containerHeight = Math.max(...mesas.map(m => m.posY + (m.height || 80)), 400) + 100;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 text-white min-h-screen">
      {/* HEADER */}
      <div className="bg-zinc-900 p-4 md:p-6 rounded-xl border border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3 text-amber-500">
            Reserva tu Lugar
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Usa dos dedos en móvil o la rueda del mouse para hacer zoom y explorar el plano.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs bg-zinc-950/60 px-3 py-2 rounded-lg border border-zinc-800 w-full md:w-auto">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-500"></span> Disponibles
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50 border border-amber-400"></span> Elegida
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-950 border border-red-700"></span> Ocupadas
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CANVAS INTERACTIVO */}
        <div className="lg:col-span-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800 relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-zinc-400">
              Plano Interactivo (Pinch & Pan)
            </h2>

            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 z-10">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition cursor-pointer"
                title="Aumentar Zoom"
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition cursor-pointer"
                title="Reducir Zoom"
              >
                <ZoomOut size={16} />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition cursor-pointer"
                title="Restablecer Vista"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-[550px] flex items-center justify-center text-zinc-500">
              Cargando mapa...
            </div>
          ) : (
            <div className="relative w-full h-[550px] bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800 overflow-hidden">
              <QuickPinchZoom
                ref={pinchZoomRef}
                onUpdate={onUpdate}
                minZoom={0.5}
                maxZoom={3}
                zoomOutFactor={0}
                enforceBoundsDuringZoom={false}
                draggableUnZoomed={true}
                shouldInterceptWheel={() => false}
              >
                <div
                  ref={containerRef}
                  className="relative select-none origin-top-left"
                  style={{
                    width: `${containerWidth}px`,
                    height: `${containerHeight}px`,
                    backgroundImage:
                      'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                >
                  {mesas.map((mesa) => {
                    const mesaWidth = mesa.width || 80;
                    const mesaHeight = mesa.height || 80;

                    return (
                      <div
                        key={mesa.id}
                        onClick={() => handleSeleccionarMesa(mesa)}
                        style={{
                          position: 'absolute',
                          left: `${mesa.posX}px`,
                          top: `${mesa.posY}px`,
                          width: `${mesaWidth}px`,
                          height: `${mesaHeight}px`,
                        }}
                        className={`border-2 rounded-xl p-2 flex flex-col justify-between shadow-lg transition-all ${getEstiloMesa(mesa)}`}
                      >
                        <div className="flex justify-between items-center">
                          {/* ⬇️ CAMBIO: text-base en mobile, text-xs en desktop */}
                          <span className="font-bold text-base sm:text-xs truncate flex items-center gap-1">
                            {mesa.tipo === 'PISTA_BAILE' && (
                              <Disc size={16} className="sm:w-3 sm:h-3 animate-spin" />
                            )}
                            {mesa.numero}
                          </span>
                          {mesa.tipo === 'VIP' && (
                            // ⬇️ CAMBIO: text-sm en mobile, text-[9px] en desktop
                            <span className="text-sm sm:text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/40">
                              VIP
                            </span>
                          )}
                        </div>

                        {mesa.tipo !== 'ESCENARIO' && mesa.tipo !== 'PISTA_BAILE' && (
                          // ⬇️ CAMBIO: text-sm en mobile, text-[10px] en desktop
                          <div className="flex justify-between items-end text-sm sm:text-[10px] opacity-90">
                            <span className="flex items-center gap-1">
                              <Users size={14} className="sm:w-2.5 sm:h-2.5" /> Cap. {mesa.capacidad}
                            </span>
                            {mesa.estado === 'OCUPADA' && (
                              <span className="font-bold text-red-400">Ocupada</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </QuickPinchZoom>
            </div>
          )}
        </div>

        {/* PANEL DE FORMULARIO */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 space-y-5">
          {reservaExitosa ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle className="text-emerald-500 mx-auto" size={56} />
              <h2 className="text-2xl font-bold text-white">
                ¡Reserva Confirmada!
              </h2>
              <p className="text-zinc-400 text-sm">
                Hemos registrado tu reserva para la mesa{' '}
                <strong className="text-amber-400">
                  {mesaSeleccionada?.numero}
                </strong>{' '}
                el {formData.fecha} a las {formData.hora}.
              </p>
              <button
                onClick={() => {
                  setReservaExitosa(false);
                  setMesaSeleccionada(null);
                  fetchMesas();
                }}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-lg transition text-sm cursor-pointer"
              >
                Hacer otra reserva
              </button>
            </div>
          ) : (
            <form onSubmit={handleCrearReserva} className="space-y-4">
              <h2 className="text-lg font-semibold text-white border-b border-zinc-800 pb-3">
                Detalles de Reserva
              </h2>

              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400 block">
                    Ubicación elegida:
                  </span>
                  <span className="font-bold text-amber-400 text-base">
                    {mesaSeleccionada
                      ? mesaSeleccionada.numero
                      : 'Toca una mesa disponible'}
                  </span>
                </div>
                {mesaSeleccionada && (
                  <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                    Máx {mesaSeleccionada.capacidad} pers.
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 flex items-center gap-1 mb-1">
                    <Calendar size={12} /> Fecha
                  </label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) =>
                      setFormData({ ...formData, fecha: e.target.value })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 flex items-center gap-1 mb-1">
                    <Clock size={12} /> Hora
                  </label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) =>
                      setFormData({ ...formData, hora: e.target.value })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 flex items-center gap-1 mb-1">
                  <Users size={12} /> Asistentes
                </label>
                <input
                  type="number"
                  min="1"
                  max={mesaSeleccionada?.capacidad || 20}
                  value={formData.personas}
                  onChange={(e) =>
                    setFormData({ ...formData, personas: Number(e.target.value) })
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs text-zinc-400 flex items-center gap-1 mb-1">
                    <User size={12} /> Nombre Completo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Carlos Mendoza"
                    value={formData.nombreCliente}
                    onChange={(e) =>
                      setFormData({ ...formData, nombreCliente: e.target.value })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 flex items-center gap-1 mb-1">
                    <Phone size={12} /> Teléfono
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej: +57 300 123 4567"
                    value={formData.telefonoCliente}
                    onChange={(e) =>
                      setFormData({ ...formData, telefonoCliente: e.target.value })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 flex items-center gap-1 mb-1">
                    <Mail size={12} /> Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="Ej: carlos@gmail.com"
                    value={formData.emailCliente}
                    onChange={(e) =>
                      setFormData({ ...formData, emailCliente: e.target.value })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!mesaSeleccionada || submitting}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold py-3 rounded-lg text-sm transition mt-4 cursor-pointer"
              >
                {submitting ? 'Confirmando Reserva...' : 'Confirmar y Reservar'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}