// import { create } from 'zustand';

// // =============================================================
// // TIPOS
// // =============================================================
// interface PayloadRuletaGirar {
//   indiceGanador: number;
//   premio: string;
//   vueltas: number;
//   duracionMs: number;
//   ejecutadoPorMesa: number;
//   esPremioMayor?: boolean;
// }

// export interface MensajeWS {
//   tipo: string;
//   payload?: any;
// }

// export interface OpcionVotacion {
//   id: number;
//   texto: string;
//   votos: number;
// }

// export interface VotacionActiva {
//   id: string;
//   pregunta: string;
//   opciones: OpcionVotacion[];
//   /** Momento local (Date.now()) en que termina la votación */
//   finalizaEn: number;
// }

// type ListenerWS = (data: MensajeWS) => void;

// interface SocketState {
//   socket: WebSocket | null;
//   conectado: boolean;
//   sessionId: string | null;
//   mesa: number | null;
//   rol: string | null;

//   juegoDesbloqueado: string | null;
//   animacionRuleta: PayloadRuletaGirar | null;
//   mensajeWS: MensajeWS | null;

//   meseroBloqueado: boolean;

//   // Estado persistente (sobrevive aunque el componente se monte tarde)
//   votacionActiva: VotacionActiva | null;
//   modoPedirCancion: boolean;
//   estadoInicialRecibido: boolean;

//   conectarSocket: (sessionId: string, mesa?: number | null, rol?: string | null) => void;
//   desconectarSocket: () => void;
//   restaurarSesion: () => void;
//   enviarMensaje: (tipoOrData: string | Record<string, any>, payload?: Record<string, any>) => void;
//   limpiarAnimacionRuleta: () => void;

//   setMeseroBloqueado: (bloqueado: boolean) => void;

//   sincronizarEstado: () => void;
//   limpiarVotacion: () => void;
// }

// // =============================================================
// // CONFIGURACIÓN
// // =============================================================
// const DEBUG = process.env.NODE_ENV !== 'production';
// const log = (...args: any[]) => {
//   if (DEBUG) console.log(...args);
// };

// const WATCHDOG_MS = 60_000;
// const OCULTO_MAX_MS = 5_000;
// const NO_RECONECTAR = [4001, 4002];
// const STORAGE_KEY = 'ws_session';

// // =============================================================
// // ESTADO DE MÓDULO (fuera de React/Zustand)
// // =============================================================
// let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
// let watchdog: ReturnType<typeof setTimeout> | null = null;
// let reconnectAttempts = 0;
// let ocultoDesde = 0;

// const listeners = new Map<string, Set<ListenerWS>>();

// export const suscribirMensaje = (tipo: string, cb: ListenerWS) => {
//   if (!listeners.has(tipo)) listeners.set(tipo, new Set());
//   listeners.get(tipo)!.add(cb);
//   return () => {
//     listeners.get(tipo)?.delete(cb);
//   };
// };

// const emitir = (data: MensajeWS) => {
//   listeners.get(data.tipo)?.forEach((cb) => {
//     try {
//       cb(data);
//     } catch (e) {
//       console.warn('⚠️ Error en listener WS:', e);
//     }
//   });
//   listeners.get('*')?.forEach((cb) => {
//     try {
//       cb(data);
//     } catch (e) {
//       console.warn('⚠️ Error en listener WS (*):', e);
//     }
//   });
// };

// // =============================================================
// // HELPERS
// // =============================================================
// const limpiarTimers = () => {
//   if (reconnectTimeout) {
//     clearTimeout(reconnectTimeout);
//     reconnectTimeout = null;
//   }
//   if (watchdog) {
//     clearTimeout(watchdog);
//     watchdog = null;
//   }
// };

// const soltarHandlers = (ws: WebSocket) => {
//   ws.onopen = null;
//   ws.onerror = null;
//   ws.onmessage = null;
//   ws.onclose = null;
// };

// const normalizarVotacion = (p: any): VotacionActiva | null => {
//   if (!p || !p.id) return null;
//   const segundos = Number(p.duracionRestante ?? p.duracion ?? 0);
//   if (segundos <= 0) return null;
//   return {
//     id: p.id,
//     pregunta: p.pregunta,
//     opciones: Array.isArray(p.opciones) ? p.opciones : [],
//     finalizaEn: Date.now() + segundos * 1000,
//   };
// };

// const armarWatchdog = (ws: WebSocket) => {
//   if (watchdog) clearTimeout(watchdog);
//   watchdog = setTimeout(() => {
//     if (typeof document !== 'undefined' && document.hidden) {
//       armarWatchdog(ws);
//       return;
//     }
//     log('🧟 [STORE] Watchdog: sin mensajes, forzando reconexión');
//     forzarReconexion(ws);
//   }, WATCHDOG_MS);
// };

// const forzarReconexion = (ws: WebSocket) => {
//   const { socket, sessionId, mesa, rol, conectarSocket } = useSocketStore.getState();
//   if (socket !== ws) return;

//   soltarHandlers(ws);
//   try { ws.close(); } catch {}

//   if (watchdog) clearTimeout(watchdog);
//   useSocketStore.setState({ socket: null, conectado: false });

//   if (sessionId) conectarSocket(sessionId, mesa, rol);
// };

// const programarReconexion = () => {
//   const { sessionId } = useSocketStore.getState();
//   if (!sessionId) return;

//   if (typeof navigator !== 'undefined' && navigator.onLine === false) {
//     log('📴 [STORE] Sin red, esperando evento online');
//     return;
//   }

//   const base = Math.min(1000 * Math.pow(1.5, reconnectAttempts), 5000);
//   const delay = base / 2 + Math.random() * (base / 2);
//   log(`🔄 [STORE] Reintentando en ${(delay / 1000).toFixed(1)}s (intento ${reconnectAttempts + 1})`);

//   if (reconnectTimeout) clearTimeout(reconnectTimeout);
//   reconnectTimeout = setTimeout(() => {
//     reconnectAttempts++;
//     const { sessionId, mesa, rol, conectarSocket } = useSocketStore.getState();
//     if (sessionId) conectarSocket(sessionId, mesa, rol);
//   }, delay);
// };

// const guardarSesion = (sessionId: string, mesa: number | null, rol: string | null) => {
//   try {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId, mesa, rol }));
//   } catch {}
// };

// const borrarSesion = () => {
//   try {
//     localStorage.removeItem(STORAGE_KEY);
//   } catch {}
// };

// // =============================================================
// // STORE
// // =============================================================
// export const useSocketStore = create<SocketState>((set, get) => ({
//   socket: null,
//   conectado: false,
//   sessionId: null,
//   mesa: null,
//   rol: null,
//   juegoDesbloqueado: null,
//   animacionRuleta: null,
//   mensajeWS: null,
//   meseroBloqueado: false,
//   votacionActiva: null,
//   modoPedirCancion: false,
//   estadoInicialRecibido: false,

