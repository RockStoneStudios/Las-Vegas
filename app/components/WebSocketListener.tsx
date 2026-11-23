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



// 'use client';

// import { useCallback, useEffect, useState } from 'react';
// import { suscribirMensaje } from '@/lib/store/useSocketStore';
// import { ModalDespedida } from './ModalDespedida';

// type Despedida = {
//   mesa: number;
//   mensaje: string;
// };

// export function WebSocketListener() {
//   const [despedida, setDespedida] = useState<Despedida | null>(null);

//   useEffect(() => {
//     const cancelarSuscripcion = suscribirMensaje(
//       'EVENT:MESA_CERRADA',
//       (evento) => {
//         const mesa = Number(evento.payload?.mesa);

//         if (!Number.isFinite(mesa) || mesa < 1) {
//           console.error(
//             '[ModalDespedida] Evento recibido sin un número de mesa válido:',
//             evento.payload
//           );
//           return;
//         }

//         console.log('[ModalDespedida] Mesa cerrada:', evento.payload);

//         setDespedida({
//           mesa,
//           mensaje:
//             evento.payload?.mensaje ??
//             'Tu sesión ha finalizado. ¡Gracias por visitarnos!',
//         });
//       }
//     );

//     return cancelarSuscripcion;
//   }, []);

//   const cerrarModal = useCallback(() => {
//     setDespedida(null);
//   }, []);

//   if (!despedida) return null;

//   return (
//     <ModalDespedida
//       mesa={despedida.mesa}
//       mensaje={despedida.mensaje}
//       onCerrar={cerrarModal}
//     />
//   );
// }

// 'use client';

// import { useCallback, useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { suscribirMensaje, useSocketStore } from '@/lib/store/useSocketStore';
// import { ModalDespedida } from './ModalDespedida';

// type Despedida = {
//   mesa: number;
//   mensaje: string;
// };

// export function WebSocketListener() {
//   const [despedida, setDespedida] = useState<Despedida | null>(null);
//   const router = useRouter();
  
//   // Traemos la función de desconexión del store
//   const desconectarSocket = useSocketStore((state) => state.desconectarSocket);

//   useEffect(() => {
//     const cancelarSuscripcion = suscribirMensaje(
//       'EVENT:MESA_CERRADA',
//       (evento) => {
//         const mesa = Number(evento.payload?.mesa);

//         if (!Number.isFinite(mesa) || mesa < 1) {
//           console.error('[ModalDespedida] Evento inválido:', evento.payload);
//           return;
//         }

//         console.log('🎉 [MODAL_LISTENER] Mostrando modal para mesa:', mesa);
//         setDespedida({
//           mesa,
//           mensaje: evento.payload?.mensaje ?? 'Tu sesión ha finalizado. ¡Gracias por visitarnos!',
//         });
//       }
//     );

//     return cancelarSuscripcion;
//   }, []);

//   // Función central para cerrar, limpiar todo y salir
//   const finalizarSesion = useCallback(() => {
//     console.log('🧹 [MODAL_LISTENER] Cerrando modal, limpiando sesión y redirigiendo...');
//     setDespedida(null);
    
//     // 1. Destruimos cualquier intento de reconexión y borramos el localStorage
//     desconectarSocket(); 
    
//     // 2. Redirigimos al inicio. Usamos window.location.href en vez de router.push 
//     // para forzar una recarga completa de la página y limpiar la memoria de React.
//     window.location.href = '/';
//   }, [desconectarSocket]);

//   // ⏱️ Control del tiempo
//   useEffect(() => {
//     if (!despedida) return;

//     // 👇 CAMBIA ESTO SI QUIERES QUE DURE MÁS O MENOS (10 = 10 segundos)
//     const TIEMPO_DURACION_MS = 10_000; 

//     const timer = setTimeout(() => {
//       finalizarSesion();
//     }, TIEMPO_DURACION_MS);

//     return () => clearTimeout(timer);
//   }, [despedida, finalizarSesion]);

//   if (!despedida) return null;

//   return (
//     <ModalDespedida
//       mesa={despedida.mesa}
//       mensaje={despedida.mensaje}
//       onCerrar={finalizarSesion}
//     />
//   );
// }

'use client';

import { useCallback, useEffect, useState } from 'react';
import { suscribirMensaje, useSocketStore } from '@/lib/store/useSocketStore';
import { ModalDespedida } from './ModalDespedida';

type Despedida = {
  mesa: number;
  mensaje: string;
};

export function WebSocketListener() {
  const [despedida, setDespedida] = useState<Despedida | null>(null);
  
  // 🔥 FIX: Traemos MI mesa del store para comparar
  const miMesa = useSocketStore((state) => state.mesa);
  const desconectarSocket = useSocketStore((state) => state.desconectarSocket);

  useEffect(() => {
    const cancelarSuscripcion = suscribirMensaje(
      'EVENT:MESA_CERRADA',
      (evento) => {
        const mesaCerrada = Number(evento.payload?.mesa);

        if (!Number.isFinite(mesaCerrada) || mesaCerrada < 1) {
          console.error('[ModalDespedida] Evento inválido:', evento.payload);
          return;
        }

        // 🔥 FIX: EL FILTRO QUE TE FALTABA
        // Si el admin cierra la mesa 3 y yo soy la mesa 1, lo ignoro.
        // Antes te faltaba esto y a TODAS las mesas les salía el modal.
        const mesaActual = useSocketStore.getState().mesa;
        if (mesaActual !== null && mesaCerrada !== mesaActual) {
          console.log(`ℹ️ [MODAL_LISTENER] Cerraron la mesa ${mesaCerrada}, yo soy la ${mesaActual}, la ignoro`);
          return;
        }

        console.log('🎉 [MODAL_LISTENER] Mostrando modal para mesa:', mesaCerrada);
        setDespedida({
          mesa: mesaCerrada,
          mensaje: evento.payload?.mensaje ?? 'Tu sesión ha finalizado. ¡Gracias por visitarnos!',
        });
      }
    );

    return cancelarSuscripcion;
  }, []);

  // Función central para cerrar, limpiar todo y salir
  const finalizarSesion = useCallback(() => {
    console.log('🧹 [MODAL_LISTENER] Cerrando modal, limpiando sesión y redirigiendo...');
    setDespedida(null);
    
    // 1. Destruimos cualquier intento de reconexión y borramos el localStorage
    desconectarSocket(); 
    
    // 2. Redirigimos al inicio. Usamos window.location.href en vez de router.push 
    // para forzar una recarga completa de la página y limpiar la memoria de React.
    window.location.href = '/';
  }, [desconectarSocket]);

  // ⏱ Control del tiempo - ESTE ES EL ÚNICO TIMER QUE QUEDA
  useEffect(() => {
    if (!despedida) return;

    const TIEMPO_DURACION_MS = 10_000; 

    const timer = setTimeout(() => {
      finalizarSesion();
    }, TIEMPO_DURACION_MS);

    return () => clearTimeout(timer);
  }, [despedida, finalizarSesion]);

  if (!despedida) return null;

  return (
    <ModalDespedida
      mesa={despedida.mesa}
      mensaje={despedida.mensaje}
      onCerrar={finalizarSesion}
    />
  );
}