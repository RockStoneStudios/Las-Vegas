'use client';

import { useEffect, useRef, useState } from 'react';
import { EstadoJuego, ESTADO_INICIAL } from '../types/juegos';
import { useMesa } from '../context/MesaContext';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;
const MODO_SIMULACION = !WS_URL;

export function useEstadoJuego() {
  const { numeroMesa } = useMesa();
  const [estado, setEstado] = useState<EstadoJuego>(ESTADO_INICIAL);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (MODO_SIMULACION || numeroMesa === null) return;

    const socket = new WebSocket(`${WS_URL}?mesa=${numeroMesa}`);
    socketRef.current = socket;

    socket.onmessage = (evento) => {
      const mensaje = JSON.parse(evento.data);
      if (mensaje.evento === 'juego-iniciado' || mensaje.evento === 'reto-exclusivo' || mensaje.evento === 'progreso') {
        setEstado((prev) => ({ ...prev, ...mensaje.estado }));
      }
      if (mensaje.evento === 'juego-finalizado') {
        setEstado(ESTADO_INICIAL);
      }
    };

    return () => socket.close();
  }, [numeroMesa]);

  function enviar(mensaje: Record<string, unknown>) {
    if (MODO_SIMULACION) {
      console.log('[SIMULACIÓN] se habría enviado al servidor:', mensaje);
      return;
    }
    socketRef.current?.send(JSON.stringify(mensaje));
  }

  // SOLO para hoy, mientras no hay backend: simula que el admin lanzó un juego.
  // Bórrala mañana cuando conectemos Bun.js de verdad.
  function simularJuego(parcial: Partial<EstadoJuego>) {
    if (!MODO_SIMULACION) return;
    setEstado({ ...ESTADO_INICIAL, inicioTimestamp: Date.now(), ...parcial });
  }

  return { estado, enviar, simularJuego, modoSimulacion: MODO_SIMULACION };
}