//   conectarSocket: (newSessionId: string, mesa: number | null = null, rol: string | null = null) => {
//     if (!newSessionId || newSessionId === 'undefined' || newSessionId === 'null') {
//       console.warn('⚠️ SessionId inválido');
//       return;
//     }

//     const { socket, conectado, sessionId: currentSessionId } = get();

//     if (socket && conectado && socket.readyState === WebSocket.OPEN && currentSessionId === newSessionId) {
//       return;
//     }

//     if (socket && socket.readyState === WebSocket.CONNECTING && currentSessionId === newSessionId) {
//       return;
//     }

//     if (socket) {
//       soltarHandlers(socket);
//       try { socket.close(); } catch {}
//     }

//     limpiarTimers();

//     const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/^http/, 'ws') || 'ws://localhost:3001';
//     const wsUrl = `${API_URL}/ws?sessionId=${encodeURIComponent(newSessionId)}`;
//     log(`🔌 [STORE] Conectando a: ${wsUrl}`);

//     const ws = new WebSocket(wsUrl);
//     set({ socket: ws, sessionId: newSessionId, mesa, rol, conectado: false });
//     guardarSesion(newSessionId, mesa, rol);

//     ws.onopen = () => {
//       if (get().socket !== ws) return;
//       log(`✅ [STORE] WebSocket CONECTADO | ID: ${newSessionId}`);
//       reconnectAttempts = 0;
//       if (reconnectTimeout) {
//         clearTimeout(reconnectTimeout);
//         reconnectTimeout = null;
//       }
//       armarWatchdog(ws);
//       set({ conectado: true });
//       emitir({ tipo: 'LOCAL:SOCKET_CONECTADO' });
//     };

//     ws.onmessage = (event) => {
//       if (get().socket !== ws) return;

//       armarWatchdog(ws);

//       try {
//         const data: MensajeWS = JSON.parse(event.data);

//         if (data.tipo === 'PING') {
//           if (ws.readyState === WebSocket.OPEN) {
//             ws.send(JSON.stringify({ tipo: 'PONG' }));
//           }
//           return;
//         }

//         set({ mensajeWS: data });
//         emitir(data);

//         switch (data.tipo) {
//           case 'EVENT:ESTADO_INICIAL':
//             set({
//               votacionActiva: normalizarVotacion(data.payload?.votacionActiva),
//               modoPedirCancion: !!data.payload?.modoPedirCancion,
//               estadoInicialRecibido: true,
//             });
//             break;
//           case 'EVENT:VOTACION_ACTIVA_SYNC': {
//             const v = normalizarVotacion(data.payload);
//             if (v) set({ votacionActiva: v });
//             break;
//           }
//           case 'EVENT:VOTACION_EXPRES_START': {
//             const v = normalizarVotacion(data.payload);
//             if (v) set({ votacionActiva: v });
//             break;
//           }
//           case 'EVENT:VOTACION_ACTUALIZADA': {
//             const actual = get().votacionActiva;
//             if (actual && actual.id === data.payload?.id) {
//               set({ votacionActiva: { ...actual, opciones: data.payload.opciones } });
//             }
//             break;
//           }
//           case 'EVENT:VOTACION_CERRADA': {
//             const actual = get().votacionActiva;
//             if (!actual || actual.id === data.payload?.id) {
//               set({ votacionActiva: null });
//             }
//             break;
//           }
//           case 'EVENT:PEDIR_CANCION_ESTADO':
//             set({ modoPedirCancion: !!(data.payload?.activo ?? data.payload) });
//             break;
//         }

//         if (data.tipo === 'EVENT:JUEGO_PRIVADO_DESBLOQUEADO') {
//           set({ juegoDesbloqueado: data.payload.juegoId });
//         }
//         if (data.tipo === 'EVENT:RULETA_GIRAR' || data.tipo === 'ACTION:GIRAR_RULETA') {
//           set({ animacionRuleta: data.payload });
//         }

//         if (data.tipo === 'EVENT:MESERO_SOLICITADO') {
//           if (data.payload?.mesa === get().mesa) {
//             set({ meseroBloqueado: true });
//           }
//         }
//         if (data.tipo === 'EVENT:MESERO_ATENDIDO' || data.tipo === 'EVENT:MESA_CERRADA') {
//           if (data.payload?.mesa === get().mesa) {
//             set({ meseroBloqueado: false });
//           }
//         }
//       } catch (error) {
//         console.warn('⚠️ Error procesando mensaje:', error);
//       }
//     };

//     ws.onclose = (event) => {
//       if (watchdog) clearTimeout(watchdog);

//       // Un socket viejo no debe pisar al nuevo
//       if (get().socket !== ws) return;

//       log(`❌ [STORE] WebSocket CERRADO | Código: ${event.code} | Razón: ${event.reason || 'Sin razón'}`);
//       set({ socket: null, conectado: false });

//       // 🚨 MODIFICACIÓN CLAVE 1:
//       // Si el servidor cierra la conexión con el código 4002 (Sesión inválida),
//       // significa que la sesión fue borrada de la BD porque la mesa se cerró.
//       if (event.code === 4002) {
//         log('🚪 [STORE] Sesión inválida (Mesa cerrada). Emitiendo evento localmente.');
//         borrarSesion();
        
//         // Emitimos el evento manualmente para que el ModalDespedida salte
//         emitir({
//           tipo: 'EVENT:MESA_CERRADA',
//           payload: {
//             mesa: get().mesa || 1, // Toma la mesa actual o por defecto la 1
//             mensaje: 'Tu sesión ha finalizado. ¡Gracias por visitarnos!',
//           },
//         });
//         return;
//       }

//       if (NO_RECONECTAR.includes(event.code)) {
//         log('⛔ [STORE] Cierre definitivo, no se reintenta');
//         return;
//       }

//       // 🚨 MODIFICACIÓN CLAVE 2:
//       // Si el último mensaje recibido fue el de cierre de mesa,
//       // evitamos la reconexión para que el modal no se pierda.
//       if (get().mensajeWS?.tipo === 'EVENT:MESA_CERRADA') {
//          log('🚪 [STORE] Mesa cerrada detectada, evitando reconexión');
//          borrarSesion();
//          return; 
//       }

//       programarReconexion();
//     };

//     ws.onerror = () => {
//       if (DEBUG && ws.readyState !== WebSocket.CLOSED) {
//         console.warn('⚠️ [STORE] Error en WebSocket (readyState:', ws.readyState, ')');
//       }
//     };
//   },

//   desconectarSocket: () => {
//     limpiarTimers();
//     reconnectAttempts = 0;
//     borrarSesion();

