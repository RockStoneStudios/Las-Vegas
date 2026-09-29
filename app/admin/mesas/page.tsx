'use client';

import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Move, Layout, Users, Disc } from 'lucide-react';

interface IMesa {
  id: string;
  numero: string;
  tipo: 'MESA' | 'BARRA' | 'ESCENARIO' | 'VIP' | 'PISTA_BAILE';
  capacidad: number;
  posX: number;
  posY: number;
  width: number;
  height: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function AdminMesasPage() {
  const [mesas, setMesas] = useState<IMesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedMesaId, setDraggedMesaId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Formulario para crear nueva mesa o elemento
  const [nuevaMesa, setNuevaMesa] = useState({
    numero: '',
    tipo: 'MESA' as 'MESA' | 'BARRA' | 'ESCENARIO' | 'VIP' | 'PISTA_BAILE',
    capacidad: 4,
  });

  // 1. Cargar mesas activas al montar el componente
  useEffect(() => {
    fetchMesas();
  }, []);

  const fetchMesas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/mesas`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMesas(data);
      }
    } catch (error) {
      console.error('Error cargando mesas:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Manejo de Drag & Drop en el canvas
  const handleMouseDown = (e: React.MouseEvent, mesa: IMesa) => {
    setDraggedMesaId(mesa.id);
    setDragOffset({
      x: e.clientX - mesa.posX,
      y: e.clientY - mesa.posY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedMesaId) return;

    // Calcular nuevas coordenadas dentro del contenedor
    const newX = Math.max(0, e.clientX - dragOffset.x);
    const newY = Math.max(0, e.clientY - dragOffset.y);

    setMesas((prev) =>
      prev.map((m) =>
        m.id === draggedMesaId
          ? { ...m, posX: Math.round(newX), posY: Math.round(newY) }
          : m
      )
    );
  };

  const handleMouseUp = () => {
    setDraggedMesaId(null);
  };

  // 3. Guardar todo el layout modificado (PUT /mesas/layout)
  const guardarLayout = async () => {
    try {
      setSaving(true);
      const itemsToUpdate = mesas.map((m) => ({
        id: m.id,
        posX: m.posX,
        posY: m.posY,
        width: m.width,
        height: m.height,
      }));

      const res = await fetch(`${API_URL}/mesas/layout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemsToUpdate),
      });

      if (res.ok) {
        alert('¡Layout del plano guardado con éxito!');
      } else {
        alert('Error al guardar el layout');
      }
    } catch (error) {
      console.error('Error guardando layout:', error);
      alert('Error de conexión al guardar');
    } finally {
      setSaving(false);
    }
  };

  // 4. Crear nueva mesa/elemento (POST /mesas)
  const crearMesa = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nuevaMesa.numero.trim()) {
      alert(
        'Ingresa un número o nombre para el elemento (Ej: Pista Principal, Mesa 5)'
      );
      return;
    }

    // Definir dimensiones iniciales según el tipo de elemento
    let initialWidth = 80;
    let initialHeight = 80;

    if (nuevaMesa.tipo === 'BARRA') {
      initialWidth = 280;
      initialHeight = 60;
    } else if (nuevaMesa.tipo === 'ESCENARIO') {
      initialWidth = 200;
      initialHeight = 100;
    } else if (nuevaMesa.tipo === 'VIP') {
      initialWidth = 120;
      initialHeight = 120;
    } else if (nuevaMesa.tipo === 'PISTA_BAILE') {
      initialWidth = 240; // 💃 Pista de baile más espaciosa
      initialHeight = 160;
    }

    try {
      const res = await fetch(`${API_URL}/mesas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero: nuevaMesa.numero,
          tipo: nuevaMesa.tipo,
          capacidad: Number(nuevaMesa.capacidad),
          posX: 30,
          posY: 30,
          width: initialWidth,
          height: initialHeight,
        }),
      });

      if (res.ok) {
        const creada = await res.json();

        // Normalizar el ID retornado por la base de datos
        const mesaFormateada = {
          ...creada,
          id: creada.id || creada._id,
        };

        setMesas((prev) => [...prev, mesaFormateada]);
        setNuevaMesa({ numero: '', tipo: 'MESA', capacidad: 4 });
      } else {
        const err = await res.json();
        alert(`Error al crear elemento: ${err.error || 'Respuesta no válida'}`);
      }
    } catch (error) {
      console.error('Error creando mesa/elemento:', error);
      alert('Ocurrió un error de conexión al crear el elemento');
    }
  };

  // 5. Eliminar elemento del plano (DELETE /mesas/:id)
  const eliminarMesa = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este elemento del plano?')) return;

    try {
      const res = await fetch(`${API_URL}/mesas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMesas((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (error) {
      console.error('Error eliminando mesa:', error);
    }
  };

  // Helper para los estilos según el tipo de elemento
  const getTipoEstilo = (tipo: string) => {
    switch (tipo) {
      case 'VIP':
        return 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-amber-500/10';
      case 'BARRA':
        return 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-cyan-500/20';
      case 'ESCENARIO':
        return 'bg-purple-950/60 border-purple-500 text-purple-200 font-bold uppercase tracking-widest';
      case 'PISTA_BAILE':
        return 'bg-pink-950/40 border-pink-500/80 text-pink-300 font-bold uppercase tracking-wider border-dashed shadow-pink-500/20';
      default:
        return 'bg-zinc-800 border-zinc-600 text-zinc-100';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-white min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layout className="text-amber-500" /> Editor del Plano de Mesas
          </h1>
          <p className="text-zinc-400 text-sm">
            Arrastra los elementos para ubicarlos en el lienzo y guarda los cambios.
          </p>
        </div>

        <button
          onClick={guardarLayout}
          disabled={saving}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
        >
          <Save size={18} />
          {saving ? 'Guardando...' : 'Guardar Plano'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* PANEL LATERAL: FORMULARIO */}
        <div className="lg:col-span-1 bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus size={18} className="text-amber-500" /> Agregar Elemento
          </h2>

          <form onSubmit={crearMesa} className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400">
                Identificador / Número
              </label>
              <input
                type="text"
                placeholder="Ej: Mesa 1, Pista Principal, VIP 2"
                value={nuevaMesa.numero}
                onChange={(e) =>
                  setNuevaMesa({ ...nuevaMesa, numero: e.target.value })
                }
                className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400">Tipo de Elemento</label>
              <select
                value={nuevaMesa.tipo}
                onChange={(e) =>
                  setNuevaMesa({
                    ...nuevaMesa,
                    tipo: e.target.value as any,
                  })
                }
                className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
              >
                <option value="MESA">Mesa Standard</option>
                <option value="VIP">Mesa VIP</option>
                <option value="BARRA">Barra</option>
                <option value="ESCENARIO">Escenario / DJ</option>
                <option value="PISTA_BAILE">Pista de Baile 💃</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-400">
                Capacidad / Aforo Estimado
              </label>
              <input
                type="number"
                value={nuevaMesa.capacidad}
                onChange={(e) =>
                  setNuevaMesa({
                    ...nuevaMesa,
                    capacidad: Number(e.target.value),
                  })
                }
                className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-medium py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={16} /> Crear Elemento
            </button>
          </form>
        </div>

        {/* LIENZO / CANVAS INTERACTIVO */}
        <div className="lg:col-span-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800 overflow-hidden">
          {loading ? (
            <div className="h-[550px] flex items-center justify-center text-zinc-500">
              Cargando plano...
            </div>
          ) : (
            <div
              className="relative w-full h-[550px] bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800 overflow-auto select-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {mesas.map((mesa) => (
                <div
                  key={mesa.id}
                  onMouseDown={(e) => handleMouseDown(e, mesa)}
                  style={{
                    position: 'absolute',
                    left: `${mesa.posX}px`,
                    top: `${mesa.posY}px`,
                    width: `${mesa.width}px`,
                    height: `${mesa.height}px`,
                  }}
                  className={`cursor-grab active:cursor-grabbing border-2 rounded-xl p-2 flex flex-col justify-between shadow-lg transition-shadow hover:shadow-amber-500/10 ${getTipoEstilo(
                    mesa.tipo
                  )}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs truncate flex items-center gap-1">
                      {mesa.tipo === 'PISTA_BAILE' && <Disc size={12} className="animate-spin" />}
                      {mesa.numero}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarMesa(mesa.id);
                      }}
                      className="text-zinc-400 hover:text-red-400 transition cursor-pointer"
                      title="Eliminar elemento"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="flex justify-between items-end text-[10px] opacity-80">
                    <span className="flex items-center gap-1">
                      <Users size={10} /> {mesa.capacidad}
                    </span>
                    <Move size={10} className="opacity-50" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}