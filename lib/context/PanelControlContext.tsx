'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
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

export function PanelControlProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoJuego>(ESTADO_INICIAL);

  function activarJuego(parcial: Partial<EstadoJuego>) {
    setEstado({ ...ESTADO_INICIAL, ...parcial });
  }

  function desactivarJuego() {
    setEstado(ESTADO_INICIAL);
  }

  return (
    <PanelControlContext.Provider value={{ estado, activarJuego, desactivarJuego }}>
      {children}
    </PanelControlContext.Provider>
  );
}

// Mismo nombre que usabas antes, para no tocar imports en los componentes
// que ya consumen `estado`, `activarJuego`, `desactivarJuego`.
export function useSimulacionJuego() {
  return useContext(PanelControlContext);
}