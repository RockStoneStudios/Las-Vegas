'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SEGMENTOS_BASE, type SegmentoRuleta } from '@/lib/types/ruleta';

const TOTAL_SEGMENTOS = SEGMENTOS_BASE.length; // 5
const GRADOS_POR_SEGMENTO = 360 / TOTAL_SEGMENTOS; // 72°
const VUELTAS_MINIMAS = 5;

function barajar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Orden fijo y determinista, igual en servidor y en cliente (sin Math.random ni crypto.randomUUID)
function segmentosIniciales(): SegmentoRuleta[] {
  return SEGMENTOS_BASE.map((s, i) => ({ ...s, id: `segmento-inicial-${i}` }));
}

function generarSegmentosAleatorios(): SegmentoRuleta[] {
  return barajar(SEGMENTOS_BASE).map((s, i) => ({ ...s, id: `segmento-${Date.now()}-${i}` }));
}

export function useRuletaSimulada() {
  const [segmentos, setSegmentos] = useState<SegmentoRuleta[]>(segmentosIniciales);
  const [rotacion, setRotacion] = useState(0);
  const [girando, setGirando] = useState(false);
  const [premioGanado, setPremioGanado] = useState<SegmentoRuleta | null>(null);
  const rotacionAcumuladaRef = useRef(0);

  // El barajado real (aleatorio) ocurre solo en el cliente, después del montaje,
  // evitando el mismatch de hidratación con el render del servidor.
  useEffect(() => {
    setSegmentos(generarSegmentosAleatorios());
  }, []);

  const girar = useCallback(() => {
  if (girando) return;

  setPremioGanado(null);
  setGirando(true);

  // 1. Elegimos el índice ganador
  const indiceGanador = Math.floor(Math.random() * TOTAL_SEGMENTOS);
  
  // 2. Ángulo central del segmento respecto a 0° (arriba)
  const anguloCentroSegmento = indiceGanador * GRADOS_POR_SEGMENTO + GRADOS_POR_SEGMENTO / 2;

  // 3. FIX: Redondeamos la rotación actual al múltiplo de 360° más cercano
  const vueltasAnteriores = Math.ceil(rotacionAcumuladaRef.current / 360) * 360;

  // 4. Calculamos el ángulo final exacto
  const nuevaRotacion = vueltasAnteriores + (VUELTAS_MINIMAS * 360) + (360 - anguloCentroSegmento);

  rotacionAcumuladaRef.current = nuevaRotacion;
  setRotacion(nuevaRotacion);

  window.setTimeout(() => {
    setGirando(false);
    setPremioGanado(segmentos[indiceGanador]);
  }, 4000); // 💡 Nota: Asegúrate de que los milisegundos coincidan con la transición CSS (ej. 4s)
}, [girando, segmentos]);

  const reiniciarRuleta = useCallback(() => {
    setSegmentos(generarSegmentosAleatorios());
    setPremioGanado(null);
  }, []);

  return { segmentos, rotacion, girando, premioGanado, girar, reiniciarRuleta };
}