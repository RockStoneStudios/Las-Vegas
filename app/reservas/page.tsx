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
  Maximize2,
  MapPin,
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

// Forzamos el puerto 3001 donde está corriendo tu Elysia
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Zonas del lienzo según el plano del local (igual que el editor admin):
// Z3 (arriba-izq) · Z1 (arriba-der) · Z4 (abajo-izq) · Z2 (abajo-der)
type ZonaId = 'Z1' | 'Z2' | 'Z3' | 'Z4';

const ZONAS: ZonaId[] = ['Z1', 'Z2', 'Z3', 'Z4'];

const POSICION_ZONA: Record<ZonaId, { left: string; top: string }> = {
  Z1: { left: '50%', top: '0%' },
  Z2: { left: '50%', top: '50%' },
  Z3: { left: '0%', top: '0%' },
  Z4: { left: '0%', top: '50%' },
};

const COLORES_ZONA: Record<ZonaId, string> = {
  Z1: 'text-emerald-300 border-emerald-500/60',
  Z2: 'text-sky-300 border-sky-500/60',
  Z3: 'text-orange-300 border-orange-500/60',
  Z4: 'text-fuchsia-300 border-fuchsia-500/60',
};

export default function ReservasClientePage() {
  const [mesas, setMesas] = useState<IMesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<IMesa | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reservaExitosa, setReservaExitosa] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const pinchZoomRef = useRef<any>(null);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora: '20:00',
    personas: 2,
    nombreCliente: '',
    telefonoCliente: '',
    emailCliente: '',
  });

  // El mapa solo se carga una vez al entrar a la página
  useEffect(() => {
    fetchMesas();
  }, []);

  const fetchMesas = async () => {
    try {
      setLoading(true);
      // Petición limpia a la ruta que ya tienes en tu backend
      const res = await fetch(`${API_URL}/mesas`);

      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

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

  // Calcular tamaño del contenedor basado en las mesas
  const containerWidth = Math.max(...mesas.map((m) => m.posX + (m.width || 64)), 600) + 100;
  const containerHeight = Math.max(...mesas.map((m) => m.posY + (m.height || 64)), 400) + 100;

  // Ajustar el plano completo a la pantalla (auto-fit): calcula la escala y centra
  const ajustarVista = useCallback(() => {
    const wrapper = canvasWrapperRef.current;
    const pinch = pinchZoomRef.current;
    if (!wrapper || !pinch || mesas.length === 0) return;

    const escala = Math.min(
      (wrapper.clientWidth - 8) / containerWidth,
      (wrapper.clientHeight - 8) / containerHeight,
      1.2 // no agrandar de más en pantallas grandes
    );
    const escalaSegura = Math.max(escala, 0.3);

    const x = Math.max(0, (wrapper.clientWidth - containerWidth * escalaSegura) / 2);
    const y = Math.max(0, (wrapper.clientHeight - containerHeight * escalaSegura) / 2);

    pinch.scaleTo({ x, y, scale: escalaSegura });
  }, [containerWidth, containerHeight, mesas.length]);

  // Auto-fit al cargar el mapa (y cada vez que se recargue la lista de mesas)
  useEffect(() => {
    if (loading || mesas.length === 0) return;
    const t = setTimeout(() => ajustarVista(), 120);
    return () => clearTimeout(t);
  }, [loading, mesas, ajustarVista]);

  // Zona de una posición del plano (según el plano: Z3·Z1 arriba, Z4·Z2 abajo)
  const getZonaDe = (x: number, y: number): ZonaId => {
    const arriba = y < containerHeight / 2;
    const derecha = x >= containerWidth / 2;
    if (arriba && derecha) return 'Z1';
    if (!arriba && derecha) return 'Z2';
    if (arriba && !derecha) return 'Z3';
    return 'Z4';
  };

  const handleSeleccionarMesa = (mesa: IMesa) => {
    if (mesa.tipo === 'ESCENARIO' || mesa.tipo === 'PISTA_BAILE') return;
    if (mesa.estado === 'OCUPADA' || mesa.estado === 'RESERVADA') return;

    setMesaSeleccionada(mesa);
    setFormData((prev) => ({
      ...prev,
      personas: Math.min(prev.personas, mesa.capacidad),
    }));

    // Anchor Scrolling: en móvil/tablet la vista baja automáticamente al formulario
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
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
          // 🚀 Nombres exactos que espera tu backend (Elysia + Repositorio)
          clienteNombre: formData.nombreCliente,
          clienteTelefono: formData.telefonoCliente,
          clienteEmail: formData.emailCliente,
        }),
      });

      if (res.ok) {
        setReservaExitosa(true);
      } else {
        const err = await res.json();
        const errorMsg = err.error || err.message || 'No se pudo procesar la reserva';
        alert(`Error: ${errorMsg}`);
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

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 text-white min-h-screen">
      {/* HEADER */}
      <div className="bg-zinc-900 p-4 md:p-6 rounded-xl border border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3 text-amber-500">
            Reserva tu Lugar
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Toca una mesa disponible y el formulario se abre solo. En móvil usa dos dedos para
            hacer zoom y explorar el plano por zonas.
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
              Plano Interactivo por Zonas (Pinch &amp; Pan)
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
                onClick={ajustarVista}
                className="p-1.5 hover:bg-zinc-800 text-amber-300 hover:text-amber-200 rounded transition cursor-pointer"
                title="Ajustar el plano completo a la pantalla"
              >
                <Maximize2 size={16} />
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

          {/* LEYENDA DE ZONAS con conteo de elementos */}
          {!loading && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {ZONAS.map((z) => (
                <span
                  key={z}
                  className={`text-[11px] font-semibold px-2 py-1 rounded border bg-zinc-900/60 ${
                    COLORES_ZONA[z]
                  }`}
                >
                  {z}: {mesas.filter((m) => getZonaDe(m.posX, m.posY) === z).length}
                </span>
              ))}
              <span className="text-[11px] text-zinc-500 ml-auto hidden sm:inline">
                Z3 · Z1 arriba — Z4 · Z2 abajo
              </span>
            </div>
          )}

          {loading ? (
            <div className="h-[550px] flex items-center justify-center text-zinc-500">
              Cargando mapa...
            </div>
          ) : (
            <div
              ref={canvasWrapperRef}
              className="relative w-full h-[550px] bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800 overflow-hidden"
            >
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
                  {/* DIVISIÓN POR ZONAS (decorativa, escala junto con el plano) */}
                  {ZONAS.map((z) => (
                    <div
                      key={z}
                      className="absolute pointer-events-none border border-dashed z-0"
                      style={{
                        left: POSICION_ZONA[z].left,
                        top: POSICION_ZONA[z].top,
                        width: '50%',
                        height: '50%',
                      }}
                    >
                      <span
                        className={`absolute top-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded border bg-zinc-950/80 ${
                          COLORES_ZONA[z]
                        }`}
                      >
                        {z}
                      </span>
                    </div>
                  ))}

                  {mesas.map((mesa) => {
                    // Tamaño mínimo al renderizar: las mesas muy pequeñas siguen
                    // siendo legibles y fáciles de tocar en móvil
                    const mesaWidth = Math.max(mesa.width || 64, 44);
                    const mesaHeight = Math.max(mesa.height || 64, 40);

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
                        <div className="flex justify-between items-center gap-1">
                          <span
                            className="font-bold text-sm truncate flex items-center gap-1"
                            title={mesa.numero}
                          >
                            {mesa.tipo === 'PISTA_BAILE' && (
                              <Disc size={14} className="animate-spin shrink-0" />
                            )}
                            {mesa.numero}
                          </span>
                          {mesa.tipo === 'VIP' && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/40 shrink-0">
                              VIP
                            </span>
                          )}
                        </div>

                        {mesa.tipo !== 'ESCENARIO' && mesa.tipo !== 'PISTA_BAILE' && (
                          <div className="flex justify-between items-end text-[11px] opacity-90">
                            <span className="flex items-center gap-1">
                              <Users size={12} className="shrink-0" /> Cap. {mesa.capacidad}
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

        {/* PANEL DE FORMULARIO (recibe el Anchor Scrolling al elegir mesa) */}
        <div ref={formRef} id="form-reserva" className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 space-y-5 scroll-mt-4">
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
              <p className="text-zinc-500 text-xs mt-2">
                Revisa tu correo <strong>{formData.emailCliente}</strong> para ver la confirmación.
              </p>
              <button
                onClick={() => {
                  setReservaExitosa(false);
                  setMesaSeleccionada(null);
                  fetchMesas(); // Recargamos para pintar la mesa en rojo (ocupada)
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

              <div
                className={`p-3 bg-zinc-950 rounded-lg border flex items-center justify-between transition ${
                  mesaSeleccionada
                    ? 'border-amber-500/60 ring-1 ring-amber-500/30'
                    : 'border-zinc-800'
                }`}
              >
                <div>
                  <span className="text-xs text-zinc-400 block flex items-center gap-1">
                    <MapPin size={12} /> Ubicación elegida:
                  </span>
                  <span className="font-bold text-amber-400 text-base">
                    {mesaSeleccionada
                      ? mesaSeleccionada.numero
                      : 'Toca una mesa disponible'}
                  </span>
                </div>
                {mesaSeleccionada && (
                  <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded shrink-0">
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