//     const { socket } = get();
//     if (socket) {
//       soltarHandlers(socket);
//       try { socket.close(1000, 'Desconexión manual'); } catch {}
//     }
//     set({
//       socket: null,
//       conectado: false,
//       sessionId: null,
//       mesa: null,
//       rol: null,
//       votacionActiva: null,
//       modoPedirCancion: false,
//       estadoInicialRecibido: false,
//     });
//   },

//   restaurarSesion: () => {
//     if (typeof window === 'undefined') return;
//     if (get().sessionId) return;
//     try {
//       const raw = localStorage.getItem(STORAGE_KEY);
//       if (!raw) return;
//       const { sessionId, mesa, rol } = JSON.parse(raw);
//       if (sessionId) get().conectarSocket(sessionId, mesa ?? null, rol ?? null);
//     } catch {}
//   },

//   enviarMensaje: (tipoOrData, payload = {}) => {
//     const { socket, conectado } = get();

//     if (!socket || !conectado || socket.readyState !== WebSocket.OPEN) {
//       if (DEBUG) console.warn('⚠️ No se pudo enviar mensaje: Socket desconectado');
//       return;
//     }

//     const mensajeAEnviar =
//       typeof tipoOrData === 'string'
//         ? JSON.stringify({ tipo: tipoOrData, payload })
//         : JSON.stringify(tipoOrData);

//     try {
//       socket.send(mensajeAEnviar);
//     } catch (error) {
//       console.error('❌ [STORE] Error enviando mensaje:', error);
//     }
//   },

//   limpiarAnimacionRuleta: () => set({ animacionRuleta: null }),
//   setMeseroBloqueado: (bloqueado) => set({ meseroBloqueado: bloqueado }),

//   sincronizarEstado: () => {
//     get().enviarMensaje('ACTION:SOLICITAR_ESTADO');
//   },
//   limpiarVotacion: () => set({ votacionActiva: null }),
// }));

// // =============================================================
// // RECONEXIÓN AL VOLVER A LA APP (móviles / PWA / otras pestañas)
// // =============================================================
// if (typeof window !== 'undefined' && !(window as any).__wsListenersInstalados) {
//   (window as any).__wsListenersInstalados = true;

//   const verificar = (forzar = false) => {
//     const { socket, conectado, sessionId, mesa, rol, conectarSocket } = useSocketStore.getState();
//     if (!sessionId) return;

//     if (!socket || !conectado || socket.readyState !== WebSocket.OPEN) {
//       log('📱 [PWA] Socket caído, reconectando...');
//       reconnectAttempts = 0;
//       conectarSocket(sessionId, mesa, rol);
//     } else if (forzar) {
//       log('📱 [PWA] Volviste a la app, renovando conexión por seguridad...');
//       forzarReconexion(socket);
//     }
//   };

//   document.addEventListener('visibilitychange', () => {
//     if (document.visibilityState === 'hidden') {
//       ocultoDesde = Date.now();
//     } else {
//       verificar(ocultoDesde > 0 && Date.now() - ocultoDesde > OCULTO_MAX_MS);
//     }
//   });

//   window.addEventListener('pageshow', (e) => verificar((e as PageTransitionEvent).persisted));
//   window.addEventListener('online', () => verificar(true));
// }

// import { create } from 'zustand';

// // =============================================================
// // TIPOS
// // =============================================================
// interface PayloadRuletaGirar {
//   indiceGanador: number;
//   premio: string;
//   vueltas: number;
//   duracionMs: number;
//   ejecutadoPorMesa: number;
//   esPremioMayor?: boolean;
// }

// export interface MensajeWS {
//   tipo: string;
//   payload?: any;
// }

// export interface OpcionVotacion {
//   id: number;
//   texto: string;
//   votos: number;
// }

// export interface VotacionActiva {
//   id: string;
//   pregunta: string;
//   opciones: OpcionVotacion[];
//   /** Momento local (Date.now()) en que termina la votación */
//   finalizaEn: number;
// }

// type ListenerWS = (data: MensajeWS) => void;

// interface SocketState {
//   socket: WebSocket | null;
//   conectado: boolean;
//   sessionId: string | null;
//   mesa: number | null;
//   rol: string | null;

//   juegoDesbloqueado: string | null;
//   animacionRuleta: PayloadRuletaGirar | null;
//   mensajeWS: MensajeWS | null;

//   meseroBloqueado: boolean;

//   // Estado persistente (sobrevive aunque el componente se monte tarde)
//   votacionActiva: VotacionActiva | null;
//   modoPedirCancion: boolean;
//   estadoInicialRecibido: boolean;

//   conectarSocket: (sessionId: string, mesa?: number | null, rol?: string | null) => void;
//   desconectarSocket: () => void;
//   restaurarSesion: () => void;
//   enviarMensaje: (tipoOrData: string | Record<string, any>, payload?: Record<string, any>) => void;
//   limpiarAnimacionRuleta: () => void;

//   setMeseroBloqueado: (bloqueado: boolean) => void;

//   sincronizarEstado: () => void;
//   limpiarVotacion: () => void;
// }

// // =============================================================
// // CONFIGURACIÓN
// // =============================================================
// const DEBUG = process.env.NODE_ENV !== 'production';
// const log = (...args: any[]) => {
//   if (DEBUG) console.log(...args);
// };

// const WATCHDOG_MS = 60_000;
// const OCULTO_MAX_MS = 5_000;
// const NO_RECONECTAR = [4001, 4002];
// const STORAGE_KEY = 'ws_session';

// // =============================================================
// // ESTADO DE MÓDULO (fuera de React/Zustand)
// // =============================================================
// let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
// let watchdog: ReturnType<typeof setTimeout> | null = null;
// let reconnectAttempts = 0;
// let ocultoDesde = 0;

// // 🔥 FIX 1: Flag para que NADA vuelva a reconectar después de cerrar mesa
// // Si esto es true, ni watchdog, ni onclose, ni visibilitychange, ni online reconectan.
// let mesaCerradaPorAdmin = false;

// const listeners = new Map<string, Set<ListenerWS>>();

// export const suscribirMensaje = (tipo: string, cb: ListenerWS) => {
//   if (!listeners.has(tipo)) listeners.set(tipo, new Set());
//   listeners.get(tipo)!.add(cb);
//   return () => {
//     listeners.get(tipo)?.delete(cb);
//   };
// };

// const emitir = (data: MensajeWS) => {
//   listeners.get(data.tipo)?.forEach((cb) => {
//     try {
//       cb(data);
//     } catch (e) {
//       console.warn('⚠ Error en listener WS:', e);
//     }
//   });
//   listeners.get('*')?.forEach((cb) => {
//     try {
//       cb(data);
//     } catch (e) {
//       console.warn('⚠ Error en listener WS (*):', e);
//     }
//   });
// };

