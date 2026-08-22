'use client';

import { useState, useEffect } from 'react';

export interface PremioConfig {
  id: string;
  nombre: string;
  pesoBase: number;
  esPremioMayor: boolean;
}

export default function GestionPremiosAdmin() {
  const [premios, setPremios] = useState<PremioConfig[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Formulario para Premio Nuevo
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPeso, setNuevoPeso] = useState<number>(10);
  const [esMayor, setEsMayor] = useState(false);

  // 1. Cargar premios desde la BD
  useEffect(() => {
    async function cargarPremios() {
      try {
        const res = await fetch('http://localhost:3001/api/juegos/premios');
        const data = await res.json();
        if (data.ok && Array.isArray(data.data)) {
          setPremios(data.data);
        }
      } catch (err) {
        console.error('Error al cargar premios:', err);
      } finally {
        setCargando(false);
      }
    }
    cargarPremios();
  }, []);

  // 2. Agregar un nuevo premio a la lista local
  function agregarNuevoPremio(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    const nuevo: PremioConfig = {
      // Generamos un ID simple o slug limpio
      id: nuevoNombre.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
      nombre: nuevoNombre.trim(),
      pesoBase: Number(nuevoPeso) || 1,
      esPremioMayor: esMayor,
    };

    setPremios([...premios, nuevo]);

    // Limpiamos los inputs del formulario
    setNuevoNombre('');
    setNuevoPeso(10);
    setEsMayor(false);
  }

  // 3. Modificar el peso de un premio existente
  function cambiarPeso(id: string, nuevoPeso: number) {
    setPremios(
      premios.map((p) => (p.id === id ? { ...p, pesoBase: Math.max(0, nuevoPeso) } : p))
    );
  }

  // 4. Eliminar un premio de la lista
  function eliminarPremio(id: string) {
    setPremios(premios.filter((p) => p.id !== id));
  }

  // 5. Guardar la lista entera en MongoDB a través del PUT
  async function guardarCambios() {
    setGuardando(true);
    try {
      const res = await fetch('http://localhost:3001/api/juegos/premios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ premios }),
      });

      const data = await res.json();
      if (data.ok) {
        alert('¡Configuración de premios guardada en MongoDB con éxito!');
      } else {
        alert('Error al guardar: ' + (data.error || 'Intente nuevamente'));
      }
    } catch (err) {
      console.error('Error al guardar:', err);
      alert('Error de conexión con el backend.');
    } finally {
      setGuardando(false);
    }
  }

  // Cálculo del peso total para mostrar el % aproximado de probabilidad
  const pesoTotal = premios.reduce((acc, p) => acc + p.pesoBase, 0);

  if (cargando) {
    return <div className="text-white text-xs font-orbitron">CARGANDO PREMIOS...</div>;
  }

  return (
    <div className="w-full max-w-4xl rounded-xl border-2 border-[#ff00a0] bg-[#0c0824]/90 p-5 shadow-[0_0_25px_rgba(255,0,160,0.2)] font-orbitron select-none relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#ff00a0] drop-shadow-[0_0_8px_#ff00a0]">
          ⚙️ CONFIGURACIÓN Y PESOS DE PREMIOS (RULETA)
        </h2>
        <span className="text-[10px] text-slate-400 font-bold">
          PESO TOTAL: <span className="text-[#00f3ff]">{pesoTotal} PTS</span>
        </span>
      </div>

      {/* Formulario para CREAR PREMIO NUEVO */}
      <form
        onSubmit={agregarNuevoPremio}
        className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 bg-[#020106]/80 p-4 rounded-xl border border-[#ff00a0]/30"
      >
        <div className="col-span-1 sm:col-span-1">
          <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1">
            Nombre del Premio
          </label>
          <input
            type="text"
            placeholder="Ej: Shot de Ron"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            className="w-full bg-[#0c0824] border border-[#ff00a0]/40 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00f3ff]"
            required
          />
        </div>

        <div>
          <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1">
            Peso Base (Rareza)
          </label>
          <input
            type="number"
            min="0"
            value={nuevoPeso}
            onChange={(e) => setNuevoPeso(Number(e.target.value))}
            className="w-full bg-[#0c0824] border border-[#ff00a0]/40 rounded-lg px-3 py-1.5 text-xs text-[#00f3ff] font-bold focus:outline-none"
            required
          />
        </div>

        <div className="flex items-center gap-2 pt-4">
          <input
            type="checkbox"
            id="premioMayor"
            checked={esMayor}
            onChange={(e) => setEsMayor(e.target.checked)}
            className="w-4 h-4 accent-[#ff00a0] cursor-pointer"
          />
          <label htmlFor="premioMayor" className="text-[10px] uppercase text-slate-300 cursor-pointer">
            ¿Es Premio Mayor?
          </label>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full bg-[#ff00a0] text-white font-black text-xs uppercase py-2 rounded-lg hover:bg-[#00f3ff] hover:text-black transition-all cursor-pointer shadow-[0_0_10px_rgba(255,0,160,0.4)]"
          >
            + AÑADIR A LA LISTA
          </button>
        </div>
      </form>

      {/* Lista de Premios Actuales */}
      <div className="flex flex-col gap-2 mb-6 max-h-60 overflow-y-auto pr-1">
        {premios.map((p) => {
          const porcentaje = pesoTotal > 0 ? ((p.pesoBase / pesoTotal) * 100).toFixed(1) : '0';

          return (
            <div
              key={p.id}
              className="flex items-center justify-between gap-4 bg-[#060413]/80 border border-white/10 px-4 py-2.5 rounded-xl"
            >
              <div className="flex items-center gap-2">
                {p.esPremioMayor && (
                  <span className="text-xs" title="Premio Mayor">
                    👑
                  </span>
                )}
                <span className="text-xs font-bold text-white tracking-wider">{p.nombre}</span>
              </div>

              <div className="flex items-center gap-4">
                {/* Control interactivo del Peso Base */}
                <div className="flex items-center gap-2 bg-[#020106] border border-white/10 px-2 py-1 rounded-lg">
                  <span className="text-[9px] text-slate-400">PESO:</span>
                  <input
                    type="number"
                    value={p.pesoBase}
                    onChange={(e) => cambiarPeso(p.id, Number(e.target.value))}
                    className="w-12 text-center text-xs font-bold text-[#00f3ff] bg-transparent focus:outline-none"
                  />
                </div>

                {/* Probabilidad estimada */}
                <span className="text-[10px] font-black text-[#ff00a0] min-w-[50px] text-right">
                  {porcentaje}%
                </span>

                <button
                  onClick={() => eliminarPremio(p.id)}
                  className="text-red-400 hover:text-red-300 text-xs px-2 py-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón Guardar en Backend */}
      <button
        onClick={guardarCambios}
        disabled={guardando}
        className="w-full bg-[#00f3ff] text-black font-black text-xs uppercase py-3 rounded-xl hover:shadow-[0_0_20px_#00f3ff] transition-all cursor-pointer disabled:opacity-50"
      >
        {guardando ? 'GUARDANDO EN BASE DE DATOS...' : '💾 GUARDAR CAMBIOS EN MONGO DB'}
      </button>
    </div>
  );
}