import { create } from 'zustand';

// =============================================================
// TIPOS
// =============================================================
interface PayloadRuletaGirar {
  indiceGanador: number;
  premio: string;
  vueltas: number;
  duracionMs: number;
  ejecutadoPorMesa: number;
  esPremioMayor?: boolean;
}

export interface MensajeWS {
  tipo: string;
  payload?: any;
}

export interface OpcionVotacion {
  id: number;
  texto: string;
  votos: number;
}

export interface VotacionActiva {
  id: string;
  pregunta: string;
  opciones: OpcionVotacion[];
  /** Momento local (Date.now()) en que termina la votación */
  finalizaEn: number;
}

type ListenerWS = (data: MensajeWS) => void;

interface SocketState {
  socket: WebSocket | null;
  conectado: boolean;
  sessionId: string | null;
  mesa: number | null;
  rol: string | null;

  juegoDesbloqueado: string | null;
  animacionRuleta: PayloadRuletaGirar | null;
  mensajeWS: MensajeWS | null;

  meseroBloqueado: boolean;

  // Estado persistente (sobrevive aunque el componente se monte tarde)
  votacionActiva: VotacionActiva | null;
  modoPedirCancion: boolean;
  estadoInicialRecibido: boolean;

  conectarSocket: (sessionId: string, mesa?: number | null, rol?: string | null) => void;
  desconectarSocket: () => void;
  restaurarSesion: () => void;
  enviarMensaje: (tipoOrData: string | Record<string, any>, payload?: Record<string, any>) => void;
  limpiarAnimacionRuleta: () => void;

  setMeseroBloqueado: (bloqueado: boolean) => void;

  sincronizarEstado: () => void;
  limpiarVotacion: () => void;
}

// =============================================================
// CONFIGURACIÓN
// =============================================================
const DEBUG = process.env.NODE_ENV !== 'production';
const log = (...args: any[]) => {
  if (DEBUG) console.log(...args);
};

// Si no llega NINGÚN mensaje (el PING del servidor cuenta) en este tiempo,
// el socket se considera muerto ("zombi") y se reconecta.
// IMPORTANTE: debe ser MAYOR que el intervalo de PING de tu servidor
// (servidor cada 25s -> watchdog 60s).
const WATCHDOG_MS = 60_000;

// Si la pestaña estuvo oculta más de esto, no confiamos en el estado del socket.
const OCULTO_MAX_MS = 5_000;

// Códigos de cierre del servidor con los que NO se debe reintentar:
// 4001 = falta sessionId, 4002 = sesión inválida.
// OJO: 4003 = "Heartbeat timeout" SÍ debe reintentar (pasa al volver de segundo plano).
const NO_RECONECTAR = [4001, 4002];

const STORAGE_KEY = 'ws_session';

// =============================================================
// ESTADO DE MÓDULO (fuera de React/Zustand)
// =============================================================
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let watchdog: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
let ocultoDesde = 0;

// Sistema de listeners: a diferencia de `mensajeWS`, NO pierde mensajes
// cuando llegan varios seguidos (reacciones, votos, etc.).
const listeners = new Map<string, Set<ListenerWS>>();

/**
 * Suscribe un callback a un tipo de mensaje ('*' = todos).
 * Devuelve la función para cancelar la suscripción (úsala en el cleanup de useEffect).
 *
 * Mensaje local especial: 'LOCAL:SOCKET_CONECTADO' se emite cada vez que
 * el socket abre (incluye reconexiones) -> úsalo para re-sincronizar estado
 * (votación activa, modo pedir canción, etc.).
 */
export const suscribirMensaje = (tipo: string, cb: ListenerWS) => {
  if (!listeners.has(tipo)) listeners.set(tipo, new Set());
  listeners.get(tipo)!.add(cb);
  return () => {
    listeners.get(tipo)?.delete(cb);
  };
};

const emitir = (data: MensajeWS) => {
  listeners.get(data.tipo)?.forEach((cb) => {
    try {
      cb(data);
    } catch (e) {
      console.warn('⚠️ Error en listener WS:', e);
    }
  });
  listeners.get('*')?.forEach((cb) => {
    try {
      cb(data);
    } catch (e) {
      console.warn('⚠️ Error en listener WS (*):', e);
    }
  });
};