// // =============================================================
// // HELPERS
// // =============================================================
// const limpiarTimers = () => {
//   if (reconnectTimeout) {
//     clearTimeout(reconnectTimeout);
//     reconnectTimeout = null;
//   }
//   if (watchdog) {
//     clearTimeout(watchdog);
//     watchdog = null;
//   }
// };

// const soltarHandlers = (ws: WebSocket) => {
//   ws.onopen = null;
//   ws.onerror = null;
//   ws.onmessage = null;
//   ws.onclose = null;
// };

// const normalizarVotacion = (p: any): VotacionActiva | null => {
//   if (!p || !p.id) return null;
//   const segundos = Number(p.duracionRestante ?? p.duracion ?? 0);
//   if (segundos <= 0) return null;
//   return {
//     id: p.id,
//     pregunta: p.pregunta,
//     opciones: Array.isArray(p.opciones) ? p.opciones : [],
//     finalizaEn: Date.now() + segundos * 1000,
//   };
// };

// const armarWatchdog = (ws: WebSocket) => {
//   if (watchdog) clearTimeout(watchdog);
//   watchdog = setTimeout(() => {
//     if (mesaCerradaPorAdmin) return; // 🔥 FIX: si la mesa ya se cerró, no reconectes
//     if (typeof document !== 'undefined' && document.hidden) {
//       armarWatchdog(ws);
//       return;
//     }
//     log('🧟 [STORE] Watchdog: sin mensajes, forzando reconexión');
//     forzarReconexion(ws);
//   }, WATCHDOG_MS);
// };

// const forzarReconexion = (ws: WebSocket) => {
//   if (mesaCerradaPorAdmin) return; // 🔥 FIX
//   const { socket, sessionId, mesa, rol, conectarSocket } = useSocketStore.getState();
//   if (socket !== ws) return;

//   soltarHandlers(ws);
//   try { ws.close(); } catch {}

//   if (watchdog) clearTimeout(watchdog);
//   useSocketStore.setState({ socket: null, conectado: false });

//   if (sessionId) conectarSocket(sessionId, mesa, rol);
// };

// const programarReconexion = () => {
//   if (mesaCerradaPorAdmin) return; // 🔥 FIX
//   const { sessionId } = useSocketStore.getState();
//   if (!sessionId) return;

//   if (typeof navigator !== 'undefined' && navigator.onLine === false) {
//     log('📴 [STORE] Sin red, esperando evento online');
//     return;
//   }

//   const base = Math.min(1000 * Math.pow(1.5, reconnectAttempts), 5000);
//   const delay = base / 2 + Math.random() * (base / 2);
//   log(`🔄 [STORE] Reintentando en ${(delay / 1000).toFixed(1)}s (intento ${reconnectAttempts + 1})`);

//   if (reconnectTimeout) clearTimeout(reconnectTimeout);
//   reconnectTimeout = setTimeout(() => {
//     reconnectAttempts++;
//     const { sessionId, mesa, rol, conectarSocket } = useSocketStore.getState();
//     if (sessionId) conectarSocket(sessionId, mesa, rol);
//   }, delay);
// };

// const guardarSesion = (sessionId: string, mesa: number | null, rol: string | null) => {
//   try {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId, mesa, rol }));
//   } catch {}
// };

// const borrarSesion = () => {
//   try {
//     localStorage.removeItem(STORAGE_KEY);
//   } catch {}
// };

// // =============================================================
// // STORE
// // =============================================================
// export const useSocketStore = create<SocketState>((set, get) => ({
//   socket: null,
//   conectado: false,
//   sessionId: null,
//   mesa: null,
//   rol: null,
//   juegoDesbloqueado: null,
//   animacionRuleta: null,
//   mensajeWS: null,
//   meseroBloqueado: false,
//   votacionActiva: null,
//   modoPedirCancion: false,
//   estadoInicialRecibido: false,

//   conectarSocket: (newSessionId: string, mesa: number | null = null, rol: string | null = null) => {
//     if (!newSessionId || newSessionId === 'undefined' || newSessionId === 'null') {
//       console.warn('⚠ SessionId inválido');
//       return;
//     }

//     // 🔥 FIX: Si la mesa ya fue cerrada, no dejes conectar de nuevo con el mismo sessionId
//     // Se resetea solo cuando el usuario escanea un QR nuevo (con otro sessionId)
//     if (mesaCerradaPorAdmin) {
//       log('⛔ [STORE] Mesa ya cerrada, no reconecto con sesión vieja');
//       return;
//     }

//     const { socket, conectado, sessionId: currentSessionId } = get();

//     if (socket && conectado && socket.readyState === WebSocket.OPEN && currentSessionId === newSessionId) {
//       return;
//     }

//     if (socket && socket.readyState === WebSocket.CONNECTING && currentSessionId === newSessionId) {
//       return;
//     }

//     if (socket) {
//       soltarHandlers(socket);
//       try { socket.close(); } catch {}
//     }

//     limpiarTimers();
//     // Al conectar con un sessionId NUEVO (QR nuevo), reseteamos el flag
//     mesaCerradaPorAdmin = false;

//     const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/^http/, 'ws') || 'ws://localhost:3001';
//     const wsUrl = `${API_URL}/ws?sessionId=${encodeURIComponent(newSessionId)}`;
//     log(`🔌 [STORE] Conectando a: ${wsUrl}`);

//     const ws = new WebSocket(wsUrl);
//     set({ socket: ws, sessionId: newSessionId, mesa, rol, conectado: false });
//     guardarSesion(newSessionId, mesa, rol);

//     ws.onopen = () => {
//       if (get().socket !== ws) return;
//       log(`✅ [STORE] WebSocket CONECTADO | ID: ${newSessionId}`);
//       reconnectAttempts = 0;
//       if (reconnectTimeout) {
//         clearTimeout(reconnectTimeout);
//         reconnectTimeout = null;
//       }
//       armarWatchdog(ws);
//       set({ conectado: true });
//       emitir({ tipo: 'LOCAL:SOCKET_CONECTADO' });
//     };

//     ws.onmessage = (event) => {
//       if (get().socket !== ws) return;

//       armarWatchdog(ws);

//       try {
//         const data: MensajeWS = JSON.parse(event.data);

//         if (data.tipo === 'PING') {
//           if (ws.readyState === WebSocket.OPEN) {
//             ws.send(JSON.stringify({ tipo: 'PONG' }));
//           }
//           return;
//         }

//         set({ mensajeWS: data });
//         emitir(data);

