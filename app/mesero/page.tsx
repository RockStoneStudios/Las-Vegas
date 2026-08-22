'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocketStore } from '@/lib/store/useSocketStore';

interface SolicitudMesero {
  idAlerta: string;
  mesa: number;
  hora: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function PanelMeseroPage() {
  const { conectarSocket, mensajeWS, enviarMensaje, conectado } = useSocketStore();
  const [solicitudes, setSolicitudes] = useState<SolicitudMesero[]>([]);
  const [cargandoAuth, setCargandoAuth] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ✅ 1. INICIALIZAR SESIÓN - CORREGIDO
    // ✅ 1. INICIALIZAR SESIÓN DEL MESERO (Usando la sesión del Admin)
  useEffect(() => {
    const inicializarSesion = async () => {
      // 🟢 El mesero usa la sesión del Admin (guardada como 'admin_session_id')
      let sessionId = localStorage.getItem('admin_session_id');
      
      // Si no hay sesión de Admin, redirige al login
      if (!sessionId) {
        console.warn('⚠️ No hay sesión de Admin activa. Redirigiendo al login...');
        window.location.href = '/admin/login';
        return;
      }

      console.log('✅ [MESERO] Usando sesión del Admin:', sessionId);
      
      // Conectar WebSocket con el rol 'mesero'
      conectarSocket(sessionId, 0, 'mesero');
      setCargandoAuth(false);
    };

    inicializarSesion();
  }, [conectarSocket]);

  // ✅ 2. ESCUCHAR MENSAJES - CORREGIDO
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

    if (!mensajeWS) return;

    console.log('📨 [PANEL] Mensaje recibido:', mensajeWS);

    const tipo = mensajeWS?.tipo;
    const payload = mensajeWS?.payload || {};

    // 🛎️ Eventos de nuevo llamado
    const eventosLlamado = [
      'ALERT:LLAMADO_MESERO',
      'ACTION:SOLICITAR_ATENCION',
      'EVENT:SOLICITAR_ATENCION',
      'EVENT:NUEVO_LLAMADO',
      'EVENT:LLAMADO_MESERO'
    ];

    if (eventosLlamado.includes(tipo)) {
      const numeroMesa = payload.mesa ?? payload.numeroMesa ?? payload.table;
      console.log('📢 ¡Mesa solicitando atención! Número:', numeroMesa);

      if (numeroMesa !== undefined && numeroMesa !== null) {
        audioRef.current?.play().catch(() => {});

        const horaFormateada = payload.hora
          ? new Date(payload.hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const idAlerta = payload.idAlerta || `alerta-${numeroMesa}-${Date.now()}`;

        setSolicitudes((prev) => {
          const yaExiste = prev.some((s) => Number(s.mesa) === Number(numeroMesa));
          if (yaExiste) return prev;
          return [{ idAlerta, mesa: Number(numeroMesa), hora: horaFormateada }, ...prev];
        });
      }
    }

    // 🧹 Eventos cuando la mesa se atiende
    const eventosAtendido = [
      'EVENT:LLAMADO_ATENDIDO',
      'ACTION:CANCELAR_LLAMADO',
      'EVENT:LLAMADO_CANCELADO',
      'ACTION:ATENDER_MESA'
    ];

    if (eventosAtendido.includes(tipo)) {
      const numeroMesa = payload.mesa ?? payload.numeroMesa;
      if (numeroMesa) {
        setSolicitudes((prev) => prev.filter((s) => Number(s.mesa) !== Number(numeroMesa)));
      }
    }
  }, [mensajeWS]);

  // ✅ 3. ATENDER MESA - CORREGIDO
  const handleAtender = (idAlerta: string, mesa: number) => {
    // Limpiar localmente
    setSolicitudes((prev) => prev.filter((s) => s.mesa !== mesa));

    // Enviar evento de atención
    enviarMensaje({
      tipo: 'ACTION:ATENDER_MESA',
      payload: {
        idAlerta,
        mesa: Number(mesa),
        numeroMesa: Number(mesa),
      },
    });
  };

  if (cargandoAuth) {
    return (
      <div className="min-h-screen bg-[#060413] flex items-center justify-center text-cyan-400 font-orbitron">
        Verificando acceso de Staff...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060413] text-white p-4 sm:p-8 font-space select-none">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
          <div>
            <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-cyan-400 uppercase tracking-wider">
              Panel de Meseros
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">Atención en tiempo real</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${conectado ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className={`text-xs font-bold uppercase ${conectado ? 'text-emerald-400' : 'text-red-400'}`}>
              {conectado ? 'Staff Conectado' : 'Desconectado'}
            </span>
          </div>
        </header>

        <div className="mb-6 flex items-center justify-between bg-[#0f0b21] border border-cyan-500/30 rounded-xl p-4">
          <span className="text-sm text-gray-300 font-medium">Llamados pendientes:</span>
          <span className="text-2xl font-orbitron font-black text-amber-400">{solicitudes.length}</span>
        </div>

        {solicitudes.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-gray-800 rounded-2xl p-6 text-center">
            <span className="text-5xl mb-3">🍸</span>
            <h2 className="text-lg font-bold text-gray-300">Todo tranquilo por ahora</h2>
            <p className="text-xs text-gray-500 max-w-sm mt-1">
              Las llamadas enviadas desde las mesas aparecerán aquí al instante.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {solicitudes.map((sol) => (
              <div
                key={sol.idAlerta || sol.mesa}
                className="relative bg-gradient-to-br from-amber-500/10 via-[#0f0b21] to-[#060413] border-2 border-amber-500 rounded-2xl p-5 shadow-[0_0_20px_rgba(245,158,11,0.25)] flex flex-col justify-between gap-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🔔</span>
                    <div>
                      <h3 className="font-orbitron font-black text-2xl text-amber-400">MESA #{sol.mesa}</h3>
                      <p className="text-xs text-gray-400">Llamó {sol.hora}</p>
                    </div>
                  </div>
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                </div>

                <button
                  onClick={() => handleAtender(sol.idAlerta, sol.mesa)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-black text-sm uppercase rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  ✅ Atender Mesa #{sol.mesa}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}