// =============================================================
// HELPERS
// =============================================================
const limpiarTimers = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  if (watchdog) {
    clearTimeout(watchdog);
    watchdog = null;
  }
};

const soltarHandlers = (ws: WebSocket) => {
  ws.onopen = null;
  ws.onerror = null;
  ws.onmessage = null;
  ws.onclose = null;
};

/**
 * Convierte el payload del servidor en VotacionActiva.
 * Acepta `duracion` (EVENT:VOTACION_EXPRES_START) o
 * `duracionRestante` (EVENT:VOTACION_ACTIVA_SYNC / ESTADO_INICIAL),
 * ambos en segundos.
 */
const normalizarVotacion = (p: any): VotacionActiva | null => {
  if (!p || !p.id) return null;
  const segundos = Number(p.duracionRestante ?? p.duracion ?? 0);
  if (segundos <= 0) return null;
  return {
    id: p.id,
    pregunta: p.pregunta,
    opciones: Array.isArray(p.opciones) ? p.opciones : [],
    finalizaEn: Date.now() + segundos * 1000,
  };
};

const armarWatchdog = (ws: WebSocket) => {
  if (watchdog) clearTimeout(watchdog);
  watchdog = setTimeout(() => {
    // En segundo plano los timers/mensajes se pausan: no es un fallo real.
    // Al volver a la pestaña, el listener de visibilitychange se encarga.
    if (typeof document !== 'undefined' && document.hidden) {
      armarWatchdog(ws);
      return;
    }
    log('🧟 [STORE] Watchdog: sin mensajes, forzando reconexión');
    forzarReconexion(ws);
  }, WATCHDOG_MS);
};

const forzarReconexion = (ws: WebSocket) => {
  const { socket, sessionId, mesa, rol, conectarSocket } = useSocketStore.getState();
  if (socket !== ws) return; // ya es otro socket

  soltarHandlers(ws);
  try {
    ws.close();
  } catch {}

  if (watchdog) clearTimeout(watchdog);
  useSocketStore.setState({ socket: null, conectado: false });

  if (sessionId) conectarSocket(sessionId, mesa, rol);
};

const programarReconexion = () => {
  const { sessionId } = useSocketStore.getState();
  if (!sessionId) return;

  // Sin red: esperamos al evento 'online' en vez de gastar reintentos
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    log('📴 [STORE] Sin red, esperando evento online');
    return;
  }

  // Backoff exponencial (máx 5s) con jitter para no reconectar todos a la vez
  const base = Math.min(1000 * Math.pow(1.5, reconnectAttempts), 5000);
  const delay = base / 2 + Math.random() * (base / 2);
  log(`🔄 [STORE] Reintentando en ${(delay / 1000).toFixed(1)}s (intento ${reconnectAttempts + 1})`);

  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  reconnectTimeout = setTimeout(() => {
    reconnectAttempts++;
    const { sessionId, mesa, rol, conectarSocket } = useSocketStore.getState();
    if (sessionId) conectarSocket(sessionId, mesa, rol);
  }, delay);
};

const guardarSesion = (sessionId: string, mesa: number | null, rol: string | null) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId, mesa, rol }));
  } catch {}
};

const borrarSesion = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
};

