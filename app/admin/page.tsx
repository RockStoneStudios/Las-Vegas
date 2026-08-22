'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PanelControlAdmin from '@/app/components/juegos/PanelControlAdmin';
import GestionPremiosAdmin from '@/app/components/GestionPremiosAdmin';
import { useSocketStore } from '@/lib/store/useSocketStore';

export default function PaginaAdmin() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [numeroMesa, setNumeroMesa] = useState<number | null>(2);
  
  // 🔔 Contador de notificaciones (solicitudes de mesero)
  const [notificaciones, setNotificaciones] = useState(0);

  // 🎵 Control del modo "Pedir Canción"
  const [pedirCancionActivo, setPedirCancionActivo] = useState(false);

  // 📌 Estado de la votación
  const [votacionActiva, setVotacionActiva] = useState<{
    id: string;
    pregunta: string;
    opciones: { id: number; texto: string; votos: number }[];
    duracion: number;
  } | null>(null);
  
  const [votacionIniciada, setVotacionIniciada] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  
  // 🗳️ Estados del formulario de votación
  const [preguntaVotacion, setPreguntaVotacion] = useState('¿Qué género musical quieres escuchar?');
  const [opcionesVotacion, setOpcionesVotacion] = useState<string[]>([
    '🔥 Reggaetón',
    '⚡ Electro / House',
    '🎸 Rock',
    '🎵 Pop'
  ]);
  const [duracionVotacion, setDuracionVotacion] = useState(30);
  
  const { enviarMensaje, mensajeWS, conectarSocket, conectado } = useSocketStore();

  // 🔔 Función para obtener el número real de solicitudes pendientes desde el backend
  const obtenerContadorPendientes = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/mesero/pendientes/conteo`);
      if (res.ok) {
        const data = await res.json();
        setNotificaciones(data.pendientes);
      }
    } catch (error) {
      console.error('❌ Error al obtener contador:', error);
    }
  };

  // ✅ CONECTAR WEBSOCKET DEL ADMIN - ¡SIEMPRE PONE cargando = false!
  useEffect(() => {
    const sesionGuardada = localStorage.getItem('admin_sessionId') || localStorage.getItem('admin_session_id');
    
    if (!sesionGuardada) {
      router.replace('/admin/login');
      return;
    }

    setSessionId(sesionGuardada);

    if (!conectado) {
      conectarSocket(sesionGuardada, 0, 'admin');
    }

    setCargando(false);
  }, [conectarSocket, conectado, router]);

  // 📡 Escuchar eventos de votación y notificaciones
  useEffect(() => {
    if (!mensajeWS) return;

    const tipo = mensajeWS.tipo;
    const payload = mensajeWS.payload || {};
    console.log('📩 [Admin] Evento recibido:', tipo, payload);

    // 🎵 Recibir el estado del modo "Pedir Canción"
    if (tipo === 'EVENT:MODO_PEDIR_CANCION') {
      setPedirCancionActivo(payload.activo);
    }

    // 🔔 NOTIFICACIONES: Llamada de mesero
    const eventosLlamado = ['ALERT:LLAMADO_MESERO', 'ACTION:SOLICITAR_ATENCION', 'EVENT:NUEVO_LLAMADO'];
    if (eventosLlamado.includes(tipo)) {
      obtenerContadorPendientes();
    }

    // 🧹 Cuando se atiende una mesa, también pedimos el nuevo contador
    const eventosAtendido = ['EVENT:LLAMADO_ATENDIDO', 'ACTION:ATENDER_MESA'];
    if (eventosAtendido.includes(tipo)) {
      const mesa = payload.mesa ?? payload.numeroMesa;
      if (mesa) {
        obtenerContadorPendientes();
      }
    }

    // Inicio de votación
    if (tipo === 'EVENT:VOTACION_EXPRES_START') {
      console.log('🗳️ [Admin] INICIO VOTACIÓN');
      const nuevaVotacion = {
        id: payload.id,
        pregunta: payload.pregunta,
        opciones: payload.opciones.map((o: any) => ({
          id: o.id,
          texto: o.texto,
          votos: o.votos || 0,
        })),
        duracion: payload.duracion || 30,
      };
      setVotacionActiva(nuevaVotacion);
      setVotacionIniciada(true);
      setTiempoRestante(payload.duracion || 30);
      return;
    }

    if (tipo === 'EVENT:VOTACION_ACTUALIZADA') {
      console.log('📊 [Admin] ACTUALIZANDO VOTOS. Payload:', payload);
      if (!payload.opciones || !Array.isArray(payload.opciones)) {
        console.warn('⚠️ [Admin] Payload sin opciones:', payload);
        return;
      }

      const nuevasOpciones = payload.opciones.map((o: any) => ({
        id: o.id,
        texto: o.texto,
        votos: o.votos || 0,
      }));

      setVotacionActiva((prev) => ({
        ...prev!,
        opciones: nuevasOpciones,
      }));
      return;
    }

    if (tipo === 'EVENT:VOTACION_CERRADA') {
      console.log('🗳️ [Admin] VOTACIÓN CERRADA');
      setVotacionIniciada(false);
      setVotacionActiva(null);
      setTiempoRestante(0);
      return;
    }
  }, [mensajeWS]);

  // ⏱️ Contador de tiempo
  useEffect(() => {
    if (!votacionIniciada || tiempoRestante <= 0) return;

    const timer = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [votacionIniciada, tiempoRestante]);

  // 🗳️ Agregar opción
  const agregarOpcion = () => {
    setOpcionesVotacion([...opcionesVotacion, '']);
  };

  // 🗳️ Eliminar opción
  const eliminarOpcion = (index: number) => {
    if (opcionesVotacion.length <= 2) {
      alert('Mínimo 2 opciones');
      return;
    }
    setOpcionesVotacion(opcionesVotacion.filter((_, i) => i !== index));
  };

  // 🗳️ Actualizar opción
  const actualizarOpcion = (index: number, valor: string) => {
    const nuevas = [...opcionesVotacion];
    nuevas[index] = valor;
    setOpcionesVotacion(nuevas);
  };

  // 🗳️ Iniciar votación
  const handleIniciarVotacion = () => {
    if (!preguntaVotacion.trim()) {
      alert('Escribe una pregunta');
      return;
    }
    const opcionesFiltradas = opcionesVotacion.filter(o => o.trim() !== '');
    if (opcionesFiltradas.length < 2) {
      alert('Agrega al menos 2 opciones');
      return;
    }

    if (!conectado) {
      console.warn('⚠️ [Admin] WebSocket no conectado, reconectando...');
      if (sessionId) {
        conectarSocket(sessionId, 0, 'admin');
        setTimeout(() => {
          handleIniciarVotacion();
        }, 500);
      }
      return;
    }

    console.log('📤 [Admin] Enviando votación...');
    enviarMensaje({
      tipo: 'ACTION:VOTACION_EXPRES_START',
      payload: {
        pregunta: preguntaVotacion.trim(),
        opciones: opcionesFiltradas,
        duracion: duracionVotacion,
      },
    });
  };

  // 🗳️ Cerrar votación manualmente
  const handleCerrarVotacion = () => {
    setVotacionIniciada(false);
    setVotacionActiva(null);
    setTiempoRestante(0);
  };

  // 🎵 Alternar el modo "Pedir Canción"
  const togglePedirCancion = () => {
    const nuevoEstado = !pedirCancionActivo;
    setPedirCancionActivo(nuevoEstado);
    enviarMensaje({
      tipo: 'ACTION:TOGGLE_PEDIR_CANCION',
      payload: { activo: nuevoEstado }
    });
  };

  // 🧹 CERRAR MESA - FUNCIÓN COMPLETA
  const handleCerrarMesa = async (numeroMesa: number) => {
    console.log('🧹 [FRONTEND] Iniciando cierre de mesa:', numeroMesa);
    
    const sessionId = localStorage.getItem('admin_sessionId');
    console.log('🧹 [FRONTEND] SessionId:', sessionId);
    
    if (!sessionId) {
      console.log('❌ [FRONTEND] No hay sessionId');
      alert('❌ No hay sesión activa. Inicia sesión nuevamente.');
      return;
    }

    if (!confirm(`¿Seguro que quieres cerrar la mesa #${numeroMesa}?`)) {
      console.log('❌ [FRONTEND] Usuario canceló');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/cerrar-mesa/${numeroMesa}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
  },
});

      console.log('📥 [FRONTEND] Response status:', response.status);
      console.log('📥 [FRONTEND] Response ok:', response.ok);
      
      const text = await response.text();
      console.log('📥 [FRONTEND] Texto recibido:', text);
      
      try {
        const data = JSON.parse(text);
        console.log('📥 [FRONTEND] Data parseada:', data);
        
        if (response.ok && data.ok) {
          alert(`✅ ${data.mensaje || `Mesa #${numeroMesa} cerrada correctamente`}`);
          obtenerContadorPendientes();
        } else {
          alert(`❌ Error: ${data.error || 'No se pudo cerrar la mesa'}`);
        }
      } catch (parseError) {
        console.error('❌ [FRONTEND] Error al parsear JSON:', parseError);
        alert('❌ Error al conectar con el servidor');
      }
      
    } catch (error) {
      console.error('❌ [FRONTEND] Error en fetch:', error);
      alert('❌ Error al conectar con el servidor');
    }
  };

  function cerrarSesion() {
    localStorage.removeItem('admin_sessionId');
    router.replace('/admin/login');
  }

  if (cargando || !sessionId) {
    return (
      <main className="min-h-screen bg-[#020106] flex items-center justify-center font-orbitron text-[#00f3ff] text-xs tracking-[0.2em] animate-pulse">
        CARGANDO CABINA...
      </main>
    );
  }

  return (
    <main className="relative min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-[#020106] flex flex-col items-center gap-8 select-none font-orbitron overflow-hidden">
      {/* Fondo Neo-Punk */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f3ff0a_1px,transparent_1px),linear-gradient(to_bottom,#ff00a00a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] bg-[#ff00a0]/10 rounded-full blur-[140px] pointer-events-none -top-30 -left-20" />
      <div className="absolute w-[600px] h-[600px] bg-[#00f3ff]/10 rounded-full blur-[140px] pointer-events-none -bottom-30 -right-20" />

      {/* Encabezado */}
      <div className="relative z-10 text-center max-w-6xl w-full flex flex-col items-center gap-4">
        <h1 className="font-black text-3xl sm:text-5xl uppercase tracking-[0.25em] text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
          CONTROL{' '}
          <span className="inline-block text-[#ff00a0] animate-pulse drop-shadow-[0_0_20px_#ff00a0] [text-shadow:0_0_15px_#ff00a0,0_0_30px_#ff00a0]">
            ADMIN
          </span>
        </h1>

        {/* 🟢 CABINA DE CONTROL CON BORDES PARPADEANTES */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-[#080516]/80 border border-[#00f3ff]/30 px-4 sm:px-6 py-3 rounded-xl backdrop-blur-md shadow-[0_0_20px_rgba(0,243,255,0.15)] max-w-5xl w-full">
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            <p className="font-space text-slate-300 text-[10px] sm:text-xs font-bold tracking-wider whitespace-nowrap">
              Control en tiempo real
            </p>
            <span className="hidden md:inline text-[#00f3ff] text-xs">•</span>
          </div>
          
          {/* 🎰 Link a la ruleta */}
          <Link
            href={`/admin/ruleta?sessionId=${sessionId}`}
            target="_blank"
            className="text-[10px] font-black text-[#00f3ff] hover:text-white hover:shadow-[0_0_12px_#00f3ff] transition-all uppercase tracking-widest cursor-pointer border border-[#00f3ff]/50 px-3 py-1.5 rounded-md bg-[#00f3ff]/10 flex items-center gap-1.5 whitespace-nowrap animate-pulse shadow-[0_0_10px_#00f3ff]"
          >
            🎰 [ ABRIR RULETA TV ]
          </Link>

          {/* 🔥 Link al termómetro */}
          <Link
            href={`/termometro?sessionId=${sessionId}`}
            target="_blank"
            className="text-[10px] font-black text-[#ff6b6b] hover:text-white hover:shadow-[0_0_12px_#ff6b6b] transition-all uppercase tracking-widest cursor-pointer border border-[#ff6b6b]/50 px-3 py-1.5 rounded-md bg-[#ff6b6b]/10 flex items-center gap-1.5 whitespace-nowrap animate-pulse shadow-[0_0_10px_#ff6b6b]"
          >
            🔥 [ ABRIR TERMÓMETRO TV ]
          </Link>

          {/* 🛎️ Link a solicitudes */}
          <Link
            href={`/admin/solicitudes`}
            target="_blank"
            className="relative text-[10px] font-black text-[#00f3ff] hover:text-white hover:shadow-[0_0_12px_#00f3ff] transition-all uppercase tracking-widest cursor-pointer border border-[#00f3ff]/50 px-3 py-1.5 rounded-md bg-[#00f3ff]/10 flex items-center gap-1.5 whitespace-nowrap animate-pulse shadow-[0_0_10px_#00f3ff]"
          >
            🛎️ [ SOLICITUDES ]
            {notificaciones > 0 && (
              <span className="absolute -top-2 -right-2 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-pulse">
                {notificaciones}
              </span>
            )}
          </Link>

          {/* 🎵 Link a canciones */}
          <Link
            href={`/admin/canciones`}
            target="_blank"
            className="text-[10px] font-black text-[#00f3ff] hover:text-white hover:shadow-[0_0_12px_#00f3ff] transition-all uppercase tracking-widest cursor-pointer border border-[#00f3ff]/50 px-3 py-1.5 rounded-md bg-[#00f3ff]/10 flex items-center gap-1.5 whitespace-nowrap animate-pulse shadow-[0_0_10px_#00f3ff]"
          >
            🎵 [ VER CANCIONES ]
          </Link>

          {/* 🎵 Botón para activar/desactivar Pedir Canción */}
          <button
            onClick={togglePedirCancion}
            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all duration-200 whitespace-nowrap animate-pulse ${
              pedirCancionActivo
                ? 'border-[#00f3ff] text-[#00f3ff] bg-[#00f3ff]/10 shadow-[0_0_10px_rgba(0,243,255,0.3)]'
                : 'border-gray-600 text-gray-500 bg-[#060413]/50'
            }`}
          >
            {pedirCancionActivo ? '🎵 CANCIONES ACTIVAS' : '🎵 CANCIONES DESACTIVADAS'}
          </button>

          {/* 🧹 CERRAR MESA CON SELECTOR */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={50}
              value={numeroMesa || 1}
              onChange={(e) => setNumeroMesa(Number(e.target.value))}
              className="w-12 bg-[#0a0720] border border-[#ff6b6b]/30 rounded-md px-2 py-1 text-white text-sm font-space text-center focus:outline-none focus:border-[#ff6b6b]"
            />
            <button
              onClick={() => handleCerrarMesa(numeroMesa || 1)}
              className="text-[10px] font-black text-[#ff6b6b] hover:text-white hover:shadow-[0_0_12px_#ff6b6b] transition-all uppercase tracking-widest cursor-pointer border border-[#ff6b6b]/50 px-3 py-1.5 rounded-md bg-[#ff6b6b]/10 flex items-center gap-1.5 whitespace-nowrap animate-pulse shadow-[0_0_10px_#ff6b6b]"
            >
              🧹 [ CERRAR MESA ]
            </button>
          </div>

          <span className="hidden md:inline text-[#00f3ff] text-xs">•</span>

          <button
            onClick={cerrarSesion}
            className="text-[10px] font-black text-red-400 hover:text-red-300 hover:shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all uppercase tracking-widest cursor-pointer border border-red-500/40 px-3 py-1.5 rounded-md bg-red-500/10 whitespace-nowrap animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"
          >
            [ CERRAR SESIÓN ]
          </button>
        </div>
      </div>

      {/* 🗳️ PANEL DE VOTACIONES */}
      <div className="relative z-10 w-full max-w-5xl">
        <div className="bg-[#080516]/80 border border-[#ff00a0]/30 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_30px_rgba(255,0,160,0.1)]">
          <h2 className="font-orbitron font-black text-lg text-[#ff00a0] uppercase tracking-widest drop-shadow-[0_0_10px_#ff00a0] mb-4 flex items-center gap-3">
            <span>🗳️</span> VOTACIONES EN VIVO
            {votacionIniciada && (
              <span className="text-xs text-[#00f3ff] animate-pulse font-space">
                ● EN CURSO
              </span>
            )}
            {!conectado && (
              <span className="text-xs text-red-400 animate-pulse font-space">
                ⚠️ DESCONECTADO
              </span>
            )}
          </h2>

          {!votacionIniciada ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-space block mb-1">¿Qué quieres preguntar?</label>
                <input
                  type="text"
                  value={preguntaVotacion}
                  onChange={(e) => setPreguntaVotacion(e.target.value)}
                  placeholder="Ej: ¿Qué género musical quieres escuchar?"
                  className="w-full bg-[#0a0720] border border-[#1f1645] rounded-xl px-4 py-3 text-white text-sm font-space focus:outline-none focus:border-[#ff00a0] focus:shadow-[0_0_15px_rgba(255,0,160,0.2)] transition-all"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-space block mb-1">Opciones (mínimo 2)</label>
                <div className="space-y-2">
                  {opcionesVotacion.map((opcion, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={opcion}
                        onChange={(e) => actualizarOpcion(index, e.target.value)}
                        placeholder={`Opción ${index + 1}`}
                        className="flex-1 bg-[#0a0720] border border-[#1f1645] rounded-xl px-4 py-2.5 text-white text-sm font-space focus:outline-none focus:border-[#00f3ff] focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all"
                      />
                      <button
                        onClick={() => eliminarOpcion(index)}
                        className="px-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400 text-xs hover:bg-red-500/30 transition-all"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={agregarOpcion}
                  className="mt-2 text-xs text-[#00f3ff] border border-[#00f3ff]/30 px-4 py-1.5 rounded-lg hover:bg-[#00f3ff]/10 transition-all"
                >
                  + Agregar opción
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full sm:w-48">
                  <label className="text-xs text-gray-400 font-space block mb-1">Duración (segundos)</label>
                  <input
                    type="number"
                    value={duracionVotacion}
                    onChange={(e) => setDuracionVotacion(Number(e.target.value))}
                    className="w-full bg-[#0a0720] border border-[#1f1645] rounded-xl px-4 py-3 text-white text-sm font-space focus:outline-none focus:border-[#ff00a0] focus:shadow-[0_0_15px_rgba(255,0,160,0.2)] transition-all"
                    min={10}
                    max={120}
                  />
                </div>
                <button
                  onClick={handleIniciarVotacion}
                  className="w-full sm:flex-1 py-3 bg-gradient-to-r from-[#ff00a0] to-[#9b5de5] rounded-xl font-orbitron font-black text-sm text-white uppercase tracking-widest shadow-[0_0_20px_rgba(255,0,160,0.4)] hover:shadow-[0_0_35px_rgba(255,0,160,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  🚀 INICIAR VOTACIÓN
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-orbitron text-sm font-bold">
                  {votacionActiva?.pregunta}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-[#00f3ff] font-space text-xs">
                    ⏱️ {tiempoRestante}s
                  </span>
                  <button
                    onClick={handleCerrarVotacion}
                    className="text-[10px] text-red-400 border border-red-500/40 px-3 py-1 rounded-md hover:bg-red-500/10 transition-all"
                  >
                    ✕ CERRAR
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {votacionActiva?.opciones.map((opcion) => {
                  const totalVotos = votacionActiva.opciones.reduce((acc, o) => acc + o.votos, 0);
                  const porcentaje = totalVotos > 0 ? Math.round((opcion.votos / totalVotos) * 100) : 0;
                  
                  return (
                    <div
                      key={opcion.id}
                      className="relative bg-[#0a0720] border border-[#1f1645] rounded-xl p-4 overflow-hidden"
                    >
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-[#ff00a0]/20 to-[#00f3ff]/20"
                        style={{ width: `${porcentaje}%` }}
                      />
                      <div className="relative z-10">
                        <p className="text-white font-space text-xs font-bold">{opcion.texto}</p>
                        <div className="flex justify-between mt-1">
                          <span className="text-[#00f3ff] font-space text-xs">{opcion.votos} votos</span>
                          <span className="text-[#ff00a0] font-orbitron text-xs font-black">{porcentaje}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panel de Control y Gestión de Premios */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-8 items-center">
        <PanelControlAdmin
          sessionId={sessionId}
          numeroMesa={numeroMesa}
          setNumeroMesa={setNumeroMesa}
        />

        <GestionPremiosAdmin />
      </div>
    </main>
  );
}