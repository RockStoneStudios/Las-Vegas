import { create } from 'zustand';

interface PayloadRuletaGirar {
  indiceGanador: number;
  premio: string;
  vueltas: number;
  duracionMs: number;
  ejecutadoPorMesa: number;
  esPremioMayor?: boolean;
}

interface SocketState {
  socket: WebSocket | null;
  conectado: boolean;
  sessionId: string | null;
  mesa: number | null;
  rol: string | null;
  
  juegoDesbloqueado: string | null;
  animacionRuleta: PayloadRuletaGirar | null;
  mensajeWS: { tipo: string; payload?: any } | null;

  conectarSocket: (sessionId: string, mesa?: number | null, rol?: string | null) => void;
  desconectarSocket: () => void;
  enviarMensaje: (tipoOrData: string | Record<string, any>, payload?: Record<string, any>) => void;
  limpiarAnimacionRuleta: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  conectado: false,
  sessionId: null,
  mesa: null,
  rol: null,
  juegoDesbloqueado: null,
  animacionRuleta: null,
  mensajeWS: null,

  conectarSocket: (newSessionId: string, mesa: number | null = null, rol: string | null = null) => {
    console.log(`🔌 [STORE] conectarSocket:`, { newSessionId, mesa, rol });

    if (!newSessionId || newSessionId === 'undefined' || newSessionId === 'null') {
      console.warn('⚠️ SessionId inválido');
      return;
    }

    const { socket, conectado, sessionId: currentSessionId } = get();

    if (socket && conectado && socket.readyState === WebSocket.OPEN && currentSessionId === newSessionId) {
      console.log('🟢 [STORE] Ya conectado con este sessionId, ignorando...');
      return;
    }

    if (socket && socket.readyState === WebSocket.CONNECTING && currentSessionId === newSessionId) {
      console.log('🔄 [STORE] Ya está conectando, ignorando...');
      return;
    }

    if (socket && currentSessionId !== newSessionId) {
      try {
        socket.onopen = null;
        socket.onerror = null;
        socket.onmessage = null;
        socket.onclose = null;
        socket.close(1000, 'Cambiando de sesión');
        console.log('🔌 [STORE] Cerrando socket anterior (cambio de sesión)');
      } catch (e) {
        console.warn('⚠️ Error cerrando socket:', e);
      }
    }

    const wsUrl = `ws://localhost:3001/ws?sessionId=${newSessionId}`;
    console.log(`🔌 [STORE] Conectando a: ${wsUrl}`);

    const ws = new WebSocket(wsUrl);
    set({ socket: ws, sessionId: newSessionId, mesa, rol, conectado: false });

    ws.onopen = () => {
      console.log(`✅ [STORE] WebSocket CONECTADO | ID: ${newSessionId}`);
      set({ conectado: true });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📩 [STORE] Mensaje recibido:', data.tipo);
        set({ mensajeWS: data });

        if (data.tipo === 'EVENT:JUEGO_PRIVADO_DESBLOQUEADO') {
          set({ juegoDesbloqueado: data.payload.juegoId });
        }
        if (data.tipo === 'EVENT:RULETA_GIRAR' || data.tipo === 'ACTION:GIRAR_RULETA') {
          set({ animacionRuleta: data.payload });
        }
      } catch (error) {
        console.warn('⚠️ Error procesando mensaje:', error);
      }
    };

    ws.onclose = (event) => {
      console.log(`❌ [STORE] WebSocket CERRADO | Código: ${event.code} | Razón: ${event.reason || 'Sin razón'}`);
      
      if (event.code === 1006) {
        const sessionIdActual = get().sessionId;
        const mesaActual = get().mesa;
        const rolActual = get().rol;
        
        if (sessionIdActual) {
          console.log(`🔄 [STORE] Reintentando en 2 segundos...`);
          setTimeout(() => {
            const state = get();
            if (!state.conectado && state.sessionId) {
              state.conectarSocket(sessionIdActual, mesaActual, rolActual);
            }
          }, 2000);
        }
      }
      
      set({ socket: null, conectado: false });
    };

    ws.onerror = (error) => {
      // 🔥 SOLO MOSTRAMOS WARNING SI EL ESTADO NO ES CLOSED (3)
      if (ws.readyState !== 3) {
        console.warn('⚠️ [STORE] Error en WebSocket (readyState:', ws.readyState, ')');
      }
    };
  },

  desconectarSocket: () => {
    const { socket } = get();
    if (socket && socket.readyState !== WebSocket.CLOSED) {
      try {
        socket.onopen = null;
        socket.onerror = null;
        socket.onmessage = null;
        socket.onclose = null;
        socket.close(1000, 'Desconexión manual');
      } catch (e) {}
      set({ socket: null, conectado: false, sessionId: null, mesa: null, rol: null });
    }
  },

  enviarMensaje: (tipoOrData, payload = {}) => {
    const { socket, conectado } = get();

    if (!socket || !conectado || socket.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ No se pudo enviar mensaje: Socket desconectado (estado:', socket?.readyState, ')');
      return;
    }

    let mensajeAEnviar: string;
    if (typeof tipoOrData === 'string') {
      mensajeAEnviar = JSON.stringify({ tipo: tipoOrData, payload });
    } else {
      mensajeAEnviar = JSON.stringify(tipoOrData);
    }

    try {
      socket.send(mensajeAEnviar);
      console.log(`📤 [STORE] Mensaje enviado:`, mensajeAEnviar.substring(0, 100));
    } catch (error) {
      console.error('❌ [STORE] Error enviando mensaje:', error);
    }
  },

  limpiarAnimacionRuleta: () => set({ animacionRuleta: null }),
}));