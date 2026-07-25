'use client';

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { EstadoJuego, ESTADO_INICIAL } from '@/lib/types/juegos';

interface PanelControlContextValue {
  estado: EstadoJuego;
  activarJuego: (parcial: Partial<EstadoJuego>) => void;
  desactivarJuego: () => void;
}

const PanelControlContext = createContext<PanelControlContextValue>({
  estado: ESTADO_INICIAL,
  activarJuego: () => {},
  desactivarJuego: () => {},
});

const CANAL_NOMBRE = 'las_vegas_control_juegos';

export function PanelControlProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoJuego>(ESTADO_INICIAL);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Instanciamos el canal una sola vez
    const channel = new BroadcastChannel(CANAL_NOMBRE);
    channelRef.current = channel;

    channel.onmessage = (event) => {
      if (event.data) {
        setEstado(event.data);
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  function emitirNuevoEstado(nuevoEstado: EstadoJuego) {
    setEstado(nuevoEstado);
    // Transmitimos a las demás pestañas usando la referencia activa
    channelRef.current?.postMessage(nuevoEstado);
  }

  function activarJuego(parcial: Partial<EstadoJuego>) {
    const nuevoEstado: EstadoJuego = {
      ...ESTADO_INICIAL,
      activo: true,
      ...parcial,
    };
    emitirNuevoEstado(nuevoEstado);
  }

  function desactivarJuego() {
    emitirNuevoEstado(ESTADO_INICIAL);
  }

  return (
    <PanelControlContext.Provider value={{ estado, activarJuego, desactivarJuego }}>
      {children}
    </PanelControlContext.Provider>
  );
}

export function useSimulacionJuego() {
  return useContext(PanelControlContext);
}