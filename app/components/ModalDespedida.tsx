'use client';

interface ModalDespedidaProps {
  mensaje: string;
  mesa: number;
  onCerrar?: () => void;
}

export function ModalDespedida({ mensaje, mesa }: ModalDespedidaProps) {
  // OJO: Le quité el useEffect con el timer de 5s y el localStorage.removeItem
  // Antes tenías 2 timers peleando: este de 5s y el del Listener de 10s.
  // Ahora el único que controla el tiempo es WebSocketListener.
  // Y tampoco borramos 'sessionId' / 'mesa' aquí, porque tu sesión real
  // se guarda en 'ws_session'. Eso ya lo borra el store con borrarSesion().

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="bg-gradient-to-b from-[#0a071d] to-[#1a0f2e] border-2 border-[#ff00a0]/60 rounded-3xl p-8 text-center max-w-md shadow-[0_0_60px_rgba(255,0,160,0.4)]">

        {/* 🔥 LOGO AL PRINCIPIO */}
        <div className="flex justify-center mb-4">
          <img
            src="/lasvesgas-logo.PNG"
            alt="Las Vegas Disco Bar"
            className="w-28 h-28 object-contain drop-shadow-[0_0_20px_rgba(255,0,160,0.6)]"
          />
        </div>

        <div className="text-7xl mb-4">🍹</div>

        <h2 className="font-orbitron font-black text-2xl text-white uppercase tracking-wider">
          ¡Gracias por visitarnos!
        </h2>

        <p className="font-space text-gray-300 text-sm mt-3 leading-relaxed">
          {mensaje || 'Tu sesión ha finalizado. ¡Esperamos verte pronto!'}
        </p>

        <p className="font-space text-xs text-gray-500 mt-4">
          Mesa #{mesa} · Las Vegas Disco Bar
        </p>

        <div className="mt-6 text-xs text-gray-600 font-space animate-pulse">
          Esta pestaña se cerrará automáticamente en unos segundos
        </div>
      </div>
    </div>
  );
}