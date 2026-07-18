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
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#060413]/85 backdrop-blur-md border-b border-[#2b1b4b] shadow-[0_4px_30px_rgba(155,93,229,0.15)] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo - Estilo Neón Cian con Fuente Orbitron */}
          <div className="flex-shrink-0">
            <Link href="/" className="group flex items-center gap-3">
              {/* Icono Hexagonal Potenciado */}
              <div className="w-8 h-8 flex-shrink-0 bg-transparent border-2 border-cyan-400 rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.6)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.9)] group-hover:border-white transition-all duration-300">
                <div className="w-3 h-3 bg-cyan-400 rounded-sm shadow-[0_0_8px_rgba(34,211,238,0.8)] group-hover:bg-white" />
              </div>
              
              {/* Contenedor de Texto con Orbitron */}
              <div className="flex flex-col text-left font-orbitron font-black text-sm sm:text-base tracking-widest uppercase leading-none">
                <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] group-hover:text-white transition-all duration-300 animate-pulse">
                  Las Vegas
                </span>
                <span className="text-white pl-[2.2rem] sm:pl-[2.7rem] mt-0.5 tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                  Discobar
                </span>
              </div>
            </Link>
          </div>

          {/* Menú de Escritorio con Space Grotesk y Neón Blanco Intenso */}
          <div className="hidden md:flex items-center gap-6">
            {enlaces.map((enlace, index) => (
              <Fragment key={enlace.nombre}>
                <Link
                  href={enlace.url}
                  className="font-space font-bold text-sm tracking-[0.15em] text-gray-300 hover:text-white hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] uppercase transition-all duration-300"
                >
                  {enlace.nombre}
                </Link>
                {/* Línea vertical divisoria en neón blanco ultra brillante */}
                {index < enlaces.length - 1 && (
                  <span className="w-[2px] h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)] opacity-75 pointer-events-none mx-2 animate-pulse" />
                )}
              </Fragment>
            ))}
            
            {/* Espaciador de estructura */}
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

      {/* --- MENU LATERAL DERECHO (SIDEBAR MOVIL OPTIMIZADO Y COMPACTO) --- */}
      <div 
        id="mobile-menu-container"
        className={`fixed inset-0 h-screen w-screen z-[999] md:hidden transition-all duration-300 ${
          menuAbierto 
            ? 'opacity-100 pointer-events-auto visible' 
            : 'opacity-0 pointer-events-none invisible'
        }`}
      >
        {/* Capa trasera oscura */}
        <div 
          className="absolute inset-0 bg-[#020106]/90 backdrop-blur-md w-full h-full"
          onClick={() => setMenuAbierto(false)}
        />

        {/* Panel del Menú Lateral Sólido - Ancho ajustado de [290px]/[340px] a un máximo compacto de [240px]/[280px] */}
        <div 
          className={`absolute right-0 top-0 h-full w-[240px] sm:w-[280px] bg-[#0a071d] border-l border-[#1f1645] p-5 flex flex-col z-50 shadow-[-20px_0_50px_rgba(0,0,0,0.9)] transition-transform duration-300 ease-in-out ${
            menuAbierto ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Botón Cerrar (X) - Espacio e h-14 reducidos a h-10 */}
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

          {/* Enlaces de Navegación - Reducido 2px (text-xl a text-lg), padding vertical ajustado de py-5 a py-3.5 */}
          <div className="flex flex-col">
            {enlaces.map((enlace) => (
              <div key={enlace.nombre} className="w-full flex flex-col">
                <Link
                  href={enlace.url}
                  onClick={() => setMenuAbierto(false)}
                  className="flex items-center py-3.5 px-2 font-space font-bold text-lg tracking-[0.15em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.85)] hover:drop-shadow-[0_0_18px_rgba(255,255,255,1)] uppercase transition-all duration-200"
                >
                  {enlace.nombre}
                </Link>
                {/* Barra horizontal con estilo Neón Blanco */}
                <hr className="border-none h-[1.5px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] w-full opacity-70 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Botón Admin Panel en Sidebar devuelto y optimizado para el espacio reducido */}
          

        </div>
      </div>
    </nav>
  );
}