// =============================================================
// STORE
// =============================================================
export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  conectado: false,
  sessionId: null,
  mesa: null,
  rol: null,
  juegoDesbloqueado: null,
  animacionRuleta: null,
  mensajeWS: null,
  meseroBloqueado: false,
  votacionActiva: null,
  modoPedirCancion: false,
  estadoInicialRecibido: false,

  conectarSocket: (newSessionId: string, mesa: number | null = null, rol: string | null = null) => {
    if (!newSessionId || newSessionId === 'undefined' || newSessionId === 'null') {
      console.warn('⚠️ SessionId inválido');
      return;
    }

    const { socket, conectado, sessionId: currentSessionId } = get();

    // Ya conectado y saludable
    if (socket && conectado && socket.readyState === WebSocket.OPEN && currentSessionId === newSessionId) {
      return;
    }

    // Ya conectando con la misma sesión
    if (socket && socket.readyState === WebSocket.CONNECTING && currentSessionId === newSessionId) {
      return;
    }

    // Limpiar socket previo (cambió de sesión o estaba roto)
    if (socket) {
      soltarHandlers(socket);
      try {
        socket.close();
      } catch {}
    }

    limpiarTimers();

    const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/^http/, 'ws') || 'ws://localhost:3001';
    const wsUrl = `${API_URL}/ws?sessionId=${encodeURIComponent(newSessionId)}`;
    log(`🔌 [STORE] Conectando a: ${wsUrl}`);

    const ws = new WebSocket(wsUrl);
    set({ socket: ws, sessionId: newSessionId, mesa, rol, conectado: false });
    guardarSesion(newSessionId, mesa, rol);

    ws.onopen = () => {
      if (get().socket !== ws) return;
      log(`✅ [STORE] WebSocket CONECTADO | ID: ${newSessionId}`);
      reconnectAttempts = 0;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      armarWatchdog(ws);
      set({ conectado: true });

      // Aviso local: úsalo para re-sincronizar estado tras reconectar
      emitir({ tipo: 'LOCAL:SOCKET_CONECTADO' });
    };

    ws.onmessage = (event) => {
      if (get().socket !== ws) return;

      // Cualquier mensaje (incluido PING) = la conexión está viva
      armarWatchdog(ws);

      try {
        const data: MensajeWS = JSON.parse(event.data);

        // HEARTBEAT: responder PING del servidor
        if (data.tipo === 'PING') {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ tipo: 'PONG' }));
          }
          return;
        }

        set({ mensajeWS: data }); // compatibilidad con código existente
        emitir(data);             // sistema de listeners (no pierde mensajes)

        // ---------------------------------------------------------
        // ESTADO PERSISTENTE (votaciones / pedir canción)
        // ---------------------------------------------------------
        switch (data.tipo) {
          // Al conectar o reconectar. votacionActiva null limpia votaciones ya terminadas.
          case 'EVENT:ESTADO_INICIAL':
              console.log('🧪 [STORE] ESTADO_INICIAL', data.payload, '→', normalizarVotacion(data.payload?.votacionActiva));
            set({
              votacionActiva: normalizarVotacion(data.payload?.votacionActiva),
              modoPedirCancion: !!data.payload?.modoPedirCancion,
              estadoInicialRecibido: true,
            });
            break;

          // Sincronización con tiempo restante exacto (llega justo después del ESTADO_INICIAL)
          case 'EVENT:VOTACION_ACTIVA_SYNC': {
            const v = normalizarVotacion(data.payload);
            if (v) set({ votacionActiva: v });
            break;
          }

          // Se abre una votación nueva
          case 'EVENT:VOTACION_EXPRES_START': {
            const v = normalizarVotacion(data.payload);
            if (v) set({ votacionActiva: v });
            break;
          }

          // Actualización de conteo de votos (throttle 500ms en el servidor)
          case 'EVENT:VOTACION_ACTUALIZADA': {
            const actual = get().votacionActiva;
            if (actual && actual.id === data.payload?.id) {
              set({ votacionActiva: { ...actual, opciones: data.payload.opciones } });
            }
            break;
          }

          // La votación terminó
          case 'EVENT:VOTACION_CERRADA': {
            const actual = get().votacionActiva;
            if (!actual || actual.id === data.payload?.id) {
              set({ votacionActiva: null });
            }
            break;
          }

          case 'EVENT:PEDIR_CANCION_ESTADO':
            // Ajusta al nombre real que emite InteraccionesService.toggleModoPedirCancion
            set({ modoPedirCancion: !!(data.payload?.activo ?? data.payload) });
            break;
        }

        if (data.tipo === 'EVENT:JUEGO_PRIVADO_DESBLOQUEADO') {
          set({ juegoDesbloqueado: data.payload.juegoId });
        }
        if (data.tipo === 'EVENT:RULETA_GIRAR' || data.tipo === 'ACTION:GIRAR_RULETA') {
          set({ animacionRuleta: data.payload });
        }

        if (data.tipo === 'EVENT:MESERO_SOLICITADO') {
          if (data.payload?.mesa === get().mesa) {
            set({ meseroBloqueado: true });
          }
        }
        if (data.tipo === 'EVENT:MESERO_ATENDIDO' || data.tipo === 'EVENT:MESA_CERRADA') {
          if (data.payload?.mesa === get().mesa) {
            set({ meseroBloqueado: false });
          }
        }
      } catch (error) {
        console.warn('⚠️ Error procesando mensaje:', error);
      }
    };

    ws.onclose = (event) => {
      if (watchdog) clearTimeout(watchdog);

      // Un socket viejo no debe pisar al nuevo
      if (get().socket !== ws) return;

      log(`❌ [STORE] WebSocket CERRADO | Código: ${event.code} | Razón: ${event.reason || 'Sin razón'}`);
      set({ socket: null, conectado: false });

      if (NO_RECONECTAR.includes(event.code)) {
        log('⛔ [STORE] Cierre definitivo, no se reintenta');
        if (event.code === 4002) borrarSesion();
        return;
      }

      programarReconexion();
    };

    ws.onerror = () => {
      if (DEBUG && ws.readyState !== WebSocket.CLOSED) {
        console.warn('⚠️ [STORE] Error en WebSocket (readyState:', ws.readyState, ')');
      }
      // onclose se dispara después y se encarga de reintentar
    };
  },

  desconectarSocket: () => {
    limpiarTimers();
    reconnectAttempts = 0;
    borrarSesion();

    const { socket } = get();
    if (socket) {
      soltarHandlers(socket);
      try {
        socket.close(1000, 'Desconexión manual');
      } catch {}
    }
    set({
      socket: null,
      conectado: false,
      sessionId: null,
      mesa: null,
      rol: null,
      votacionActiva: null,
      modoPedirCancion: false,
      estadoInicialRecibido: false,
    });
  },

  // Llamar UNA vez desde un componente raíz (layout) para recuperar la sesión
  // después de una recarga completa o de navegar con <a href> en vez de <Link>.
  restaurarSesion: () => {
    if (typeof window === 'undefined') return;
    if (get().sessionId) return; // ya hay sesión en el store
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const { sessionId, mesa, rol } = JSON.parse(raw);
      if (sessionId) get().conectarSocket(sessionId, mesa ?? null, rol ?? null);
    } catch {}
  },

  enviarMensaje: (tipoOrData, payload = {}) => {
    const { socket, conectado } = get();

    if (!socket || !conectado || socket.readyState !== WebSocket.OPEN) {
      if (DEBUG) console.warn('⚠️ No se pudo enviar mensaje: Socket desconectado');
      return;
    }

    const mensajeAEnviar =
      typeof tipoOrData === 'string'
        ? JSON.stringify({ tipo: tipoOrData, payload })
        : JSON.stringify(tipoOrData);

    try {
      socket.send(mensajeAEnviar);
    } catch (error) {
      console.error('❌ [STORE] Error enviando mensaje:', error);
    }
  },

  limpiarAnimacionRuleta: () => set({ animacionRuleta: null }),
  setMeseroBloqueado: (bloqueado) => set({ meseroBloqueado: bloqueado }),

  // Pide al servidor el estado actual (votación, pedir canción)
  sincronizarEstado: () => {
    get().enviarMensaje('ACTION:SOLICITAR_ESTADO');
  },
  limpiarVotacion: () => set({ votacionActiva: null }),
}));