//         // 🔥 FIX 2: AQUÍ ESTABA EL BUG. Antes solo quitabas meseroBloqueado.
//         // Ahora cuando llega EVENT:MESA_CERRADA y es MI mesa, cierras todo y NO reconectas.
//         if (data.tipo === 'EVENT:MESA_CERRADA') {
//           if (data.payload?.mesa === get().mesa) {
//             log('🚪 [STORE] Mi mesa fue cerrada por admin. Mostrando despedida y bloqueando reconexión.');
//             mesaCerradaPorAdmin = true;
//             set({ meseroBloqueado: false });
//             borrarSesion();
//             limpiarTimers();
//             // Cerramos el socket con 4002 para que onclose no reprograme reconexión
//             // El emitir(data) de arriba ya hizo que ModalDespedida salte
//             try { ws.close(4002, 'Mesa cerrada por admin'); } catch {}
//             return;
//           } else {
//             // Si es otra mesa, lo ignoramos. Antes le salía el modal a todos.
//             log(`ℹ️ [STORE] Mesa ${data.payload?.mesa} cerrada, no es la mía (${get().mesa}), la ignoro`);
//             return;
//           }
//         }

//         switch (data.tipo) {
//           case 'EVENT:ESTADO_INICIAL':
//             set({
//               votacionActiva: normalizarVotacion(data.payload?.votacionActiva),
//               modoPedirCancion: !!data.payload?.modoPedirCancion,
//               estadoInicialRecibido: true,
//             });
//             break;
//           case 'EVENT:VOTACION_ACTIVA_SYNC': {
//             const v = normalizarVotacion(data.payload);
//             if (v) set({ votacionActiva: v });
//             break;
//           }
//           case 'EVENT:VOTACION_EXPRES_START': {
//             const v = normalizarVotacion(data.payload);
//             if (v) set({ votacionActiva: v });
//             break;
//           }
//           case 'EVENT:VOTACION_ACTUALIZADA': {
//             const actual = get().votacionActiva;
//             if (actual && actual.id === data.payload?.id) {
//               set({ votacionActiva: { ...actual, opciones: data.payload.opciones } });
//             }
//             break;
//           }
//           case 'EVENT:VOTACION_CERRADA': {
//             const actual = get().votacionActiva;
//             if (!actual || actual.id === data.payload?.id) {
//               set({ votacionActiva: null });
//             }
//             break;
//           }
//           case 'EVENT:PEDIR_CANCION_ESTADO':
//             set({ modoPedirCancion: !!(data.payload?.activo ?? data.payload) });
//             break;
//         }

//         if (data.tipo === 'EVENT:JUEGO_PRIVADO_DESBLOQUEADO') {
//           set({ juegoDesbloqueado: data.payload.juegoId });
//         }
//         if (data.tipo === 'EVENT:RULETA_GIRAR' || data.tipo === 'ACTION:GIRAR_RULETA') {
//           set({ animacionRuleta: data.payload });
//         }

//         if (data.tipo === 'EVENT:MESERO_SOLICITADO') {
//           if (data.payload?.mesa === get().mesa) {
//             set({ meseroBloqueado: true });
//           }
//         }
//         if (data.tipo === 'EVENT:MESERO_ATENDIDO') {
//           if (data.payload?.mesa === get().mesa) {
//             set({ meseroBloqueado: false });
//           }
//         }
//       } catch (error) {
//         console.warn('⚠ Error procesando mensaje:', error);
//       }
//     };

//     ws.onclose = (event) => {
//       if (watchdog) clearTimeout(watchdog);

//       // Un socket viejo no debe pisar al nuevo
//       if (get().socket !== ws) return;

//       log(`❌ [STORE] WebSocket CERRADO | Código: ${event.code} | Razón: ${event.reason || 'Sin razón'}`);
//       set({ socket: null, conectado: false });

//       // 🔥 FIX 3: Si fue cierre por admin, no reconectes nunca
//       if (mesaCerradaPorAdmin || event.code === 4002) {
//         log('🚪 [STORE] Sesión inválida (Mesa cerrada). Emitiendo evento localmente y NO reconectando.');
//         mesaCerradaPorAdmin = true;
//         borrarSesion();
//         limpiarTimers();
//         // Solo emite de nuevo si no fue por el onmessage (para que no salga 2 veces el modal)
//         // Si ya vino por onmessage, el modal ya salió. Si vino directo por close, lo emitimos aquí.
//         if (event.reason !== 'Mesa cerrada por admin') {
//           emitir({
//             tipo: 'EVENT:MESA_CERRADA',
//             payload: {
//               mesa: get().mesa || 1,
//               mensaje: 'Tu sesión ha finalizado. ¡Gracias por visitarnos!',
//             },
//           });
//         }
//         return;
//       }

//       if (NO_RECONECTAR.includes(event.code)) {
//         log('⛔ [STORE] Cierre definitivo, no se reintenta');
//         return;
//       }

//       // Este chequeo ya no es necesario porque mesaCerradaPorAdmin lo cubre, pero lo dejamos por seguridad
//       if (get().mensajeWS?.tipo === 'EVENT:MESA_CERRADA') {
//          log('🚪 [STORE] Mesa cerrada detectada, evitando reconexión');
//          borrarSesion();
//          return;
//       }

//       programarReconexion();
//     };

//     ws.onerror = () => {
//       if (DEBUG && ws.readyState !== WebSocket.CLOSED) {
//         console.warn('⚠ [STORE] Error en WebSocket (readyState:', ws.readyState, ')');
//       }
//     };
//   },

//   desconectarSocket: () => {
//     limpiarTimers();
//     reconnectAttempts = 0;
//     mesaCerradaPorAdmin = false; // Al desconectar manual, reseteamos para el próximo QR
//     borrarSesion();

//     const { socket } = get();
//     if (socket) {
//       soltarHandlers(socket);
//       try { socket.close(1000, 'Desconexión manual'); } catch {}
//     }
//     set({
//       socket: null,
//       conectado: false,
//       sessionId: null,
//       mesa: null,
//       rol: null,
//       votacionActiva: null,
//       modoPedirCancion: false,
//       estadoInicialRecibido: false,
//     });
//   },

//   restaurarSesion: () => {
//     if (typeof window === 'undefined') return;
//     if (get().sessionId) return;
//     // 🔥 FIX: Si la mesa fue cerrada, no restaures la sesión vieja del localStorage
//     if (mesaCerradaPorAdmin) return;
//     try {
//       const raw = localStorage.getItem(STORAGE_KEY);
//       if (!raw) return;
//       const { sessionId, mesa, rol } = JSON.parse(raw);
//       if (sessionId) get().conectarSocket(sessionId, mesa ?? null, rol ?? null);
//     } catch {}
//   },

//   enviarMensaje: (tipoOrData, payload = {}) => {
//     const { socket, conectado } = get();

//     if (!socket || !conectado || socket.readyState !== WebSocket.OPEN) {
//       if (DEBUG) console.warn('⚠ No se pudo enviar mensaje: Socket desconectado');
//       return;
//     }

