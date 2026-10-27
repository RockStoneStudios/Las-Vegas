'use client';

import { useState, useEffect } from 'react';

interface Subasta {
  _id: string;
  producto: string;
  descripcion?: string;
  precioBase: number;
  precioActual: number;
  mesaGanadora?: number | null;
  cierraA: string;
  estado: 'ACTIVA' | 'CERRADA';
  pujas: { mesa: number; monto: number; fecha?: string }[];
}

export default function GestionSubastasAdmin() {
  const [subastas, setSubastas] = useState<Subasta[]>([]);
  const [producto, setProducto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioBase, setPrecioBase] = useState(150000);
  const [cierraA, setCierraA] = useState('23:00');

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const cargar = async () => {
    try {
      const res = await fetch(`${API}/api/subastas`);
      const json = await res.json();
      if (json.ok) setSubastas(json.data);
    } catch {}
  };

  useEffect(() => { cargar(); }, []);

  const crear = async () => {
    if (!producto.trim()) return alert('Escribe el producto');
    await fetch(`${API}/api/subastas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ producto, descripcion, precioBase, cierraA })
    });
    setProducto('');
    setDescripcion('');
    setPrecioBase(150000);
    setCierraA('23:00');
    cargar();
  };

  const cerrar = async (id: string) => {
    if (!confirm('¿Cerrar subasta y declarar ganador?')) return;
    const res = await fetch(`${API}/api/subastas/${id}/cerrar`, { method: 'POST' });
    const json = await res.json();
    alert(json.data?.mensaje || 'Subasta cerrada');
    cargar();
  };

  const activa = subastas.find(s => s.estado === 'ACTIVA');

  return (
    <div className="bg-[#080516]/80 border border-[#00f3ff]/30 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_30px_rgba(0,243,255,0.1)]">
      <h2 className="font-orbitron font-black text-lg text-[#00f3ff] uppercase tracking-widest drop-shadow-[0_0_10px_#00f3ff] mb-4 flex items-center gap-3">
        <span>⚡</span> SUBASTAS EN VIVO
        {activa && <span className="text-xs text-[#ff00a0] animate-pulse font-space">● EN CURSO</span>}
      </h2>

      {/* SUBASTA ACTIVA */}
      {activa ? (
        <div className="bg-[#0a0720] border border-[#ff00a0]/40 rounded-xl p-4 mb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <p className="text- text-[#00f3ff] font-space tracking-widest">TERMINA {activa.cierraA}</p>
              <h3 className="text-white font-orbitron font-bold text-lg mt-1">{activa.producto}</h3>
              <p className="text-gray-400 font-space text-xs">{activa.descripcion}</p>
              <p className="text-2xl font-orbitron font-black text-[#ffe600] mt-2 drop-shadow-[0_0_10px_#ffe600]">${activa.precioActual.toLocaleString()}</p>
              <p className="text-xs font-space text-white mt-1">Mesa ganadora: <span className="text-[#ff00a0] font-bold">{activa.mesaGanadora ?? 'Sin pujas'}</span></p>
            </div>
            <button
              onClick={() => cerrar(activa._id)}
              className="h-fit px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400 text- font-orbitron font-black uppercase tracking-widest hover:bg-red-500/30 transition-all cursor-pointer"
            >
              Cerrar Subasta
            </button>
          </div>
          <div className="mt-3 space-y-1 border-t border-[#1f1645] pt-3">
            {activa.pujas.slice(-3).reverse().map((p, i) => (
              <p key={i} className="text-xs font-space text-zinc-300">Mesa {p.mesa} → <span className="text-[#00f3ff]">${p.monto.toLocaleString()}</span></p>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs font-space text-gray-400 mb-4">No hay subasta activa. Crea una abajo 👇</p>
      )}

      {/* FORMULARIO */}
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 font-space block mb-1">Producto a subastar</label>
          <input
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
            placeholder="Ej: Botella de Whisky"
            className="w-full bg-[#0a0720] border border-[#1f1645] rounded-xl px-4 py-3 text-white text-sm font-space focus:outline-none focus:border-[#00f3ff] focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 font-space block mb-1">Descripción</label>
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: 12 años, edición especial"
            className="w-full bg-[#0a0720] border border-[#1f1645] rounded-xl px-4 py-3 text-white text-sm font-space focus:outline-none focus:border-[#00f3ff] focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:w-48">
            <label className="text-xs text-gray-400 font-space block mb-1">Precio Base</label>
            <input
              type="number"
              value={precioBase}
              onChange={(e) => setPrecioBase(Number(e.target.value))}
              className="w-full bg-[#0a0720] border border-[#1f1645] rounded-xl px-4 py-3 text-white text-sm font-space focus:outline-none focus:border-[#00f3ff] focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all"
            />
          </div>
          <div className="w-full sm:w-40">
            <label className="text-xs text-gray-400 font-space block mb-1">Cierra a</label>
            <input
              value={cierraA}
              onChange={(e) => setCierraA(e.target.value)}
              placeholder="23:00"
              className="w-full bg-[#0a0720] border border-[#1f1645] rounded-xl px-4 py-3 text-white text-sm font-space focus:outline-none focus:border-[#ff00a0] focus:shadow-[0_0_15px_rgba(255,0,160,0.2)] transition-all"
            />
          </div>
          <button
            onClick={crear}
            className="w-full sm:flex-1 py-3 bg-gradient-to-r from-[#00f3ff] to-[#ff00a0] rounded-xl font-orbitron font-black text-sm text-white uppercase tracking-widest shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_35px_rgba(255,0,160,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            🚀 CREAR SUBASTA
          </button>
        </div>
      </div>

      {/* HISTORIAL */}
      {subastas.filter(s => s.estado === 'CERRADA').length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-xs text-gray-400 font-space">Historial</p>
          {subastas.filter(s => s.estado === 'CERRADA').map(s => (
            <div key={s._id} className="flex justify-between bg-[#0a0720] border border-[#1f1645] rounded-xl px-4 py-2 text-xs font-space">
              <span className="text-white font-bold">{s.producto}</span>
              <span className="text-zinc-400">Mesa {s.mesaGanadora ?? '-'} • <span className="text-[#ffe600]">${s.precioActual.toLocaleString()}</span></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}