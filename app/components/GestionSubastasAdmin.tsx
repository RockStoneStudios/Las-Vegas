'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

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
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [borrando, setBorrando] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const intervalRef = useRef<any>(null);

  const cargar = async () => {
    try {
      const res = await fetch(`${API}/api/subastas`);
      const json = await res.json();
      if (json.ok) setSubastas(json.data);
    } catch {}
  };

  useEffect(() => { cargar(); }, []);

  const activa = subastas.find(s => s.estado === 'ACTIVA');

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!activa) return;
    intervalRef.current = setInterval(() => {
      if (document.hidden) return;
      cargar();
    }, 8000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [!!activa]);

  const crear = async () => {
    if (!producto.trim()) {
      toast.error('Escribe el producto');
      return;
    }
    await fetch(`${API}/api/subastas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ producto, descripcion, precioBase, cierraA })
    });
    setProducto('');
    setDescripcion('');
    setPrecioBase(150000);
    setCierraA('23:00');
    toast.success('Subasta creada 🔥');
    cargar();
  };

  const cerrar = async (id: string) => {
    if (!confirm('¿Cerrar subasta y declarar ganador?')) return;
    const res = await fetch(`${API}/api/subastas/${id}/cerrar`, { method: 'POST' });
    const json = await res.json();
    toast.success(json.data?.mensaje || 'Subasta cerrada');
    cargar();
  };

  const borrarHistorial = async () => {
    setBorrando(true);
    try {
      const res = await fetch(`${API}/api/subastas/historial`, { method: 'DELETE' });
      if (!res.ok) throw new Error('404');
      const json = await res.json();
      setMostrarConfirm(false);
      toast.success('Historial borrado 🔥', { description: `${json.data?.eliminadas ?? ''} subastas eliminadas` });
      cargar();
    } catch {
      toast.error('No se pudo borrar', { description: 'El backend en Railway aún no tiene la ruta. Haz push y redeploy.' });
    } finally {
      setBorrando(false);
    }
  };

  return (
    <div className="bg-[#080516]/80 border border-[#00f3ff]/30 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_30px_rgba(0,243,255,0.1)]">
      <h2 className="font-orbitron font-black text-lg text-[#00f3ff] uppercase tracking-widest drop-shadow-[0_0_10px_#00f3ff] mb-4 flex items-center gap-3">
        <span>⚡</span> SUBASTAS EN VIVO
        {activa && <span className="text-xs text-[#ff00a0] animate-pulse font-space">● EN CURSO • actualiza cada 8s</span>}
      </h2>

      {activa ? (
        <div className="bg-[#0a0720] border border-[#ff00a0]/40 rounded-xl p-4 mb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <p className="text-[#00f3ff] font-space tracking-widest">TERMINA {activa.cierraA}</p>
              <h3 className="text-white font-orbitron font-bold text-lg mt-1">{activa.producto}</h3>
              <p className="text-gray-400 font-space text-xs">{activa.descripcion}</p>
              <p className="text-2xl font-orbitron font-black text-[#ffe600] mt-2 drop-shadow-[0_0_10px_#ffe600]">${activa.precioActual.toLocaleString()}</p>
              <p className="text-xs font-space text-white mt-1">Mesa ganadora: <span className="text-[#ff00a0] font-bold">{activa.mesaGanadora ?? 'Sin pujas'}</span></p>
            </div>
            <button onClick={() => cerrar(activa._id)} className="h-fit px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400 font-orbitron font-black uppercase tracking-widest hover:bg-red-500/30 transition-all cursor-pointer">
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

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 font-space block mb-1">Producto a subastar</label>
          <input value={producto} onChange={(e) => setProducto(e.target.value)} placeholder="Ej: Botella de Whisky" className="w-full bg-[#0a0720] border border-[#1f1645] rounded-xl px-4 py-3 text-white text-sm font-space focus:outline-none focus:border-[#00f3ff] focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all" />
        </div>
        <div>
          <label className="text-xs text-gray-400 font-space block mb-1">Descripción</label>
          <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej: 12 años, edición especial" className="w-full bg-[#0a0720] border border-[#1f1645] rounded-xl px-4 py-3 text-white text-sm font-space focus:outline-none focus:border-[#00f3ff] focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:w-48">
            <label className="text-xs text-gray-400 font-space block mb-1">Precio Base</label>
            <input type="number" value={precioBase} onChange={(e) => setPrecioBase(Number(e.target.value))} className="w-full bg-[#0a0720] border border-[#1f1645] rounded-xl px-4 py-3 text-white text-sm font-space focus:outline-none focus:border-[#00f3ff] focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all" />
          </div>
          <div className="w-full sm:w-40">
            <label className="text-xs text-gray-400 font-space block mb-1">Cierra a</label>
            <input value={cierraA} onChange={(e) => setCierraA(e.target.value)} placeholder="23:00" className="w-full bg-[#0a0720] border border-[#1f1645] rounded-xl px-4 py-3 text-white text-sm font-space focus:outline-none focus:border-[#ff00a0] focus:shadow-[0_0_15px_rgba(255,0,160,0.2)] transition-all" />
          </div>
          <button onClick={crear} className="w-full sm:flex-1 py-3 bg-gradient-to-r from-[#00f3ff] to-[#ff00a0] rounded-xl font-orbitron font-black text-sm text-white uppercase tracking-widest shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_35px_rgba(255,0,160,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
            🚀 CREAR SUBASTA
          </button>
        </div>
      </div>

      {/* HISTORIAL NEÓN */}
      {subastas.filter(s => s.estado === 'CERRADA').length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-orbitron font-black tracking-[0.2em] text-[#00f3ff] drop-shadow-[0_0_8px_#00f3ff] uppercase">🏆 Historial</p>
            <button onClick={() => setMostrarConfirm(true)} className="text- font-orbitron font-bold tracking-widest uppercase text-red-400 border border-red-500/50 bg-red-500/10 hover:bg-red-500/25 hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] rounded-full px-3 py-1.5 transition-all cursor-pointer">
              🗑️ Borrar historial
            </button>
          </div>
          {subastas.filter(s => s.estado === 'CERRADA').map(s => (
            <div key={s._id} className="group relative flex justify-between items-center bg-gradient-to-r from-[#0a0720] via-[#120b2e] to-[#0a0720] border border-[#00f3ff]/30 hover:border-[#ff00a0]/60 rounded-xl px-4 py-3 shadow-[0_0_15px_rgba(0,243,255,0.15)] hover:shadow-[0_0_25px_rgba(255,0,160,0.3)] transition-all">
              <div className="flex items-center gap-3">
                <span className="text-lg drop-shadow-[0_0_6px_#ffe600]">🏆</span>
                <div>
                  <span className="block text-white font-orbitron font-bold text-sm tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">{s.producto}</span>
                  <span className="block text- font-space text-[#00f3ff]/70 tracking-widest">GANADOR • MESA {s.mesaGanadora ?? '-'}</span>
                </div>
              </div>
              <span className="font-orbitron font-black text-[#ffe600] text-base drop-shadow-[0_0_10px_#ffe600] group-hover:scale-110 transition-transform">${s.precioActual.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* MODAL NEÓN - reemplaza el confirm() feo */}
      {mostrarConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#0a0720] border border-[#ff00a0]/50 rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(255,0,160,0.4)]">
            <p className="text-4xl mb-3">🗑️</p>
            <h3 className="font-orbitron font-black text-white tracking-widest">¿BORRAR HISTORIAL?</h3>
            <p className="text-xs font-space text-gray-400 mt-2">Se van a borrar todas las subastas cerradas. Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrarConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 font-orbitron text-xs tracking-widest hover:bg-white/5 cursor-pointer">CANCELAR</button>
              <button onClick={borrarHistorial} disabled={borrando} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-[#ff00a0] text-white font-orbitron font-black text-xs tracking-widest shadow-[0_0_20px_rgba(255,0,0,0.5)] cursor-pointer disabled:opacity-50">
                {borrando ? 'BORRANDO...' : 'SÍ, BORRAR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}