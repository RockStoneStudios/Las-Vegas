'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSocketStore } from '@/lib/store/useSocketStore';
import Link from 'next/link';

interface SolicitudMesero {
  idAlerta: string;
  mesa: number;
  hora: string;
}

export default function AdminSolicitudesPage() {
  const router = useRouter();
  const { conectarSocket, mensajeWS, enviarMensaje, conectado } = useSocketStore();
  const [solicitudes, setSolicitudes] = useState<SolicitudMesero[]>([]);
  const [cargandoAuth, setCargandoAuth] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [notificaciones, setNotificaciones] = useState(0);

  // 🔔 Función para obtener el contador
  const obtenerContadorPendientes = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/mesero/pendientes/conteo`);
      if (res.ok) {
        const data = await res.json();
        setNotificaciones(data.pendientes || 0);
      }
    } catch (error) {
      console.error('❌ Error al obtener contador:', error);
    }
  };

  // 🆕 CARGAR SOLICITUDES PENDIENTES
  const cargarSolicitudesPendientes = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/mesero/pendientes`);
      if (res.ok) {
        const data = await res.json();
        console.log('📦 Datos del backend:', data);
        
        // 🔥 SOPORTE PARA AMBOS FORMATOS
        let solicitudesArray = [];
        
        if (Array.isArray(data)) {
          solicitudesArray = data;
        } else if (data.solicitudes && Array.isArray(data.solicitudes)) {
          solicitudesArray = data.solicitudes;
        } else if (data.pendientes && Array.isArray(data.pendientes)) {
          solicitudesArray = data.pendientes;
        }
        
        const solicitudesFormateadas = solicitudesArray.map((s: any) => ({
          idAlerta: s._id || s.idAlerta || `alerta-${s.mesa}-${Date.now()}`,
          mesa: s.mesa,
          hora: s.hora || (s.createdAt ? new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'),
        }));
        
        setSolicitudes(solicitudesFormateadas);
        setNotificaciones(solicitudesFormateadas.length);
      }
    } catch (error) {
      console.error('❌ Error al cargar solicitudes:', error);
    }
  };

  // ✅ 1. INICIALIZAR SESIÓN
  useEffect(() => {
    const inicializarSesion = async () => {
      const sessionId = localStorage.getItem('admin_session_id');
      
      if (!sessionId) {
        router.replace('/admin/login');
        return;
      }

      console.log('🔌 [ADMIN] Conectando WebSocket...');
      conectarSocket(sessionId, 0, 'admin');
      
      // ✅ Cargar solicitudes al abrir
      await cargarSolicitudesPendientes();
      
      setCargandoAuth(false);
    };

    inicializarSesion();
  }, [conectarSocket, router]);

  // ✅ 2. ESCUCHAR MENSAJES WS Y ACTUALIZAR
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

    if (!mensajeWS) return;

    const tipo = mensajeWS?.tipo;
    const payload = mensajeWS?.payload || {};

    // 🛎️ Eventos de nuevo llamado
    const eventosLlamado = ['ALERT:LLAMADO_MESERO', 'ACTION:SOLICITAR_ATENCION', 'EVENT:NUEVO_LLAMADO'];

    if (eventosLlamado.includes(tipo)) {
      const numeroMesa = payload.mesa ?? payload.numeroMesa ?? payload.table;
      console.log('📢 [ADMIN] ¡Mesa solicitando atención! Número:', numeroMesa);

      if (numeroMesa !== undefined && numeroMesa !== null) {
        audioRef.current?.play().catch(() => {});

        const horaFormateada = payload.hora
          ? new Date(payload.hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const idAlerta = payload.idAlerta || `alerta-${numeroMesa}-${Date.now()}`;

        // 🔥 SOLUCIÓN DEFINITIVA: REEMPLAZAR todas las solicitudes de esa mesa
        setSolicitudes((prev) => {
          // 1. Filtrar TODAS las solicitudes de esa mesa (eliminarlas todas)
          const sinDuplicados = prev.filter((s) => Number(s.mesa) !== Number(numeroMesa));
          
          // 2. Agregar la nueva solicitud al principio
          const nuevaSolicitud = { idAlerta, mesa: Number(numeroMesa), hora: horaFormateada };
          
          console.log(`✅ [ADMIN] Reemplazando solicitudes de mesa ${numeroMesa}`);
          console.log(`   - Antes: ${prev.length} solicitudes`);
          console.log(`   - Después: ${sinDuplicados.length + 1} solicitudes`);
          
          return [nuevaSolicitud, ...sinDuplicados];
        });
        
        // 🟢 Actualizar el contador
        obtenerContadorPendientes();
      }
    }

    // 🧹 Eventos cuando la mesa se atiende
    const eventosAtendido = ['EVENT:LLAMADO_ATENDIDO', 'ACTION:CANCELAR_LLAMADO', 'EVENT:LLAMADO_CANCELADO', 'ACTION:ATENDER_MESA'];

    if (eventosAtendido.includes(tipo)) {
      const numeroMesa = payload.mesa ?? payload.numeroMesa;
      if (numeroMesa) {
        console.log(`🧹 [ADMIN] Eliminando todas las solicitudes de mesa ${numeroMesa}`);
        setSolicitudes((prev) => prev.filter((s) => Number(s.mesa) !== Number(numeroMesa)));
        obtenerContadorPendientes();
      }
    }
  }, [mensajeWS]);

  // ✅ 3. ATENDER MESA
  const handleAtender = async (idAlerta: string, mesa: number) => {
    const sessionId = localStorage.getItem('admin_session_id');

    if (!sessionId) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/mesero/atender`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({
          idAlerta,
          mesa: Number(mesa),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al atender la mesa');
      }

      setSolicitudes((prev) => prev.filter((s) => s.mesa !== mesa));

      enviarMensaje({
        tipo: 'ACTION:ATENDER_MESA',
        payload: {
          idAlerta,
          mesa: Number(mesa),
          numeroMesa: Number(mesa),
          sessionId: sessionId,
        },
      });

      await obtenerContadorPendientes();

    } catch (error) {
      console.error('❌ Error al atender mesa:', error);
    }
  };

  if (cargandoAuth) {
    return (
      <div className="min-h-screen bg-[#020106] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#00f3ff] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#00f3ff] font-orbitron text-xs tracking-widest animate-pulse">
            CARGANDO PANEL...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#020106] text-white p-4 sm:p-8 font-space select-none relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff00a0]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00f3ff]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#2b1b4b] pb-5 mb-6 gap-4">
          <div>
            <h1 className="font-orbitron font-black text-2xl sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-[#00f3ff] to-[#ff00a0] drop-shadow-[0_0_20px_rgba(255,0,160,0.3)]">
              SOLICITUDES
            </h1>
            <p className="text-xs sm:text-sm text-cyan-400/70 mt-1 tracking-wider uppercase">
              Atención en tiempo real para el Staff
            </p>
          </div>
          <div className="flex items-center gap-3 bg-[#0a071e]/80 backdrop-blur-md border border-[#00f3ff]/30 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(0,243,255,0.1)]">
            <span className={`w-3 h-3 rounded-full ${conectado ? 'bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]' : 'bg-red-500'}`} />
            <span className={`text-[10px] font-bold tracking-widest uppercase ${conectado ? 'text-emerald-400' : 'text-red-400'}`}>
              {conectado ? 'CONECTADO' : 'DESCONECTADO'}
            </span>
            <div className="relative flex items-center">
              <span className="text-xl">🔔</span>
              {notificaciones > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-pulse">
                  {notificaciones}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="mb-8 flex items-center justify-between bg-[#0a071e]/80 backdrop-blur-md border border-[#ff00a0]/40 rounded-2xl p-5 shadow-[0_0_20px_rgba(255,0,160,0.1)]">
          <span className="text-gray-300 font-medium uppercase tracking-wider">Llamadas pendientes:</span>
          <span className="text-3xl font-orbitron font-black text-[#ff00a0] drop-shadow-[0_0_10px_#ff00a0]">
            {solicitudes.length}
          </span>
        </div>

        {solicitudes.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-[#2b1b4b]/60 rounded-3xl p-10 text-center bg-[#05030a]/50 backdrop-blur-sm">
            <div className="w-24 h-24 rounded-full bg-[#ff00a0]/10 flex items-center justify-center text-6xl mb-4 animate-pulse">
              🍹
            </div>
            <h2 className="text-xl font-orbitron font-bold text-cyan-400/60 uppercase tracking-widest">
              Todo tranquilo
            </h2>
            <p className="text-xs text-gray-500 max-w-sm mt-2 font-space">
              Las solicitudes de las mesas aparecerán aquí al instante con un estilo neón.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {solicitudes.map((sol) => (
              <div
                key={sol.idAlerta || sol.mesa}
                className="relative group bg-[#0a071e]/80 backdrop-blur-md border-2 border-[#ff00a0]/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(255,0,160,0.2)] hover:shadow-[0_0_50px_rgba(255,0,160,0.4)] transition-all duration-300 flex flex-col justify-between gap-4"
              >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ff00a0] to-transparent opacity-80" />

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#ff00a0]/20 border border-[#ff00a0]/40 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(255,0,160,0.3)] group-hover:scale-110 transition-transform">
                      🔔
                    </div>
                    <div>
                      <h3 className="font-orbitron font-black text-3xl text-[#ff00a0] drop-shadow-[0_0_10px_#ff00a0]">
                        MESA #{sol.mesa}
                      </h3>
                      <p className="text-xs text-cyan-400/60 font-mono mt-1">
                        Solicitó a las {sol.hora}
                      </p>
                    </div>
                  </div>
                  <span className="w-4 h-4 rounded-full bg-[#ff00a0] animate-ping shadow-[0_0_15px_#ff00a0]" />
                </div>

                <button
                  onClick={() => handleAtender(sol.idAlerta, sol.mesa)}
                  className="w-full py-3.5 bg-gradient-to-r from-[#00f3ff] to-[#2ee6d6] text-black font-orbitron font-black text-sm tracking-widest uppercase rounded-xl shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_35px_rgba(0,243,255,0.7)] hover:scale-[1.02] active:scale-[0.97] transition-all duration-200"
                >
                  ✅ Atender Mesa
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/admin"
            className="group flex items-center gap-2 text-[10px] text-cyan-400/60 hover:text-cyan-400 transition-colors border border-cyan-400/30 px-5 py-2.5 rounded-full hover:border-cyan-400/80 hover:shadow-[0_0_15px_rgba(0,243,255,0.1)]"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Volver al Panel de Control
          </Link>
        </div>
      </div>
    </main>
  );
}