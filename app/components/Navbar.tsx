'use client';

import { useState, Fragment } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const enlaces = [
    { nombre: 'Nosotros', url: '/nosotros' },
    { nombre: 'Tu canción', url: '/tu-cancion' },
    { nombre: 'Juegos', url: '/juegos' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#060413]/80 backdrop-blur-md border-b border-[#1f1645] shadow-[0_4px_30px_rgba(31,22,69,0.2)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo - Estilo Neón Cian con Texto en Dos Líneas */}
          <div className="flex-shrink-0">
            <Link href="/" className="group flex items-center gap-3">
              {/* Icono Hexagonal */}
              <div className="w-8 h-8 flex-shrink-0 bg-transparent border-2 border-cyan-400 rotate-45 flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.5)] group-hover:shadow-[0_0_20px_rgba(34,211,238,0.8)] transition-all duration-300">
                <div className="w-3 h-3 bg-cyan-400 rounded-sm" />
              </div>
              
              {/* Contenedor de Texto de Dos Líneas */}
              <div className="flex flex-col text-left font-sans font-black text-sm sm:text-base tracking-wider uppercase leading-none">
                <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] group-hover:text-white transition-colors duration-300">
                  Las Vegas
                </span>
                <span className="text-white pl-[2.2rem] sm:pl-[2.7rem] mt-0.5 tracking-widest">
                  Discobar
                </span>
              </div>
            </Link>
          </div>

          {/* Menú de Escritorio (Desktop) con Divisiones Verticales en Neón Blanco */}
          <div className="hidden md:flex items-center gap-6">
            {enlaces.map((enlace, index) => (
              <Fragment key={enlace.nombre}>
                <Link
                  href={enlace.url}
                  className="font-sans font-bold text-sm tracking-widest text-gray-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] uppercase transition-all duration-300"
                >
                  {enlace.nombre}
                </Link>
                {/* Línea vertical divisoria en neón blanco (no se renderiza después del último elemento) */}
                {index < enlaces.length - 1 && (
                  <span className="w-[2px] h-4 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] opacity-60 pointer-events-none mx-2" />
                )}
              </Fragment>
            ))}
            
            {/* Espaciador sutil antes del botón */}
            <span className="w-[1px] h-5 bg-[#1f1645] mx-2" />

            {/* Botón de Acción con Neón Fucsia/Violeta */}
            <button className="px-6 py-2.5 rounded-full bg-[#ff00a0] font-sans font-extrabold text-xs tracking-widest text-white uppercase shadow-[0_0_20px_rgba(255,0,160,0.6)] hover:shadow-[0_0_35px_rgba(255,0,160,0.9)] hover:scale-105 active:scale-95 transition-all duration-300">
              Admin panel
            </button>
          </div>

          {/* Botón Menú Hamburguesa (Móvil) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuAbierto(true)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-cyan-400 hover:bg-[#150d2f] focus:outline-none transition-all duration-200"
            >
              <span className="sr-only">Abrir menú</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* --- MENU LATERAL DERECHO (SIDEBAR MOVIL BLINDADO) --- */}
      <div 
        id="mobile-menu-container"
        className={`fixed inset-0 h-screen w-screen z-[999] md:hidden transition-all duration-300 ${
          menuAbierto 
            ? 'opacity-100 pointer-events-auto visible' 
            : 'opacity-0 pointer-events-none invisible'
        }`}
      >
        {/* Capa trasera oscura que bloquea al 100% el contenido de atrás */}
        <div 
          className="absolute inset-0 bg-[#020106]/90 backdrop-blur-md w-full h-full"
          onClick={() => setMenuAbierto(false)}
        />

        {/* Panel del Menú Lateral Sólido */}
        <div 
          className={`absolute right-0 top-0 h-full w-[290px] sm:w-[340px] bg-[#0a071d] border-l border-[#1f1645] p-6 flex flex-col z-50 shadow-[-20px_0_50px_rgba(0,0,0,0.9)] transition-transform duration-300 ease-in-out ${
            menuAbierto ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Botón Cerrar (X) */}
          <div className="flex items-center justify-end h-14 mb-8">
            <button
              onClick={() => setMenuAbierto(false)}
              className="p-2 rounded-md text-gray-400 hover:text-cyan-400 hover:bg-[#150d2f] focus:outline-none transition-all duration-200"
            >
              <span className="sr-only">Cerrar menú</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Enlaces de Navegación Verticales con Neón Blanco */}
          <div className="flex flex-col">
            {enlaces.map((enlace) => (
              <div key={enlace.nombre} className="w-full flex flex-col">
                <Link
                  href={enlace.url}
                  onClick={() => setMenuAbierto(false)}
                  className="flex items-center py-5 px-4 font-sans font-black text-xl tracking-[0.15em] text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] hover:drop-shadow-[0_0_15px_rgba(255,255,255,1)] uppercase transition-all duration-200"
                >
                  {enlace.nombre}
                </Link>
                {/* Barra horizontal separadora con estilo Neón Blanco */}
                <hr className="border-none h-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)] w-full opacity-80" />
              </div>
            ))}
          </div>

          {/* Botón Admin Panel en Sidebar */}
          <div className="mt-auto pb-8">
            <button 
              onClick={() => setMenuAbierto(false)}
              className="w-full py-4 rounded-2xl bg-[#ff00a0] font-sans font-extrabold text-sm tracking-widest text-white uppercase shadow-[0_0_20px_rgba(255,0,160,0.5)] active:scale-95 transition-all duration-200"
            >
              Admin panel
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}