'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SolicitudCancion {
  _id: string;
  cancion: string;
  autor: string;
  mesa: number;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminCancionesPage() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<SolicitudCancion[]>([]);
  const [cargando, setCargando] = useState(true);

  // ✅ Verificar sesión de Admin
  useEffect(() => {
    const sessionId = localStorage.getItem('admin_session_id');
    if (!sessionId) {
      router.replace('/admin/login');
    }
  }, [router]);

  // ✅ Obtener solicitudes cada 5 segundos
  useEffect(() => {
    const obtenerSolicitudes = async () => {
      try {
        const res = await fetch(`${API_URL}/api/canciones/pendientes`);
        if (res.ok) {
          const data = await res.json();
          setSolicitudes(data.solicitudes);
          setCargando(false);
        }
      } catch (error) {
        console.error('❌ Error al obtener canciones:', error);
      }
    };

    obtenerSolicitudes(); // Primera carga
    const intervalo = setInterval(obtenerSolicitudes, 5000); // Refrescar cada 5 segundos

    return () => clearInterval(intervalo);
  }, []);

  // ✅ Marcar como atendida
  const handleAtender = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/canciones/atender/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        setSolicitudes(prev => prev.filter(s => s._id !== id));
      }
    } catch (error) {
      console.error('❌ Error al atender canción:', error);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#020106] flex items-center justify-center">
        <p className="text-[#00f3ff] font-orbitron animate-pulse">CARGANDO SOLICITUDES...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#020106] text-white p-4 sm:p-8 font-space select-none relative overflow-hidden">
      
      {/* 🌌 FONDOS NEÓN */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00f3ff]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ff00a0]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        
        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-[#2b1b4b] pb-5 mb-6">
          <div>
            <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-[#00f3ff] drop-shadow-[0_0_20px_#00f3ff]">
              🎵 CANCIONES SOLICITADAS
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Lista en tiempo real. Refresca automáticamente cada 5s.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">EN VIVO</span>
          </div>
        </header>

        {/* CONTADOR */}
        <div className="mb-6 flex items-center justify-between bg-[#0a071e]/80 border border-[#00f3ff]/40 rounded-xl p-4">
          <span className="text-gray-300 font-medium">Solicitudes pendientes:</span>
          <span className="text-2xl font-orbitron font-black text-[#00f3ff]">{solicitudes.length}</span>
        </div>

        {/* LISTA DE CANCIONES */}
        {solicitudes.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[250px] border border-dashed border-gray-800 rounded-2xl p-6 text-center">
            <span className="text-6xl mb-3">🎧</span>
            <h2 className="text-lg font-bold text-gray-300">No hay canciones pedidas</h2>
            <p className="text-xs text-gray-500 mt-1">Los clientes pedirán canciones cuando actives el modo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {solicitudes.map((sol) => (
              <div
                key={sol._id}
                className="relative bg-[#0a071e]/80 border border-[#00f3ff]/50 rounded-2xl p-5 shadow-[0_0_20px_rgba(0,243,255,0.15)] flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-orbitron font-bold text-lg text-cyan-400">
                      {sol.cancion}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {sol.autor} <span className="text-[10px] text-gray-500">• Mesa #{sol.mesa}</span>
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {new Date(sol.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="text-3xl">🎤</span>
                </div>

                <button
                  onClick={() => handleAtender(sol._id)}
                  className="w-full py-2.5 bg-[#00f3ff] text-black font-black text-sm rounded-lg hover:bg-cyan-300 transition-all"
                >
                  ✅ Atendida
                </button>
              </div>
            ))}
          </div>
        )}

        {/* BOTÓN VOLVER */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/admin"
            className="text-xs text-cyan-400/60 hover:text-cyan-400 transition-colors border border-cyan-400/30 px-4 py-2 rounded-lg"
          >
            ← Volver al Panel de Control
          </Link>
        </div>
      </div>
    </main>
  );
}