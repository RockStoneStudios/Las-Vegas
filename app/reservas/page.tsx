'use client';

import { useState, useEffect, useRef } from 'react';
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

// Límites de zoom del plano
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 3;
const ZOOM_INICIAL = 1; // abre con zoom cercano: mesas grandes y legibles

export default function ReservasClientePage() {
  const [mesas, setMesas] = useState<IMesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<IMesa | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reservaExitosa, setReservaExitosa] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

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

  // Calcular tamaño del plano basado en las mesas
  const containerWidth = Math.max(...mesas.map((m) => m.posX + (m.width || 64)), 600) + 100;
  const containerHeight = Math.max(...mesas.map((m) => m.posY + (m.height || 64)), 400) + 100;

  // ============================================================
  // ZOOM Y PAN PROPIOS (sin librerías): control total de la vista
  // ============================================================
  type Vista = { x: number; y: number; s: number };
  const vistaRef = useRef<Vista>({ x: 0, y: 0, s: ZOOM_INICIAL });
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const panRef = useRef<{ px: number; py: number; x0: number; y0: number } | null>(null);
  const pinchRef = useRef<{
    d0: number;
    cx0: number;
    cy0: number;
    s0: number;
    x0: number;
    y0: number;
  } | null>(null);
  const dragDistRef = useRef(0);

  const aplicarVista = () => {
    const { x, y, s } = vistaRef.current;
    if (containerRef.current) {
      containerRef.current.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    }
  };

  // Mantener el plano siempre a la vista (no se puede "perder" arrastrando)
  const clampVista = (v: Vista): Vista => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return v;
    const loX = Math.min(0, wrapper.clientWidth - containerWidth * v.s);
    const hiX = Math.max(0, wrapper.clientWidth - containerWidth * v.s);
    const loY = Math.min(0, wrapper.clientHeight - containerHeight * v.s);
    const hiY = Math.max(0, wrapper.clientHeight - containerHeight * v.s);
    return {
      s: v.s,
      x: Math.min(hiX, Math.max(loX, v.x)),
      y: Math.min(hiY, Math.max(loY, v.y)),
    };
  };

  const fijarVista = (v: Vista) => {
    vistaRef.current = clampVista(v);
    aplicarVista();
  };

  // Vista inicial: zoom cercano (100%), centrado en el plano
  const centrarVista = () => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;
    fijarVista({
      x: (wrapper.clientWidth - containerWidth) / 2,
      y: (wrapper.clientHeight - containerHeight) / 2,
      s: ZOOM_INICIAL,
    });
  };

  // Ver todo: escala exacta para que el plano completo entre en pantalla
  const ajustarVista = () => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;
    const s = Math.min(
      Math.max((wrapper.clientWidth - 16) / containerWidth, ZOOM_MIN),
      Math.max((wrapper.clientHeight - 16) / containerHeight, ZOOM_MIN),
      1
    );
    fijarVista({
      x: (wrapper.clientWidth - containerWidth * s) / 2,
      y: (wrapper.clientHeight - containerHeight * s) / 2,
      s,
    });
  };

  // Acercar/alejar hacia un punto de la vista (por defecto el centro)
  const zoomEn = (factor: number, fx?: number, fy?: number) => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;
    const { x, y, s } = vistaRef.current;
    const s2 = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, s * factor));
    if (s2 === s) return;
    const cx = fx ?? wrapper.clientWidth / 2;
    const cy = fy ?? wrapper.clientHeight / 2;
    fijarVista({
      x: cx - ((cx - x) / s) * s2,
      y: cy - ((cy - y) / s) * s2,
      s: s2,
    });
  };

  const handleZoomIn = () => zoomEn(1.3);
  const handleZoomOut = () => zoomEn(1 / 1.3);

  // Pan con 1 dedo/mouse y pellizco con 2 dedos (Pointer Events)
  const manejarPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;
    wrapper.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragDistRef.current = 0;

    if (pointersRef.current.size === 1) {
      panRef.current = {
        px: e.clientX,
        py: e.clientY,
        x0: vistaRef.current.x,
        y0: vistaRef.current.y,
      };
      pinchRef.current = null;
    } else if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      const rect = wrapper.getBoundingClientRect();
      pinchRef.current = {
        d0: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
        cx0: (a.x + b.x) / 2 - rect.left,
        cy0: (a.y + b.y) / 2 - rect.top,
        s0: vistaRef.current.s,
        x0: vistaRef.current.x,
        y0: vistaRef.current.y,
      };
      panRef.current = null;
    }
  };

  const manejarPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper || !pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Pellizco: la escala sigue la distancia entre dedos, anclada al punto medio
    if (pointersRef.current.size === 2 && pinchRef.current) {
      const [a, b] = [...pointersRef.current.values()];
      const rect = wrapper.getBoundingClientRect();
      const d = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
      const cx = (a.x + b.x) / 2 - rect.left;
      const cy = (a.y + b.y) / 2 - rect.top;
      const g = pinchRef.current;
      const s2 = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, (g.s0 * d) / g.d0));
      const fx = (g.cx0 - g.x0) / g.s0;
      const fy = (g.cy0 - g.y0) / g.s0;
      fijarVista({ x: cx - fx * s2, y: cy - fy * s2, s: s2 });
      dragDistRef.current = 99;
      return;
    }

    // Pan con un solo dedo / mouse
    if (pointersRef.current.size === 1 && panRef.current) {
      const p = panRef.current;
      const dx = e.clientX - p.px;
      const dy = e.clientY - p.py;
      dragDistRef.current = Math.max(dragDistRef.current, Math.hypot(dx, dy));
      fijarVista({ x: p.x0 + dx, y: p.y0 + dy, s: vistaRef.current.s });
    }
  };

  const manejarPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    pinchRef.current = null;

    if (pointersRef.current.size === 1) {
      const restante = [...pointersRef.current.values()][0];
      panRef.current = {
        px: restante.x,
        py: restante.y,
        x0: vistaRef.current.x,
        y0: vistaRef.current.y,
      };
    } else {
      panRef.current = null;
    }

    // Clic / tap corto (sin arrastre): seleccionar la mesa que está debajo
    // del puntero. Con setPointerCapture el evento click no llega a la mesa,
    // por eso la detectamos aquí directamente.
    if (dragDistRef.current <= 6 && pointersRef.current.size === 0) {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const mesaId = el?.closest('[data-mesa-id]')?.getAttribute('data-mesa-id');
      if (mesaId) {
        const mesa = mesas.find((m) => m.id === mesaId);
        if (mesa) handleSeleccionarMesa(mesa);
      }
    }
  };

  // Ctrl + rueda del mouse hace zoom alrededor del cursor (la rueda sola baja la página)
  useEffect(() => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;
    const manejarRueda = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const rect = wrapper.getBoundingClientRect();
      zoomEn(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - rect.left, e.clientY - rect.top);
    };
    wrapper.addEventListener('wheel', manejarRueda, { passive: false });
    return () => wrapper.removeEventListener('wheel', manejarRueda);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Al cargar el mapa: vista inicial con zoom cercano y centrada
  useEffect(() => {
    if (loading || mesas.length === 0) return;
    const t = setTimeout(() => centrarVista(), 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, mesas]);

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
            El plano abre con zoom cercano: arrastra para moverte, aléjate con dos dedos (o Ctrl +
            rueda en PC) o pulsa Ver todo. Toca una mesa libre y el formulario se abre solo.
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
              Plano Interactivo por Zonas
            </h2>

            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 z-10">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition cursor-pointer"
                title="Acercar"
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition cursor-pointer"
                title="Alejar"
              >
                <ZoomOut size={16} />
              </button>
              <button
                type="button"
                onClick={ajustarVista}
                className="p-1.5 hover:bg-zinc-800 text-amber-300 hover:text-amber-200 rounded transition cursor-pointer"
                title="Ver todo el plano de una vez"
              >
                <Maximize2 size={16} />
              </button>
              <button
                type="button"
                onClick={centrarVista}
                className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition cursor-pointer"
                title="Vista inicial (zoom cercano)"
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
              className="relative w-full h-[550px] bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800 overflow-hidden cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
              onPointerDown={manejarPointerDown}
              onPointerMove={manejarPointerMove}
              onPointerUp={manejarPointerUp}
              onPointerCancel={manejarPointerUp}
            >
              <div
                ref={containerRef}
                className="relative select-none origin-top-left"
                style={{
                  width: `${containerWidth}px`,
                  height: `${containerHeight}px`,
                  transform: 'translate(0px, 0px) scale(1)',
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
                      data-mesa-id={mesa.id}
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