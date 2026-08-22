// app/components/ModalDespedida.tsx

'use client';

import { useEffect } from 'react';

interface ModalDespedidaProps {
  mensaje: string;
  mesa: number;
  onCerrar?: () => void; // ✅ AGREGAR ESTA LÍNEA
}

export function ModalDespedida({ mensaje, mesa, onCerrar }: ModalDespedidaProps) {
  useEffect(() => {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('mesa');
    
    // 🔥 Si onCerrar existe, ejecutarlo
    const timer = setTimeout(() => {
      if (onCerrar) onCerrar();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onCerrar]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="bg-gradient-to-b from-[#0a071d] to-[#1a0f2e] border-2 border-[#ff00a0]/60 rounded-3xl p-8 text-center max-w-md shadow-[0_0_60px_rgba(255,0,160,0.4)]">
        
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