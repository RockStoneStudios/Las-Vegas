'use client';

import { useCallback, useState } from 'react';
import { PREMIOS_BASE, type CartaRuleta, type Premio } from '@/lib/types/cajones';

function barajar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function generarCartas(): CartaRuleta[] {
  const premiosBarajados: Premio[] = barajar(PREMIOS_BASE).map((p) => ({
    ...p,
    id: crypto.randomUUID(),
  }));

  return premiosBarajados.map((premio, index) => ({
    index,
    premio,
    revelada: false,
  }));
}

export function useRuletaSimulada() {
  const [cartas, setCartas] = useState<CartaRuleta[]>(() => generarCartas());
  const [activa, setActiva] = useState(true);

  const revelarCarta = useCallback(
    (index: number) => {
      if (!activa) return;

      setCartas((prev) =>
        prev.map((c) => (c.index === index && !c.revelada ? { ...c, revelada: true } : c))
      );
    },
    [activa]
  );

  const reiniciarRuleta = useCallback(() => {
    setCartas(generarCartas());
    setActiva(true);
  }, []);

  const todasReveladas = cartas.every((c) => c.revelada);

  return { cartas, activa, todasReveladas, revelarCarta, reiniciarRuleta };
}