//     const mensajeAEnviar =
//       typeof tipoOrData === 'string'
//         ? JSON.stringify({ tipo: tipoOrData, payload })
//         : JSON.stringify(tipoOrData);

//     try {
//       socket.send(mensajeAEnviar);
//     } catch (error) {
//       console.error('❌ [STORE] Error enviando mensaje:', error);
//     }
//   },

//   limpiarAnimacionRuleta: () => set({ animacionRuleta: null }),
//   setMeseroBloqueado: (bloqueado) => set({ meseroBloqueado: bloqueado }),

//   sincronizarEstado: () => {
//     get().enviarMensaje('ACTION:SOLICITAR_ESTADO');
//   },
//   limpiarVotacion: () => set({ votacionActiva: null }),
// }));

// // =============================================================
// // RECONEXIÓN AL VOLVER A LA APP (móviles / PWA / otras pestañas)
// // =============================================================
// if (typeof window !== 'undefined' && !(window as any).__wsListenersInstalados) {
//   (window as any).__wsListenersInstalados = true;

//   const verificar = (forzar = false) => {
//     // 🔥 FIX: Si la mesa fue cerrada, no verifiques ni reconectes al volver a la app
//     if (mesaCerradaPorAdmin) return;
//     const { socket, conectado, sessionId, mesa, rol, conectarSocket } = useSocketStore.getState();
//     if (!sessionId) return;

//     if (!socket || !conectado || socket.readyState !== WebSocket.OPEN) {
//       log('📱 [PWA] Socket caído, reconectando...');
//       reconnectAttempts = 0;
//       conectarSocket(sessionId, mesa, rol);
//     } else if (forzar) {
//       log('📱 [PWA] Volviste a la app, renovando conexión por seguridad...');
//       forzarReconexion(socket);
//     }
//   };

//   document.addEventListener('visibilitychange', () => {
//     if (document.visibilityState === 'hidden') {
//       ocultoDesde = Date.now();
//     } else {
//       verificar(ocultoDesde > 0 && Date.now() - ocultoDesde > OCULTO_MAX_MS);
//     }
//   });

//   window.addEventListener('pageshow', (e) => verificar((e as PageTransitionEvent).persisted));
//   window.addEventListener('online', () => verificar(true));
// }




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
// CONFIGURACIÓN + LOGS DE FLUJO
// =============================================================
const DEBUG = true; // 🔥 FORZADO A TRUE para que veas el flujo aunque sea production
const log = (...args: any[]) => {
  console.log('[FLUJO]', ...args);
};

const WATCHDOG_MS = 60_000;
const OCULTO_MAX_MS = 5_000;
const NO_RECONECTAR = [4001, 4002];
const STORAGE_KEY = 'ws_session';

let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let watchdog: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
let ocultoDesde = 0;
let mesaCerradaPorAdmin = false;

const listeners = new Map<string, Set<ListenerWS>>();

export const suscribirMensaje = (tipo: string, cb: ListenerWS) => {
  log(`🔌 [SUSCRIBIR] Alguien se suscribió a ${tipo}`);
  if (!listeners.has(tipo)) listeners.set(tipo, new Set());
  listeners.get(tipo)!.add(cb);
  return () => {
    listeners.get(tipo)?.delete(cb);
  };
};

const emitir = (data: MensajeWS) => {
  log(`📤 [EMITIR] Voy a emitir ${data.tipo} mesa=${data.payload?.mesa} - listeners: ${listeners.get(data.tipo)?.size ?? 0}`);
  listeners.get(data.tipo)?.forEach((cb) => {
    try { cb(data); } catch (e) { console.warn('⚠ Error en listener WS:', e); }
  });
  listeners.get('*')?.forEach((cb) => {
    try { cb(data); } catch (e) { console.warn('⚠ Error en listener WS (*):', e); }
  });
};

// =============================================================
// HELPERS
// =============================================================
const limpiarTimers = () => {
  if (reconnectTimeout) { clearTimeout(reconnectTimeout); reconnectTimeout = null; }
  if (watchdog) { clearTimeout(watchdog); watchdog = null; }
};

const soltarHandlers = (ws: WebSocket) => {
  ws.onopen = null; ws.onerror = null; ws.onmessage = null; ws.onclose = null;
};

const normalizarVotacion = (p: any): VotacionActiva | null => {
  if (!p || !p.id) return null;
  const segundos = Number(p.duracionRestante ?? p.duracion ?? 0);
  if (segundos <= 0) return null;
  return { id: p.id, pregunta: p.pregunta, opciones: Array.isArray(p.opciones) ? p.opciones : [], finalizaEn: Date.now() + segundos * 1000 };
};

const armarWatchdog = (ws: WebSocket) => {
  if (watchdog) clearTimeout(watchdog);
  watchdog = setTimeout(() => {
    if (mesaCerradaPorAdmin) return;
    if (typeof document !== 'undefined' && document.hidden) { armarWatchdog(ws); return; }
    log('🧟 [WATCHDOG] Sin mensajes en 60s, forzando reconexión');
    forzarReconexion(ws);
  }, WATCHDOG_MS);
};

const forzarReconexion = (ws: WebSocket) => {
  if (mesaCerradaPorAdmin) return;
  const { socket, sessionId, mesa, rol, conectarSocket } = useSocketStore.getState();
  if (socket !== ws) return;
  soltarHandlers(ws);
  try { ws.close(); } catch {}
  if (watchdog) clearTimeout(watchdog);
  useSocketStore.setState({ socket: null, conectado: false });
  if (sessionId) conectarSocket(sessionId, mesa, rol);
};

const programarReconexion = () => {
  if (mesaCerradaPorAdmin) return;
  const { sessionId } = useSocketStore.getState();
  if (!sessionId) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    log('📴 [RECONEXIÓN] Sin red, esperando online');
    return;
  }
  const base = Math.min(1000 * Math.pow(1.5, reconnectAttempts), 5000);
  const delay = base / 2 + Math.random() * (base / 2);
  log(`🔄 [RECONEXIÓN] Reintentando en ${(delay / 1000).toFixed(1)}s intento ${reconnectAttempts + 1}`);
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  reconnectTimeout = setTimeout(() => {
    reconnectAttempts++;
    const { sessionId, mesa, rol, conectarSocket } = useSocketStore.getState();
    if (sessionId) conectarSocket(sessionId, mesa, rol);
  }, delay);
};

const guardarSesion = (sessionId: string, mesa: number | null, rol: string | null) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId, mesa, rol })); } catch {}
};

const borrarSesion = () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
};

