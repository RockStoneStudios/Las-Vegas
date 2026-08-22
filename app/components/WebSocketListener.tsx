// app/components/WebSocketListener.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSocketStore } from '@/lib/store/useSocketStore';
import { ModalDespedida } from './ModalDespedida';

export function WebSocketListener() {
  const { mensajeWS } = useSocketStore();
  const [mesaCerrada, setMesaCerrada] = useState<{ mesa: number; mensaje: string } | null>(null);

  useEffect(() => {
    if (!mensajeWS) return;

    if (mensajeWS.tipo === 'EVENT:MESA_CERRADA') {
      console.log('🚪 [Cliente] Mesa cerrada:', mensajeWS.payload);
      setMesaCerrada({
        mesa: mensajeWS.payload.mesa,
        mensaje: mensajeWS.payload.mensaje || 'Tu sesión ha finalizado. ¡Gracias por visitarnos!',
      });
    }
  }, [mensajeWS]);

  const handleCerrarModal = () => {
    setMesaCerrada(null);
  };

  if (!mesaCerrada) return null;

  return (
    <ModalDespedida
      mensaje={mesaCerrada.mensaje}
      mesa={mesaCerrada.mesa}
      onCerrar={handleCerrarModal} // ✅ ESTO FUNCIONA AHORA
    />
  );
}