'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function PedirCancion() {
  const [cancion, setCancion] = useState('');
  const [autor, setAutor] = useState('');

  const contenedorRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!contenedorRef.current || !formRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Textos de cabecera instantáneos
      gsap.from('.anim-texto', {
        y: 15,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power3.out',
      });

      // 2. Entrada del contenedor del formulario
      gsap.from(formRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        delay: 0.15,
        ease: 'power4.out',
      });

      // 3. Entrada de los bloques internos (Inputs y Botón por separado)
      gsap.from('.bloque-input', {
        y: 10,
        opacity: 0,
        duration: 0.3,
        stagger: 0.08,
        delay: 0.25,
        ease: 'power2.out',
      });
    }, contenedorRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`¡Solicitud enviada! El DJ ya tiene en cola: ${cancion}`);
    setCancion('');
    setAutor('');
  };

  return (
    <main 
      className="relative min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat flex items-start md:items-center"
      style={{ backgroundImage: "url('/fondo.webp')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#060413]/95 via-[#020106]/90 to-[#0a071d]/95 z-0" />

      <div 
        ref={contenedorRef}
        className="relative max-w-3xl mx-auto w-full z-10 flex flex-col items-center text-center space-y-8"
      >
        {/* Cabecera */}
        <div className="space-y-4">
          <div className="anim-texto inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#a855f7]/10 border border-[#a855f7]/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse" />
            <span className="font-sans font-black text-xs uppercase tracking-[0.2em] text-[#a855f7]">
              Nos encanta complacerte
            </span>
          </div>

          <h1 className="anim-texto font-sans font-black text-4xl sm:text-5xl uppercase tracking-tight text-white leading-none">
            Pide tu <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">Canción Favorita</span>
          </h1>

          <hr className="anim-texto border-none h-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)] w-24 opacity-80 mx-auto" />

          <p className="anim-texto font-sans text-base sm:text-lg text-gray-300 max-w-xl mx-auto leading-relaxed font-medium">
            ¿Cansado de pararte de la mesa para poder pedir tu canción favorita al DJ? 
            Pídela desde la comodidad de tu asiento.
          </p>
        </div>

        {/* Formulario */}
        <form 
          ref={formRef}
          onSubmit={handleSubmit} 
          className="w-full p-6 sm:p-8 rounded-2xl border border-[#1f1645] bg-[#060413]/85 backdrop-blur-sm shadow-[0_0_25px_rgba(31,22,69,0.4)] space-y-6 text-left"
        >
          {/* Input 1 */}
          <div className="bloque-input flex flex-col space-y-2">
            <label className="font-sans font-black text-xs uppercase tracking-widest text-[#ff00a0] drop-shadow-[0_0_5px_rgba(255,0,160,0.3)]">
              🎵 Nombre de la canción
            </label>
            <input 
              type="text"
              required
              value={cancion}
              onChange={(e) => setCancion(e.target.value)}
              placeholder="Ej: Murder on the Dancefloor"
              className="w-full px-4 py-3 rounded-xl border border-[#1f1645] bg-[#0c0824] text-white placeholder-gray-600 font-sans text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all duration-300"
            />
          </div>

          {/* Input 2 */}
          <div className="bloque-input flex flex-col space-y-2">
            <label className="font-sans font-black text-xs uppercase tracking-widest text-[#ff00a0] drop-shadow-[0_0_5px_rgba(255,0,160,0.3)]">
              👤 Autor / Artista
            </label>
            <input 
              type="text"
              required
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              placeholder="Ej: Sophie Ellis-Bextor"
              className="w-full px-4 py-3 rounded-xl border border-[#1f1645] bg-[#0c0824] text-white placeholder-gray-600 font-sans text-sm focus:outline-none focus:border-[#a855f7] focus:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300"
            />
          </div>

          {/* Contenedor del Botón (Para asegurar que GSAP no altere el layout del botón) */}
          <div className="bloque-input w-full pt-2">
            <button 
              type="submit"
              className="w-full py-4 rounded-xl bg-transparent border-2 border-cyan-400 text-cyan-400 font-sans font-black text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:bg-cyan-400 hover:text-[#ffffff] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] transition-all duration-300 cursor-pointer active:scale-[0.98]"
            >
              🔥 Enviar al DJ
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}