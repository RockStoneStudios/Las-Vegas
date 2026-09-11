'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GestionPremiosAdmin from '@/app/components/GestionPremiosAdmin';

export default function PaginaPremiosAdmin() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const sesionGuardada = localStorage.getItem('admin_sessionId') || localStorage.getItem('admin_session_id');

    if (!sesionGuardada) {
      router.replace('/admin/login');
      return;
    }

    setCargando(false);
  }, [router]);

  if (cargando) {
    return (
      <main className="min-h-screen bg-[#020106] flex items-center justify-center font-orbitron text-[#00f3ff] text-xs tracking-[0.2em] animate-pulse">
        CARGANDO CONFIGURACIÓN...
      </main>
    );
  }

  return (
    <main className="relative min-h-screen pt-12 pb-16 px-4 sm:px-6 lg:px-8 bg-[#020106] flex flex-col items-center gap-8 select-none font-orbitron overflow-hidden">
      {/* Fondo Neo-Punk */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f3ff0a_1px,transparent_1px),linear-gradient(to_bottom,#ff00a00a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] bg-[#ff00a0]/10 rounded-full blur-[140px] pointer-events-none -top-30 -left-20" />
      <div className="absolute w-[600px] h-[600px] bg-[#00f3ff]/10 rounded-full blur-[140px] pointer-events-none -bottom-30 -right-20" />

      {/* Botón Volver */}
      <div className="relative z-10 w-full max-w-5xl flex justify-start">
        <Link
          href="/admin"
          className="text-xs font-black text-[#00f3ff] hover:text-white border border-[#00f3ff]/40 px-4 py-2 rounded-xl bg-[#00f3ff]/10 transition-all uppercase tracking-widest flex items-center gap-2"
        >
          ← VOLVER AL CONTROL
        </Link>
      </div>

      {/* Componente de Premios */}
      <div className="relative z-10 w-full max-w-5xl">
        <GestionPremiosAdmin />
      </div>
    </main>
  );
}