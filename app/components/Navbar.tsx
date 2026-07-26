'use client';

import { useState, Fragment, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Referencias a los enlaces para GSAP
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const enlaces = [
    { 
      nombre: 'Nosotros', 
      url: '/nosotros',
      colorClass: 'text-[#00f3ff] drop-shadow-[0_0_8px_#00f3ff,0_0_20px_#00f3ff] hover:drop-shadow-[0_0_15px_#00f3ff,0_0_35px_#00f3ff]' 
    },
    { 
      nombre: 'Tu canción', 
      url: '/tu-cancion',
      colorClass: 'text-[#ff00a0] drop-shadow-[0_0_8px_#ff00a0,0_0_20px_#ff00a0] hover:drop-shadow-[0_0_15px_#ff00a0,0_0_35px_#ff00a0]' 
    },
    { 
      nombre: 'Juegos', 
      url: '/juegos',
      colorClass: 'text-[#00ff66] drop-shadow-[0_0_8px_#00ff66,0_0_20px_#00ff66] hover:drop-shadow-[0_0_15px_#00ff66,0_0_35px_#00ff66]' 
    },
  ];

  useEffect(() => {
    // Aplicar animación de parpadeo neón desordenada e individual con GSAP
    linksRef.current.forEach((el) => {
      if (!el) return;

      // Función recursiva para crear micro-parpadeos aleatorios
      const animarParpadeo = () => {
        const duracion = gsap.utils.random(0.05, 0.25);
        const retraso = gsap.utils.random(1.5, 4.5); // Tiempo entre parpadeos
        const opacidadBaja = gsap.utils.random(0.2, 0.5);

        // Timeline corto de parpadeo rapido (estilo falla eléctrica neón)
        const tl = gsap.timeline({
          onComplete: () => {
            // Espera un tiempo aleatorio antes de volver a parpadear
            gsap.delayedCall(retraso, animarParpadeo);
          },
        });

        tl.to(el, { opacity: opacidadBaja, duration: duracion, ease: 'power1.inOut' })
          .to(el, { opacity: 1, duration: duracion, ease: 'power1.inOut' })
          .to(el, { opacity: gsap.utils.random(0.4, 0.7), duration: duracion / 2 })
          .to(el, { opacity: 1, duration: duracion * 1.5 });
      };

      // Iniciar animación con un retraso inicial aleatorio para que no parpadeen juntos
      const retrasoInicial = gsap.utils.random(0.5, 2.5);
      gsap.delayedCall(retrasoInicial, animarParpadeo);
    });

    return () => {
      // Limpiar llamadas de GSAP al desmontar
      gsap.killTweensOf(linksRef.current);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#060413]/85 backdrop-blur-md border-b border-[#2b1b4b] shadow-[0_4px_30px_rgba(155,93,229,0.15)] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="shrink-0">
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
          </div>

          {/* Menú de Escritorio */}
          <div className="hidden md:flex items-center gap-6">
            {enlaces.map((enlace, index) => (
              <Fragment key={enlace.nombre}>
                <Link
                  ref={(el) => { linksRef.current[index] = el; }}
                  href={enlace.url}
                  className={`font-space font-extrabold text-sm tracking-[0.15em] uppercase transition-transform duration-300 hover:scale-105 ${enlace.colorClass}`}
                >
                  {enlace.nombre}
                </Link>
                {/* Línea divisoria */}
                {index < enlaces.length - 1 && (
                  <span className="w-[2px] h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)] opacity-75 pointer-events-none mx-2 animate-pulse" />
                )}
              </Fragment>
            ))}
            
            <span className="w-[1px] h-5 bg-[#2b1b4b] mx-2" />
          </div>

          {/* Botón Menú Hamburguesa (Móvil) */}
          <div className="md:hidden flex items-center">
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

      {/* --- MENU LATERAL MÓVIL --- */}
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
          <div className="flex items-center justify-end h-10 mb-4">
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
                  onClick={() => setMenuAbierto(false)}
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
  );
}