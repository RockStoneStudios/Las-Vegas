'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function HeroSection() {
  const contenedorHero = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. ANIMACIONES DE ENTRADA
    const tlEntrada = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tlEntrada
      .from('.anim-subtitulo', { opacity: 0, y: -20, duration: 0.8 })
      .from('.anim-titulo', { opacity: 0, scale: 0.95, duration: 1.2 }, '-=0.4')
      .from('.anim-descripcion', { opacity: 0, y: 20, duration: 0.8 }, '-=0.6')
      .from('.anim-tarjeta', { opacity: 0, scale: 0.8, y: 40, stagger: 0.15, duration: 1 }, '-=0.4')
      .from('.anim-boton', { 
        opacity: 0, 
        y: 40, 
        stagger: 0.15, 
        duration: 1,
        clearProps: 'opacity,transform' 
      }, '-=0.6')
      .from('.anim-copa-derecha', { opacity: 0, x: 30, duration: 1 }, '-=1')
      .from('.anim-lema-neon', { opacity: 0, y: 15, duration: 0.8 }, '-=0.5');

    // 2. ANIMACIONES INFINITAS

    // A. Neón parpadeante blanco + CHISPAS CAYENDO para "Bar"
    gsap.to('.anim-bar', {
      keyframes: {
        '0%': { opacity: 1, textShadow: '0 0 8px #fff, 0 0 20px #fff, 0 0 40px #fff' },
        '7%': { opacity: 0.85, textShadow: '0 0 4px #fff, 0 0 10px #fff' },
        '8%': { opacity: 1, textShadow: '0 0 8px #fff, 0 0 20px #fff, 0 0 40px #fff' },
        '12%': { opacity: 0.3, textShadow: 'none' },
        '14%': { opacity: 1, textShadow: '0 0 8px #fff, 0 0 20px #fff, 0 0 40px #fff' },
        '30%': { opacity: 1, textShadow: '0 0 8px #fff, 0 0 20px #fff, 0 0 40px #fff' },
        '32%': { opacity: 0.2, textShadow: 'none' },
        '34%': { opacity: 1, textShadow: '0 0 8px #fff, 0 0 20px #fff, 0 0 40px #fff' },
        '70%': { opacity: 1, textShadow: '0 0 8px #fff, 0 0 20px #fff, 0 0 40px #fff' },
        '72%': { opacity: 0.3, textShadow: 'none' },
        '73%': { opacity: 1, textShadow: '0 0 8px #fff, 0 0 20px #fff, 0 0 40px #fff' },
        '100%': { opacity: 1, textShadow: '0 0 8px #fff, 0 0 20px #fff, 0 0 40px #fff' }
      },
      duration: 4,
      repeat: -1,
      ease: 'none',
      onUpdate: function () {
        const targets = this.targets();
        if (targets && targets[0]) {
          const currentOpacity = gsap.getProperty(targets[0], 'opacity') as number;
          if (currentOpacity < 0.5 && Math.random() > 0.3) {
            crearChispaBlanca();
          }
        }
      }
    });

    // B. Neón parpadeante violeta + chispas explosivas para "Sopetrán"
    gsap.to('.anim-sopetran', {
      keyframes: {
        '0%': { opacity: 1, textShadow: '0 0 8px #ff3ea5, 0 0 20px #ff3ea5, 0 0 40px #9b5de5' },
        '4%': { opacity: 0.2, textShadow: 'none' },
        '6%': { opacity: 1, textShadow: '0 0 14px #ff3ea5, 0 0 30px #9b5de5' },
        '9%': { opacity: 0.3, textShadow: 'none' },
        '11%': { opacity: 1, textShadow: '0 0 8px #ff3ea5, 0 0 20px #ff3ea5, 0 0 40px #9b5de5' },
        '50%': { opacity: 1, textShadow: '0 0 8px #ff3ea5, 0 0 20px #ff3ea5, 0 0 40px #9b5de5' },
        '52%': { opacity: 0.2, textShadow: 'none' },
        '54%': { opacity: 1, textShadow: '0 0 12px #ff3ea5, 0 0 25px #9b5de5' },
        '100%': { opacity: 1, textShadow: '0 0 8px #ff3ea5, 0 0 20px #ff3ea5, 0 0 40px #9b5de5' }
      },
      duration: 3,
      repeat: -1,
      ease: 'none',
      onUpdate: function () {
        const targets = this.targets();
        if (targets && targets[0]) {
          const currentOpacity = gsap.getProperty(targets[0], 'opacity') as number;
          if (currentOpacity < 0.5 && Math.random() > 0.4) {
            crearChispaVioleta();
          }
        }
      }
    });

    // FUNCIÓN: CHISPAS BLANCAS QUE CAEN
    function crearChispaBlanca() {
      const contenedorBar = document.querySelector('.contenedor-bar');
      if (!contenedorBar) return;

      const chispa = document.createElement('span');

      // Mantenemos tu clase original de chispa blanca estilizada
      chispa.className = 'absolute w-[2px] h-[6px] sm:w-[3px] sm:h-[8px] bg-white rounded-full pointer-events-none z-50';
      chispa.style.boxShadow = '0 0 8px #fff, 0 0 15px #22d3ee'; // Brillo blanco con halo cian eléctrico

      // 1. NACIMIENTO: Forzamos a que aparezca abajo en el contenedor (90%)
      chispa.style.left = `${Math.random() * 100}%`;
      chispa.style.top = '90%';

      contenedorBar.appendChild(chispa);

      // 2. EXPLOSIÓN: Movimiento estrictamente negativo en 'y' para que suba
      gsap.to(chispa, {
        // Dispersión hacia los lados (caótico)
        x: (Math.random() - 0.5) * 160,

        // Al ser negativo, resta píxeles al "top: 90%" y la obliga a subir disparada
        y: -Math.random() * 150 - 50,

        // Se encoge a 0 mientras desaparece rápido, igual que tu ejemplo
        scale: 0,
        opacity: 0,

        // Duración ultra rápida de cortocircuito errático
        duration: Math.random() * 0.3 + 0.15,

        // El ease 'expo.out' le da el latigazo inicial y se frena arriba
        ease: 'expo.out',
        onComplete: () => chispa.remove()
      });
    }
    // FUNCIÓN: CHISPAS VIOLETAS EXPLOSIVAS
    function crearChispaVioleta() {
      const contenedorSopetran = document.querySelector('.contenedor-sopetran');
      if (!contenedorSopetran) return;

      const chispa = document.createElement('span');
      chispa.className = 'absolute w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white pointer-events-none z-50';
      chispa.style.boxShadow = '0 0 8px #ff3ea5, 0 0 15px #9b5de5';
      chispa.style.left = `${Math.random() * 100}%`;
      chispa.style.top = `${Math.random() * 100}%`;

      contenedorSopetran.appendChild(chispa);

      gsap.to(chispa, {
        x: (Math.random() - 0.5) * 120,
        y: (Math.random() - 0.7) * 100,
        scale: 0,
        opacity: 0,
        duration: Math.random() * 0.4 + 0.2,
        ease: 'power2.out',
        onComplete: () => chispa.remove()
      });
    }

    // Flotación estética superior e intermedia
    gsap.to('.anim-contenedor-tarjetas', { y: 12, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.anim-copa-derecha', { y: -8, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    
    // Hojas Superiores (Movimiento normal)
    gsap.to('.anim-hoja-izquierda', { rotate: 8, x: 5, y: 5, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.anim-hoja-derecha', { rotate: -8, x: -5, y: 4, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    // Hojas Inferiores (Casi estáticas, micro-movimiento de 1px/1 grado)
    gsap.to('.anim-hoja-inf-izq', { rotate: 1, x: 1, y: 1, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.anim-hoja-inf-der', { rotate: -1, x: -1, y: 1, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  }, { scope: contenedorHero });

  return (
    <section 
      ref={contenedorHero} 
      className="relative w-full min-h-[calc(100vh-80px)] bg-[#060413] flex flex-col items-center justify-center text-center overflow-hidden px-4 pb-16 select-none"
    >
      {/* Luces de Ambiente */}
      <div className="absolute top-1/4 left-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-purple-900/30 to-pink-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-900/15 blur-[130px] pointer-events-none" />

      {/* Hojas Esquinas Superiores */}
      <div className="anim-hoja-izquierda absolute top-6 left-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 pointer-events-none origin-top-left">
        <Image src="/hoja-leaf.png" alt="Hoja Superior Izquierda" width={160} height={160} className="object-contain" priority />
      </div>
      <div className="anim-hoja-derecha absolute top-6 right-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 pointer-events-none origin-top-right">
        <Image src="/hoja-right.png" alt="Hoja Superior Derecha" width={160} height={160} className="object-contain" priority />
      </div>

      {/* Hojas Esquinas Inferiores (Casi estáticas) */}
      <div className="anim-hoja-inf-izq absolute bottom-6 left-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 pointer-events-none origin-bottom-left rotate-180">
        <Image src="/hoja-leaf.png" alt="Hoja Inferior Izquierda" width={160} height={160} className="object-contain" priority />
      </div>
      <div className="anim-hoja-inf-der absolute bottom-6 right-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 pointer-events-none origin-bottom-right rotate-180">
        <Image src="/hoja-right.png" alt="Hoja Inferior Derecha" width={160} height={160} className="object-contain" priority />
      </div>

      {/* --- Contenido Central --- */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-4 mt-8">
        
        <span className="anim-subtitulo font-sans font-bold text-xs sm:text-sm tracking-[0.25em] text-cyan-400 uppercase drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
          Cada mesa tiene su oportunidad
        </span>

        {/* Título Principal */}
        <h1 className="anim-titulo font-sans font-black text-5xl sm:text-7xl md:text-8xl text-white uppercase tracking-tight leading-none">
          Las Vegas <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
            Disco
          </span>
          <span className="contenedor-bar relative inline-block">
            <span className="anim-bar text-white transition-all duration-75 ml-1">
              Bar
            </span>
          </span>
        </h1>

        <p className="anim-descripcion font-sans font-medium text-[15px] sm:text-base text-gray-300 max-w-md sm:max-w-xl leading-relaxed mt-2">
          Escanea el QR de tu mesa, participa en los concursos de la noche y gana premios en vivo.
        </p>

        {/* CONTENEDOR: 3 TARJETAS EN NEÓN PEGADAS */}
        <div className="anim-contenedor-tarjetas mt-8 flex items-center justify-center gap-0 pointer-events-none drop-shadow-[0_10px_25px_rgba(31,22,69,0.5)]">
          
          {/* Tarjeta 1 - Neón Cian */}
          <div className="anim-tarjeta relative w-28 h-40 sm:w-40 sm:h-56 md:w-48 md:h-64 border-2 border-cyan-400 bg-[#0f0b21]/90 rounded-l-2xl overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.4)] z-10">
            <Image src="/abt1.png" alt="Evento 1" fill className="object-cover" priority />
          </div>

          {/* Tarjeta 2 - Neón Fucsia */}
          <div className="anim-tarjeta relative w-32 h-44 sm:w-44 sm:h-60 md:w-52 md:h-72 border-2 border-[#ff3ea5] bg-[#0f0b21]/90 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(255,62,165,0.5)] z-20 -mx-2 sm:-mx-3">
            <Image src="/abt2.png" alt="Evento 2" fill className="object-cover" priority />
          </div>

          {/* Tarjeta 3 - Neón Violeta */}
          <div className="anim-tarjeta relative w-28 h-40 sm:w-40 sm:h-56 md:w-48 md:h-64 border-2 border-[#9b5de5] bg-[#0f0b21]/90 rounded-r-2xl overflow-hidden shadow-[0_0_20px_rgba(155,93,229,0.4)] z-10">
            <Image src="/drin1.png" alt="Evento 3" fill className="object-cover" priority />
          </div>

        </div>

        {/* --- Bloque Interactivos --- */}
        <div className="relative w-full max-w-md mx-auto mt-6 px-4">
          
          {/* Copa Pequeña Flotante al Lado Derecho */}
          <div className="anim-copa-derecha absolute -right-12 sm:-right-20 top-4 w-14 h-14 sm:w-20 sm:h-20 pointer-events-none drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <Image src="/drink2.png" alt="Cóctel Pequeño" fill className="object-contain" />
          </div>

          {/* MENÚ DE BOTONES PRINCIPALES */}
          <div className="flex flex-col gap-4 w-full">
            <Link 
              href="/juegos" 
              className="anim-boton block w-full py-4 rounded-2xl font-sans font-black text-white text-base tracking-wide bg-gradient-to-r from-[#ff3ea5] to-[#9b5de5] shadow-[0_0_25px_rgba(255,62,165,0.45)] hover:shadow-[0_0_40px_rgba(255,62,165,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Entrar a los Juegos
            </Link>

            <Link 
              href="/tu-cancion" 
              className="anim-boton block w-full py-4 rounded-2xl font-sans font-bold text-gray-300 text-base tracking-wide bg-[#0f0b21]/90 border border-[#2b1b4b] hover:border-cyan-500 hover:text-white hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
            >
              Pedir una Canción
            </Link>

            <Link 
              href="/nosotros" 
              className="anim-boton block w-full py-4 rounded-2xl font-sans font-bold text-gray-300 text-base tracking-wide bg-[#0f0b21]/90 border border-[#2b1b4b] hover:border-cyan-500 hover:text-white hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
            >
              Sobre Nosotros
            </Link>
          </div>

          {/* LEMA INFERIOR */}
          <div className="mt-12 px-2">
            <p className="anim-lema-neon font-sans font-black text-xs sm:text-sm text-gray-200 uppercase tracking-widest">
              Descubre una nueva forma de farriar en{' '}
              <span className="contenedor-sopetran relative inline-block">
                <span className="anim-sopetran inline-block text-[#d41a7e] transition-all duration-75 select-none text-[16px] font-semibold">
                  Sopetrán
                </span>
              </span>
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}