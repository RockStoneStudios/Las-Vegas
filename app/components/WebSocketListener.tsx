// // app/components/WebSocketListener.tsx

// 'use client';

// import { useState, useEffect } from 'react';
// import { useSocketStore } from '@/lib/store/useSocketStore';
// import { ModalDespedida } from './ModalDespedida';

// export function WebSocketListener() {
//   const { mensajeWS } = useSocketStore();
//   const [mesaCerrada, setMesaCerrada] = useState<{ mesa: number; mensaje: string } | null>(null);

//   useEffect(() => {
//     if (!mensajeWS) return;

//     if (mensajeWS.tipo === 'EVENT:MESA_CERRADA') {
//       console.log('🚪 [Cliente] Mesa cerrada:', mensajeWS.payload);
//       setMesaCerrada({
//         mesa: mensajeWS.payload.mesa,
//         mensaje: mensajeWS.payload.mensaje || 'Tu sesión ha finalizado. ¡Gracias por visitarnos!',
//       });
//     }
//   }, [mensajeWS]);

//   const handleCerrarModal = () => {
//     setMesaCerrada(null);
//   };

//   if (!mesaCerrada) return null;

//   return (
//     <ModalDespedida
//       mensaje={mesaCerrada.mensaje}
//       mesa={mesaCerrada.mesa}
//       onCerrar={handleCerrarModal} // ✅ ESTO FUNCIONA AHORA
//     />
//   );
// }



'use client';

import { useCallback, useEffect, useState } from 'react';
import { suscribirMensaje } from '@/lib/store/useSocketStore';
import { ModalDespedida } from './ModalDespedida';

type Despedida = {
  mesa: number;
  mensaje: string;
};

export function WebSocketListener() {
  const [despedida, setDespedida] = useState<Despedida | null>(null);

  useEffect(() => {
    const cancelarSuscripcion = suscribirMensaje(
      'EVENT:MESA_CERRADA',
      (evento) => {
        const mesa = Number(evento.payload?.mesa);

        if (!Number.isFinite(mesa) || mesa < 1) {
          console.error(
            '[ModalDespedida] Evento recibido sin un número de mesa válido:',
            evento.payload
          );
          return;
        }

        console.log('[ModalDespedida] Mesa cerrada:', evento.payload);

        setDespedida({
          mesa,
          mensaje:
            evento.payload?.mensaje ??
            'Tu sesión ha finalizado. ¡Gracias por visitarnos!',
        });
      }
    );

    return cancelarSuscripcion;
  }, []);

  const cerrarModal = useCallback(() => {
    setDespedida(null);
  }, []);

  if (!despedida) return null;

  return (
    <ModalDespedida
      mesa={despedida.mesa}
      mensaje={despedida.mensaje}
      onCerrar={cerrarModal}
    />
  );
}