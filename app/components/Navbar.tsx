'use client';

import { Suspense } from 'react';
import { useState, Fragment, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import gsap from 'gsap';

function NavbarContent() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarModalQR, setMostrarModalQR] = useState(false);
  const [mesaActual, setMesaActual] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);

  // Detectar si el usuario está en una mesa por URL o Storage
  useEffect(() => {
    const mesaUrl = searchParams.get('mesa');
    const mesaStorage = localStorage.getItem('mesa_numero');
    const pathname = window.location.pathname;

    if (pathname.startsWith('/mesa/')) {
      if (mesaUrl) {
        setMesaActual(mesaUrl);
        localStorage.setItem('mesa_numero', mesaUrl);
      } else if (mesaStorage) {
        setMesaActual(mesaStorage);
      }
    } else if (pathname.startsWith('/admin')) {
      setMesaActual('ADMIN'); // 👈 Insignia especial para Admin
    } else {
      setMesaActual(null);
    }
  }, [searchParams]);

  const enlaces = [
    { 
      nombre: 'Carta', 
      url: '/carta',
      requiereMesa: false,
      colorClass: 'text-[#ffd700] drop-shadow-[0_0_8px_#ffd700,0_0_20px_#ffd700] hover:drop-shadow-[0_0_15px_#ffd700,0_0_35px_#ffd700]' 
    },
    { 
      nombre: 'Nosotros', 
      url: '/nosotros',
      requiereMesa: false,
      colorClass: 'text-[#00f3ff] drop-shadow-[0_0_8px_#00f3ff,0_0_20px_#00f3ff] hover:drop-shadow-[0_0_15px_#00f3ff,0_0_35px_#00f3ff]' 
    },
    { 
      nombre: 'Tu canción', 
      url: '/tu-cancion',
      requiereMesa: true,
      colorClass: 'text-[#ff00a0] drop-shadow-[0_0_8px_#ff00a0,0_0_20px_#ff00a0] hover:drop-shadow-[0_0_15px_#ff00a0,0_0_35px_#ff00a0]' 
    },
    { 
      nombre: 'Juegos', 
      url: '/juegos',
      requiereMesa: true,
      colorClass: 'text-[#00ff66] drop-shadow-[0_0_8px_#00ff66,0_0_20px_#00ff66] hover:drop-shadow-[0_0_15px_#00ff66,0_0_35px_#00ff66]' 
    },
  ];

  // Animación GSAP de parpadeo eléctrico Neón
  useEffect(() => {
    linksRef.current.forEach((el) => {
      if (!el) return;

      const animarParpadeo = () => {
        const duracion = gsap.utils.random(0.05, 0.25);
        const retraso = gsap.utils.random(1.5, 4.5);
        const opacidadBaja = gsap.utils.random(0.2, 0.5);

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.delayedCall(retraso, animarParpadeo);
          },
        });

        tl.to(el, { opacity: opacidadBaja, duration: duracion, ease: 'power1.inOut' })
          .to(el, { opacity: 1, duration: duracion, ease: 'power1.inOut' })
          .to(el, { opacity: gsap.utils.random(0.4, 0.7), duration: duracion / 2 })
          .to(el, { opacity: 1, duration: duracion * 1.5 });
      };

      const retrasoInicial = gsap.utils.random(0.5, 2.5);
      gsap.delayedCall(retrasoInicial, animarParpadeo);
    });

    return () => {
      gsap.killTweensOf(linksRef.current);
    };
  }, []);

  // Manejador para clics en secciones interactivas que requieren estar en el bar
  const manejarClicEnlace = (e: React.MouseEvent, requiereMesa: boolean) => {
    if (requiereMesa && !mesaActual) {
      e.preventDefault();
      setMenuAbierto(false);
      setMostrarModalQR(true);
    } else {
      setMenuAbierto(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#060413]/85 backdrop-blur-md border-b border-[#2b1b4b] shadow-[0_4px_30px_rgba(155,93,229,0.15)] select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div className="shrink-0 flex items-center gap-3">
              <Link href="/" className="group flex items-center transition-transform duration-300 hover:scale-105">
                <div className="relative w-28 h-10 sm:w-36 sm:h-12 flex items-center justify-center">
                  <Image
                    src="/lasvesgas-logo.PNG"
                    alt="Las Vegas Discobar Logo"
                    width={220}
                    height={220}
                    className="object-contain filter drop-shadow-[0_0_10px_rgba(34,211,238,0.6)] group-hover:drop-shadow-[0_0_18px_rgba(34,211,238,0.9)] transition-all duration-300"
                    priority
                  />
                </div>
              </Link>

              {/* Insignia de Estado (Mesa vs Modo Web Público) */}
              {mesaActual === 'ADMIN' ? (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/40 text-pink-400 font-orbitron text-xs font-bold">
                  🎧 ADMIN
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-space text-[11px]">
                  🌐 MODO WEB
                </div>
              )}
            </div>

            {/* Menú de Escritorio */}
            <div className="hidden md:flex items-center gap-6">
              {enlaces.map((enlace, index) => (
                <Fragment key={enlace.nombre}>
                  <Link
                    ref={(el) => { linksRef.current[index] = el; }}
                    href={enlace.url}
                    onClick={(e) => manejarClicEnlace(e, enlace.requiereMesa)}
                    className={`font-space font-extrabold text-sm tracking-[0.15em] uppercase transition-transform duration-300 hover:scale-105 ${enlace.colorClass}`}
                  >
                    {enlace.nombre}
                  </Link>
                  {index < enlaces.length - 1 && (
                    <span className="w-[2px] h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)] opacity-75 pointer-events-none mx-2 animate-pulse" />
                  )}
                </Fragment>
              ))}

              <span className="w-[1px] h-5 bg-[#2b1b4b] mx-2" />
            </div>

            {/* Botón Menú Hamburguesa (Móvil) */}
            <div className="md:hidden flex items-center gap-3">
              {mesaActual && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-orbitron text-[10px] font-bold">
                  MESA #{mesaActual}
                </span>
              )}
              <button
                onClick={() => setMenuAbierto(true)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-cyan-400 hover:bg-[#150d2f] focus:outline-none transition-all duration-200"
              >
                <span className="sr-only">Abrir menú</span>
                <svg className="h-6 w-6 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

          </div>
        </div>

        {/* --- MENÚ LATERAL MÓVIL --- */}
        <div 
          id="mobile-menu-container"
          className={`fixed inset-0 h-screen w-screen z-[999] md:hidden transition-all duration-300 ${
            menuAbierto 
              ? 'opacity-100 pointer-events-auto visible' 
              : 'opacity-0 pointer-events-none invisible'
          }`}
        >
          <div 
            className="absolute inset-0 bg-[#020106]/90 backdrop-blur-md w-full h-full"
            onClick={() => setMenuAbierto(false)}
          />

          <div 
            className={`absolute right-0 top-0 h-full w-[240px] sm:w-[280px] bg-[#0a071d] border-l border-[#1f1645] p-5 flex flex-col z-50 shadow-[-20px_0_50px_rgba(0,0,0,0.9)] transition-transform duration-300 ease-in-out ${
              menuAbierto ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between h-10 mb-4 border-b border-[#1f1645] pb-2">
              <span className="font-orbitron text-xs font-bold text-gray-400">
                {mesaActual ? `🟢 MESA #${mesaActual}` : '🌐 LAS VEGAS WEB'}
              </span>
              <button
                onClick={() => setMenuAbierto(false)}
                className="p-1.5 rounded-md text-gray-400 hover:text-cyan-400 hover:bg-[#150d2f] focus:outline-none transition-all duration-200"
              >
                <span className="sr-only">Cerrar menú</span>
                <svg className="h-5 w-5 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col">
              {enlaces.map((enlace, index) => (
                <div key={enlace.nombre} className="w-full flex flex-col">
                  <Link
                    ref={(el) => { linksRef.current[index + enlaces.length] = el; }}
                    href={enlace.url}
                    onClick={(e) => manejarClicEnlace(e, enlace.requiereMesa)}
                    className={`flex items-center py-3.5 px-2 font-space font-extrabold text-lg tracking-[0.15em] uppercase transition-transform duration-200 ${enlace.colorClass}`}
                  >
                    {enlace.nombre}
                  </Link>
                  <hr className="border-none h-[1.5px] bg-white/20 shadow-[0_0_8px_rgba(255,255,255,0.4)] w-full" />
                </div>
              ))}
            </div>

          </div>
        </div>
      </nav>

      {/* --- MODAL NEÓN: ESCANEAR QR PARA ACTIVAR --- */}
      {mostrarModalQR && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#0a071d] border border-pink-500/50 rounded-3xl p-6 text-center shadow-[0_0_40px_rgba(255,0,160,0.3)]">
            
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pink-500/10 border border-pink-500/40 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(255,0,160,0.4)]">
              📱
            </div>

            <h3 className="font-orbitron font-black text-xl text-white uppercase tracking-wider mb-2">
              ¡Escanea tu Mesa!
            </h3>

            <p className="font-space text-sm text-gray-300 leading-relaxed mb-6">
              Para pedir canciones, participar en la ruleta y llamar al mesero, necesitas estar en el bar y escanear el <span className="text-pink-400 font-bold">QR en tu mesa</span>.
            </p>

            <button
              onClick={() => setMostrarModalQR(false)}
              className="w-full py-3 rounded-xl font-space font-bold text-white text-sm bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-[0_0_20px_rgba(255,0,160,0.4)] active:scale-95 transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <NavbarContent />
    </Suspense>
  );
}