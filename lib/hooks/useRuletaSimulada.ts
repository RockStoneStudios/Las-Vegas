'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SEGMENTOS_BASE, type SegmentoRuleta } from '@/lib/types/ruleta';

const TOTAL_SEGMENTOS = SEGMENTOS_BASE.length; // 5
const GRADOS_POR_SEGMENTO = 360 / TOTAL_SEGMENTOS; // 72°

// ✅ CAMBIADO: Mínimo 15 vueltas (antes 5)
const VUELTAS_MINIMAS = 15;  // ← AQUÍ ESTABA EL PROBLEMA

// ✅ NUEVO: Máximo de vueltas
const VUELTAS_MAXIMAS = 25;

function barajar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

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

    // 3. ✅ NUEVO: Calcular vueltas aleatorias entre 15 y 25
    const vueltasAleatorias = VUELTAS_MINIMAS + Math.floor(Math.random() * (VUELTAS_MAXIMAS - VUELTAS_MINIMAS + 1));
    
    // 4. ✅ FIX: Calcular rotación acumulada correctamente
    const rotacionActual = rotacionAcumuladaRef.current;
    const vueltasCompletas = Math.floor(rotacionActual / 360);
    const baseRotacion = (vueltasCompletas + 1) * 360; // Siguiente vuelta completa

    // 5. ✅ NUEVO: Calcular ángulo final con muchas vueltas
    const nuevaRotacion = baseRotacion + (vueltasAleatorias * 360) + (360 - anguloCentroSegmento);

    rotacionAcumuladaRef.current = nuevaRotacion;
    setRotacion(nuevaRotacion);

    // ✅ NUEVO: Duración entre 11 y 14 segundos (11000-14000 ms)
    const duracionMs = 11000 + Math.random() * 3000;

    // ✅ NUEVO: Log para debug
    console.log(`🎰 Girando ${vueltasAleatorias} vueltas en ${(duracionMs/1000).toFixed(1)}s`);

    window.setTimeout(() => {
      setGirando(false);
      setPremioGanado(segmentos[indiceGanador]);
    }, duracionMs);

  }, [girando, segmentos]);

  const reiniciarRuleta = useCallback(() => {
    setSegmentos(generarSegmentosAleatorios());
    setPremioGanado(null);
    setRotacion(0);
    rotacionAcumuladaRef.current = 0;
  }, []);

  return { segmentos, rotacion, girando, premioGanado, girar, reiniciarRuleta };
}