// =============================================================
// RECONEXIÓN AL VOLVER A LA APP (móviles / PWA / otras pestañas)
// =============================================================
if (typeof window !== 'undefined' && !(window as any).__wsListenersInstalados) {
  // Evita duplicar listeners con Hot Reload
  (window as any).__wsListenersInstalados = true;

  const verificar = (forzar = false) => {
    const { socket, conectado, sessionId, mesa, rol, conectarSocket } = useSocketStore.getState();
    if (!sessionId) return;

    if (!socket || !conectado || socket.readyState !== WebSocket.OPEN) {
      log('📱 [PWA] Socket caído, reconectando...');
      reconnectAttempts = 0;
      conectarSocket(sessionId, mesa, rol);
    } else if (forzar) {
      // Puede estar "OPEN" pero ser un zombi tras estar en segundo plano
      log('📱 [PWA] Volviste a la app, renovando conexión por seguridad...');
      forzarReconexion(socket);
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      ocultoDesde = Date.now();
    } else {
      verificar(ocultoDesde > 0 && Date.now() - ocultoDesde > OCULTO_MAX_MS);
    }
  });

  // Safari/iOS: restauración desde bfcache
  window.addEventListener('pageshow', (e) => verificar((e as PageTransitionEvent).persisted));

  // Volvió la red
  window.addEventListener('online', () => verificar(true));
}