// 🔥 FIX URL: Si NEXT_PUBLIC_API_URL ya termina en /api, no le agregamos otro /api
const getBaseHttp = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return raw.replace(/\/$/, '').replace(/\/api$/, '');
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
    log(`🔌 [CONECTAR] Me pidieron conectar session=${newSessionId?.slice(0,8)}... mesa=${mesa} rol=${rol}`);

    if (mesa === null && typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/mesa\/(\d+)/);
      if (match) {
        mesa = Number(match[1]);
        log(`📍 [CONECTAR] Mesa inferida de URL: ${mesa}`);
      } else {
        log(`⚠️ [CONECTAR] No me pasaron mesa y no la encontré en URL: ${window.location.pathname}`);
      }
    }

    if (!newSessionId || newSessionId === 'undefined' || newSessionId === 'null') {
      console.warn('⚠ SessionId inválido');
      return;
    }

    if (mesaCerradaPorAdmin) {
      log('⛔ [CONECTAR] Mesa ya cerrada, NO reconecto con sesión vieja');
      return;
    }

    const { socket, conectado, sessionId: currentSessionId } = get();

    if (socket && conectado && socket.readyState === WebSocket.OPEN && currentSessionId === newSessionId) {
      log('✅ [CONECTAR] Ya estoy conectado con ese sessionId, no hago nada');
      return;
    }

    if (socket && socket.readyState === WebSocket.CONNECTING && currentSessionId === newSessionId) {
      log('⏳ [CONECTAR] Ya me estoy conectando, espero');
      return;
    }

    if (socket) {
      soltarHandlers(socket);
      try { socket.close(); } catch {}
    }

    limpiarTimers();
    mesaCerradaPorAdmin = false;

    const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/^http/, 'ws') || 'ws://localhost:3001';
    const wsUrl = `${API_URL}/ws?sessionId=${encodeURIComponent(newSessionId)}`;
    log(`🔌 [CONECTAR] Abriendo WebSocket a: ${wsUrl} | mi mesa guardada: ${mesa}`);

    const ws = new WebSocket(wsUrl);
    set({ socket: ws, sessionId: newSessionId, mesa, rol, conectado: false });
    guardarSesion(newSessionId, mesa, rol);

    ws.onopen = () => {
      if (get().socket !== ws) return;
      log(`✅ [SOCKET] CONECTADO | ID: ${newSessionId} | mesa: ${get().mesa}`);
      reconnectAttempts = 0;
      if (reconnectTimeout) { clearTimeout(reconnectTimeout); reconnectTimeout = null; }
      armarWatchdog(ws);
      set({ conectado: true });
      emitir({ tipo: 'LOCAL:SOCKET_CONECTADO' });
    };

    ws.onmessage = (event) => {
      if (get().socket !== ws) return;
      armarWatchdog(ws);
      try {
        const data: MensajeWS = JSON.parse(event.data);
        log(`📩 [SOCKET] Me llegó: ${data.tipo} | payload.mesa=${data.payload?.mesa} | mi mesa=${get().mesa}`);

        if (data.tipo === 'PING') {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ tipo: 'PONG' }));
          return;
        }

        if (data.tipo === 'EVENT:MESA_CERRADA') {
          const miMesa = get().mesa;
          log(`🚪 [SOCKET] EVENT:MESA_CERRADA llegó, mi mesa es ${miMesa}, la cerrada es ${data.payload?.mesa}`);
          if (miMesa !== null && miMesa !== undefined && data.payload?.mesa !== miMesa) {
            log(`ℹ️ [SOCKET] No es mi mesa, la ignoro`);
            return;
          }
          log(`🚪 [SOCKET] SÍ es mi mesa, voy a mostrar modal y cerrar todo`);
        }

        set({ mensajeWS: data });
        emitir(data);

        if (data.tipo === 'EVENT:MESA_CERRADA') {
          mesaCerradaPorAdmin = true;
          set({ meseroBloqueado: false });
          borrarSesion();
          limpiarTimers();
          try { ws.close(4002, 'Mesa cerrada por admin'); } catch {}
          return;
        }

        switch (data.tipo) {
          case 'EVENT:ESTADO_INICIAL':
            set({ votacionActiva: normalizarVotacion(data.payload?.votacionActiva), modoPedirCancion: !!data.payload?.modoPedirCancion, estadoInicialRecibido: true });
            break;
          case 'EVENT:VOTACION_ACTIVA_SYNC': {
            const v = normalizarVotacion(data.payload);
            if (v) set({ votacionActiva: v });
            break;
          }
          case 'EVENT:VOTACION_EXPRES_START': {
            const v = normalizarVotacion(data.payload);
            if (v) set({ votacionActiva: v });
            break;
          }
          case 'EVENT:VOTACION_ACTUALIZADA': {
            const actual = get().votacionActiva;
            if (actual && actual.id === data.payload?.id) set({ votacionActiva: { ...actual, opciones: data.payload.opciones } });
            break;
          }
          case 'EVENT:VOTACION_CERRADA': {
            const actual = get().votacionActiva;
            if (!actual || actual.id === data.payload?.id) set({ votacionActiva: null });
            break;
          }
          case 'EVENT:PEDIR_CANCION_ESTADO':
            set({ modoPedirCancion: !!(data.payload?.activo ?? data.payload) });
            break;
        }

        if (data.tipo === 'EVENT:JUEGO_PRIVADO_DESBLOQUEADO') set({ juegoDesbloqueado: data.payload.juegoId });
        if (data.tipo === 'EVENT:RULETA_GIRAR' || data.tipo === 'ACTION:GIRAR_RULETA') set({ animacionRuleta: data.payload });
        if (data.tipo === 'EVENT:MESERO_SOLICITADO') {
          if (data.payload?.mesa === get().mesa) set({ meseroBloqueado: true });
        }
        if (data.tipo === 'EVENT:MESERO_ATENDIDO') {
          if (data.payload?.mesa === get().mesa) set({ meseroBloqueado: false });
        }
      } catch (error) {
        console.warn('⚠ Error procesando mensaje:', error);
      }
    };

    ws.onclose = (event) => {
      if (watchdog) clearTimeout(watchdog);
      if (get().socket !== ws) return;
      log(`❌ [SOCKET] CERRADO | Código: ${event.code} | Razón: ${event.reason || 'Sin razón'} | mesaCerradaPorAdmin=${mesaCerradaPorAdmin}`);
      set({ socket: null, conectado: false });

      if (mesaCerradaPorAdmin || event.code === 4002) {
        log('🚪 [SOCKET] Cierre por admin, NO reconecto, emito modal si falta');
        mesaCerradaPorAdmin = true;
        borrarSesion();
        limpiarTimers();
        if (event.reason !== 'Mesa cerrada por admin') {
          emitir({ tipo: 'EVENT:MESA_CERRADA', payload: { mesa: get().mesa || 1, mensaje: 'Tu sesión ha finalizado. ¡Gracias por visitarnos!' } });
        }
        return;
      }

      if (NO_RECONECTAR.includes(event.code)) {
        log('⛔ [SOCKET] Cierre definitivo, no reintento');
        return;
      }

      if (get().mensajeWS?.tipo === 'EVENT:MESA_CERRADA') {
         log('🚪 [SOCKET] Mesa cerrada detectada, evitando reconexión');
         borrarSesion();
         return;
      }

      programarReconexion();
    };

    ws.onerror = () => {
      console.warn('⚠ [SOCKET] Error en WebSocket readyState:', ws.readyState);
    };
  },

  desconectarSocket: () => {
    log('🧹 [DESCONECTAR] Desconexión manual');
    limpiarTimers();
    reconnectAttempts = 0;
    mesaCerradaPorAdmin = false;
    borrarSesion();
    const { socket } = get();
    if (socket) {
      soltarHandlers(socket);
      try { socket.close(1000, 'Desconexión manual'); } catch {}
    }
    set({ socket: null, conectado: false, sessionId: null, mesa: null, rol: null, votacionActiva: null, modoPedirCancion: false, estadoInicialRecibido: false });
  },

  restaurarSesion: () => {
    if (typeof window === 'undefined') return;
    if (get().sessionId) return;
    if (mesaCerradaPorAdmin) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) { log('📦 [RESTAURAR] No hay sesión en localStorage'); return; }
      const { sessionId, mesa, rol } = JSON.parse(raw);
      log(`📦 [RESTAURAR] Encontré sesión ${sessionId?.slice(0,8)}... mesa=${mesa}`);
      if (sessionId) get().conectarSocket(sessionId, mesa ?? null, rol ?? null);
    } catch {}
  },

  enviarMensaje: (tipoOrData, payload = {}) => {
    const { socket, conectado } = get();
    if (!socket || !conectado || socket.readyState !== WebSocket.OPEN) {
      console.warn('⚠ No se pudo enviar mensaje: Socket desconectado');
      return;
    }
    const mensajeAEnviar = typeof tipoOrData === 'string' ? JSON.stringify({ tipo: tipoOrData, payload }) : JSON.stringify(tipoOrData);
    try { socket.send(mensajeAEnviar); } catch (error) { console.error('❌ [STORE] Error enviando mensaje:', error); }
  },

  limpiarAnimacionRuleta: () => set({ animacionRuleta: null }),
  setMeseroBloqueado: (bloqueado) => set({ meseroBloqueado: bloqueado }),
  sincronizarEstado: () => { get().enviarMensaje('ACTION:SOLICITAR_ESTADO'); },
  limpiarVotacion: () => set({ votacionActiva: null }),
}));

