'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginAdminPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

   try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rol: 'admin',
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.mensaje || 'Contraseña incorrecta');
      }

      const tokenSesion = data.sessionId || data.id;

      if (!tokenSesion) {
        throw new Error('El servidor no devolvió un ID de sesión válido');
      }

      // 1. Guardamos la sesión
      localStorage.setItem('admin_session_id', tokenSesion);

      // 2. Redirigimos a /admin y forzamos refresco de ruta
      router.replace('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor');
      setCargando(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-[#020106] flex items-center justify-center px-4 select-none overflow-hidden font-orbitron">
      {/* Fondo Neo-Punk Grids & Resplandores */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f3ff0a_1px,transparent_1px),linear-gradient(to_bottom,#ff00a00a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-[#ff00a0]/15 rounded-full blur-[120px] pointer-events-none -top-20 -left-20" />
      <div className="absolute w-[500px] h-[500px] bg-[#00f3ff]/15 rounded-full blur-[120px] pointer-events-none -bottom-20 -right-20" />

      {/* Tarjeta Cyberpunk / Neo-Punk */}
      <div className="relative z-10 w-full max-w-md bg-[#080516]/90 border-2 border-[#ff00a0] p-8 rounded-none sm:rounded-2xl shadow-[0_0_50px_rgba(255,0,160,0.35)] backdrop-blur-xl transition-all">
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#00f3ff]" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#00f3ff]" />

        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative mb-3 group">
            <div className="absolute inset-0 bg-[#ff00a0] blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-4 bg-[#020106] border border-[#00f3ff] text-3xl">
              🎛️
            </div>
          </div>

          <h1 className="font-black text-2xl text-white uppercase tracking-[0.25em] drop-shadow-[0_0_12px_rgba(255,0,160,0.8)]">
            CABINA <span className="text-[#00f3ff]">ADMIN</span>
          </h1>
          <p className="font-space text-xs text-slate-400 mt-2 font-bold tracking-wide">
            LAS VEGAS DISCOBAR • SYSTEM ACCESS
          </p>
        </div>

        <form onSubmit={manejarSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-space text-[11px] font-black uppercase tracking-widest text-slate-300">
              Contraseña de Acceso
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#020106] border border-[#ff00a0]/50 rounded-xl px-4 py-3.5 font-space text-sm text-white tracking-widest focus:outline-none focus:border-[#00f3ff] focus:shadow-[0_0_15px_rgba(0,243,255,0.4)] transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border-2 border-red-500 p-3 text-center shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <p className="font-space text-xs font-black text-red-400 tracking-wider">
                ⚠️ {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="relative group w-full font-black text-xs uppercase tracking-[0.2em] py-4 bg-[#ff00a0] text-white border border-[#00f3ff] hover:bg-[#00f3ff] hover:text-black shadow-[0_0_25px_rgba(255,0,160,0.6)] hover:shadow-[0_0_30px_rgba(0,243,255,0.8)] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {cargando ? 'CONECTANDO SISTEMA...' : 'ENTRAR A LA CABINA ⚡'}
          </button>
        </form>
      </div>
    </main>
  );
}