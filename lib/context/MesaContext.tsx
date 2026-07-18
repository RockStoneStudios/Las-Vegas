'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface MesaContextValue {
  numeroMesa: number | null;
  setNumeroMesa: (n: number) => void;
}

const MesaContext = createContext<MesaContextValue>({ numeroMesa: null, setNumeroMesa: () => {} });

export function MesaProvider({ children }: { children: ReactNode }) {
  const [numeroMesa, setNumeroMesaState] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mesaUrl = params.get('mesa');

    if (mesaUrl) {
      const n = Number(mesaUrl);
      setNumeroMesaState(n);
      localStorage.setItem('numeroMesa', String(n));
      return;
    }

    // Si no viene en la URL (ej. navegando entre páginas), recuperamos la última guardada
    const guardada = localStorage.getItem('numeroMesa');
    if (guardada) setNumeroMesaState(Number(guardada));
  }, []);

  function setNumeroMesa(n: number) {
    setNumeroMesaState(n);
    localStorage.setItem('numeroMesa', String(n));
  }

  return <MesaContext.Provider value={{ numeroMesa, setNumeroMesa }}>{children}</MesaContext.Provider>;
}

export function useMesa() {
  return useContext(MesaContext);
}