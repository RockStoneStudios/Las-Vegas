'use client';

import { useState } from 'react';
import { EstadoJuego, ESTADO_INICIAL } from '../types/juegos';

export function useSimulacionJuego() {
  const [estado, setEstado] = useState<EstadoJuego>(ESTADO_INICIAL);

  function activarJuego(parcial: Partial<EstadoJuego>) {
    setEstado({ ...ESTADO_INICIAL, ...parcial });
  }

  function desactivarJuego() {
    setEstado(ESTADO_INICIAL);
  }

  return { estado, activarJuego, desactivarJuego };
}