// =============================================================
// RECONEXIÓN AL VOLVER A LA APP (móviles / PWA / WhatsApp)
// =============================================================
if (typeof window !== 'undefined' && !(window as any).__wsListenersInstalados) {
  (window as any).__wsListenersInstalados = true;

  const verificarEstadoPorHTTP = async (): Promise<boolean> => {
    const { sessionId, mesa, socket } = useSocketStore.getState();
    if (!sessionId || !mesa) {
      log(`🔍 [HTTP] No puedo preguntar estado, session=${sessionId?.slice(0,8)} mesa=${mesa} - asumo vivo`);
      return true;
    }

    const base = getBaseHttp();
    const url = `${base}/api/auth/sesion/estado?mesa=${mesa}&sessionId=${encodeURIComponent(sessionId)}`;
    log(`🔍 [HTTP] Preguntando si sigo vivo a: ${url}`);

    try {
      const res = await fetch(url);
      log(`🔍 [HTTP] Respuesta: status=${res.status} ok=${res.ok}`);
      if (!res.ok) {
        // 🔥 FIX FOTO 1: Si da 404, es que el backend NO tiene el endpoint desplegado todavía
        // No asumimos que seguimos vivos, lo dejamos en log bien visible
        console.error(`❌ [HTTP] El backend respondió ${res.status} en /sesion/estado. ¿Hiciste push + redeploy en Railway? URL: ${url}`);
        return true; // No bloqueamos, dejamos que el socket intente
      }
      const data = await res.json();
      log(`🔍 [HTTP] Backend dice: estado=${data.estado} mesa=${data.mesa}`);

      if (data.estado === 'CERRADA') {
        log('🚪 [HTTP] Backend confirmó CERRADA, muestro modal YA');
        mesaCerradaPorAdmin = true;
        borrarSesion();
        limpiarTimers();
        if (socket) {
          soltarHandlers(socket);
          try { socket.close(4002, 'Mesa cerrada por admin'); } catch {}
        }
        useSocketStore.setState({ socket: null, conectado: false });
        emitir({ tipo: 'EVENT:MESA_CERRADA', payload: { mesa, mensaje: data.mensaje || 'Tu sesión ha finalizado. ¡Gracias por visitarnos!' } });
        return false;
      }
      log(`✅ [HTTP] Sigo vivo (${data.estado}), puedo reconectar por socket`);
      return true;
    } catch (e) {
      console.error('❌ [HTTP] Error de red preguntando estado:', e);
      return true;
    }
  };

  const verificar = async (forzar = false) => {
    log(`👀 [VERIFICAR] Volviste a la app, forzar=${forzar} hidden=${document.hidden}`);
    if (mesaCerradaPorAdmin) {
      log('⛔ [VERIFICAR] Mesa ya cerrada, no verifico nada');
      return;
    }
    const { socket, conectado, sessionId, mesa, rol, conectarSocket } = useSocketStore.getState();
    if (!sessionId) {
      log('⚠️ [VERIFICAR] No tengo sessionId, no hago nada');
      return;
    }

    const sigoVivo = await verificarEstadoPorHTTP();
    if (!sigoVivo) return;

    if (!socket || !conectado || socket.readyState !== WebSocket.OPEN) {
      log('📱 [VERIFICAR] Socket caído, reconectando...');
      reconnectAttempts = 0;
      conectarSocket(sessionId, mesa, rol);
    } else if (forzar) {
      log('📱 [VERIFICAR] Socket vivo pero forzado, renovando...');
      forzarReconexion(socket);
    } else {
      log('✅ [VERIFICAR] Socket vivo, no toco nada');
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      log('👻 [VISIBILITY] Me fui a otra app / pestaña');
      ocultoDesde = Date.now();
    } else {
      log('👀 [VISIBILITY] Volví a la app');
      verificar(ocultoDesde > 0 && Date.now() - ocultoDesde > OCULTO_MAX_MS);
    }
  });

  window.addEventListener('pageshow', (e) => {
    log('🔄 [PAGESHOW] pageshow persisted=', (e as PageTransitionEvent).persisted);
    verificar((e as PageTransitionEvent).persisted);
  });
  window.addEventListener('online', () => {
    log('🌐 [ONLINE] Volvió internet');
    verificar(true);
  });
}