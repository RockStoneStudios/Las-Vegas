'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const COLORES_LUCES = ['#22d3ee', '#ff3ea5', '#9b5de5', '#fbbf24', '#34d399', '#f472b6'];

export default function HeroSection() {
  const contenedorHero = useRef<HTMLDivElement>(null);
  const contenedorParticulasIzq = useRef<HTMLDivElement>(null);
  const contenedorParticulasDer = useRef<HTMLDivElement>(null);

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

    // 2. ANIMACIONES INFINITAS DE NEÓN DE TEXTO
    gsap.to('.anim-bar', {
      keyframes: {
        '0%': { opacity: 1, textShadow: '0 0 4px #fff, 0 0 12px #fff' },
        '7%': { opacity: 0.85, textShadow: '0 0 2px #fff, 0 0 6px #fff' },
        '8%': { opacity: 1, textShadow: '0 0 4px #fff, 0 0 12px #fff' },
        '12%': { opacity: 0.3, textShadow: 'none' },
        '14%': { opacity: 1, textShadow: '0 0 4px #fff, 0 0 12px #fff' },
        '30%': { opacity: 1, textShadow: '0 0 4px #fff, 0 0 12px #fff' },
        '32%': { opacity: 0.2, textShadow: 'none' },
        '34%': { opacity: 1, textShadow: '0 0 4px #fff, 0 0 12px #fff' },
        '70%': { opacity: 1, textShadow: '0 0 4px #fff, 0 0 12px #fff' },
        '72%': { opacity: 0.3, textShadow: 'none' },
        '73%': { opacity: 1, textShadow: '0 0 4px #fff, 0 0 12px #fff' },
        '100%': { opacity: 1, textShadow: '0 0 4px #fff, 0 0 12px #fff' }
      },
      duration: 4,
      repeat: -1,
      ease: 'none',
      onUpdate: function() {
        const targets = this.targets();
        if (targets && targets[0]) {
          const currentOpacity = gsap.getProperty(targets[0], 'opacity') as number;
          if (currentOpacity < 0.5 && Math.random() > 0.4) {
            crearChispaBlanca();
          }
        }
      }
    });

    gsap.to('.anim-sopetran', {
      keyframes: {
        '0%': { opacity: 1, textShadow: '0 0 4px #ff3ea5, 0 0 12px #9b5de5' },
        '4%': { opacity: 0.2, textShadow: 'none' },
        '6%': { opacity: 1, textShadow: '0 0 8px #ff3ea5, 0 0 16px #9b5de5' },
        '9%': { opacity: 0.3, textShadow: 'none' },
        '11%': { opacity: 1, textShadow: '0 0 4px #ff3ea5, 0 0 12px #9b5de5' },
        '50%': { opacity: 1, textShadow: '0 0 4px #ff3ea5, 0 0 12px #9b5de5' },
        '52%': { opacity: 0.2, textShadow: 'none' },
        '54%': { opacity: 1, textShadow: '0 0 6px #ff3ea5, 0 0 14px #9b5de5' },
        '100%': { opacity: 1, textShadow: '0 0 4px #ff3ea5, 0 0 12px #9b5de5' }
      },
      duration: 3,
      repeat: -1,
      ease: 'none',
      onUpdate: function() {
        const targets = this.targets();
        if (targets && targets[0]) {
          const currentOpacity = gsap.getProperty(targets[0], 'opacity') as number;
          if (currentOpacity < 0.5 && Math.random() > 0.5) {
            crearChispaVioleta();
          }
        }
      }
    });

    function crearChispaBlanca() {
      const contenedorBar = document.querySelector('.contenedor-bar');
      if (!contenedorBar) return;
      const chispa = document.createElement('span');
      chispa.className = 'absolute w-[2px] h-[6px] sm:w-[3px] h-[8px] bg-white rounded-full pointer-events-none z-50';
      chispa.style.boxShadow = '0 0 4px #fff';
      chispa.style.left = `${Math.random() * 100}%`;
      chispa.style.top = '80%';
      contenedorBar.appendChild(chispa);

      gsap.to(chispa, {
        x: (Math.random() - 0.5) * 40,
        y: Math.random() * 150 + 80,
        rotation: (Math.random() - 0.5) * 45,
        scaleY: 0.2,
        opacity: 0,
        duration: Math.random() * 0.6 + 0.4,
        ease: 'power1.in',
        onComplete: () => chispa.remove()
      });
    }

    function crearChispaVioleta() {
      const contenedorSopetran = document.querySelector('.contenedor-sopetran');
      if (!contenedorSopetran) return;
      const chispa = document.createElement('span');
      chispa.className = 'absolute w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white pointer-events-none z-50';
      chispa.style.boxShadow = '0 0 5px #ff3ea5';
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

    // 3. FLOTACIÓN DE ELEMENTOS
    gsap.to('.anim-contenedor-tarjetas', { y: 12, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.anim-copa-derecha', { y: -8, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.anim-hoja-izquierda', { rotate: 8, x: 5, y: 5, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.anim-hoja-derecha', { rotate: -8, x: -5, y: 4, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.anim-hoja-inf-izq', { rotate: 1, x: 1, y: 1, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.anim-hoja-inf-der', { rotate: -1, x: -1, y: 1, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    // 4. LUCES DE DISCO DE FONDO
    function moverLuz(el: Element) {
      gsap.to(el, {
        x: gsap.utils.random(-window.innerWidth * 0.4, window.innerWidth * 0.4),
        y: gsap.utils.random(-window.innerHeight * 0.4, window.innerHeight * 0.4),
        scale: gsap.utils.random(0.8, 1.6),
        opacity: gsap.utils.random(0.08, 0.22),
        duration: gsap.utils.random(5, 10),
        ease: 'sine.inOut',
        onComplete: () => moverLuz(el),
      });
      gsap.to(el, {
        backgroundColor: COLORES_LUCES[Math.floor(Math.random() * COLORES_LUCES.length)],
        duration: gsap.utils.random(4, 8),
        ease: 'sine.inOut',
      });
    }

    const luces = gsap.utils.toArray('.luz-disco');
    luces.forEach((luz, i) => {
      gsap.set(luz as Element, {
        x: gsap.utils.random(-window.innerWidth * 0.2, window.innerWidth * 0.2),
        y: gsap.utils.random(-window.innerHeight * 0.2, window.innerHeight * 0.2),
        scale: gsap.utils.random(0.8, 1.3),
        opacity: gsap.utils.random(0.08, 0.18),
      });
      gsap.delayedCall(i * 0.5, () => moverLuz(luz as Element));
    });

    // 5. ⚡ CHISPAS DE CORTOCIRCUITO ELÉCTRICO NEÓN (SOLO PUNTOS MULTICOLOR)
// ⚡ PUNTOS NEÓN ELÉCTRICOS (Sutiles, 100% redondos, sin movimiento que los alargue)
const generarPuntoElectrico = (contenedor: HTMLDivElement | null) => {
  if (!contenedor) return;

  // Creamos un único punto redondo
  const p = document.createElement('div');
  const color = COLORES_LUCES[Math.floor(Math.random() * COLORES_LUCES.length)];
  
  // 1. TAMAÑO DEL PUNTO: Aquí defines el diámetro exacto (ej. 4px a 8px)
  const tamaño = gsap.utils.random(4, 8); 

  p.style.position = 'absolute';
  p.style.width = `${tamaño}px`;
  p.style.height = `${tamaño}px`;
  p.style.borderRadius = '50%'; // Garantiza forma esférica perfecta
  p.style.backgroundColor = '#ffffff'; // Centro incandescente blanco
  p.style.boxShadow = `0 0 6px #fff, 0 0 12px ${color}`;
  p.style.left = `${gsap.utils.random(10, 90)}%`;
  p.style.top = `${gsap.utils.random(15, 85)}%`;
  p.style.pointerEvents = 'none';

  contenedor.appendChild(p);

  // 2. ANIMACIÓN SIN ARRASTRE: El punto solo aparece, parpadea en su sitio y desaparece
  gsap.fromTo(p, 
    { 
      opacity: 0, 
      scale: 0 
    }, 
    {
      opacity: 1,
      scale: 1.2,
      duration: 0.15, // Aparición rápida tipo chispazo eléctrico
      yoyo: true,
      repeat: 3, // Parpadea 3 veces en el mismo punto exacto
      ease: 'steps(2)', // Corte seco eléctrico, cero suavizado que estire el punto
      onComplete: () => p.remove()
    }
  );
};

// 3. CANTIDAD REDUCIDA: Intervalo más alto (800ms) para que aparezcan pocos puntos y no sea cargado
const intervalIzq = setInterval(() => generarPuntoElectrico(contenedorParticulasIzq.current), 500);
const intervalDer = setInterval(() => generarPuntoElectrico(contenedorParticulasDer.current), 200);

    return () => {
      clearInterval(intervalIzq);
      clearInterval(intervalDer);
    };

  }, { scope: contenedorHero });

  return (
    <section 
      ref={contenedorHero} 
      className="relative w-full min-h-[calc(100dvh-80px)] bg-[#060413] flex flex-col items-center justify-start overflow-hidden px-4 py-6 select-none"
    >
      <style jsx global>{`
        @keyframes letraNeon {
          0%, 42% {
            opacity: 1;
            text-shadow: 0 0 4px #fff, 0 0 10px #22d3ee;
          }
          50% {
            opacity: 0.25;
            text-shadow: none;
          }
          58%, 100% {
            opacity: 1;
            text-shadow: 0 0 4px #fff, 0 0 10px #22d3ee;
          }
        }
        .letra-secuencial {
          animation: letraNeon 3s ease-in-out infinite;
        }
        
        .tarjeta-shadow-cyan {
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.25), 0 0 40px rgba(34, 211, 238, 0.1);
        }
        .tarjeta-shadow-fucsia {
          box-shadow: 0 0 20px rgba(255, 62, 165, 0.3), 0 0 40px rgba(255, 62, 165, 0.1);
        }
        .tarjeta-shadow-violeta {
          box-shadow: 0 0 20px rgba(155, 93, 229, 0.25), 0 0 40px rgba(155, 93, 229, 0.1);
        }
      `}</style>

      {/* ⚡ FRANZAS LATERALES PARA PUNTOS ELÉCTRICOS EN PANTALLAS GRANDES */}
      <div 
        ref={contenedorParticulasIzq} 
        className="hidden md:block absolute left-0 top-0 w-[24vw] h-full pointer-events-none z-10 overflow-hidden" 
      />
      <div 
        ref={contenedorParticulasDer} 
        className="hidden md:block absolute right-0 top-0 w-[24vw] h-full pointer-events-none z-10 overflow-hidden" 
      />

      {/* LUCES DE DISCOTECA DE FONDO */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {COLORES_LUCES.map((color, i) => (
          <div
            key={i}
            className="luz-disco absolute w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] rounded-full blur-[140px]"
            style={{
              backgroundColor: color,
              left: '50%',
              top: '50%',
              opacity: 0.15,
              transform: 'translate(-50%, -50%)',
              willChange: 'transform, opacity, background-color',
            }}
          />
        ))}
      </div>

      {/* Luces de Ambiente fijas */}
      <div className="absolute top-1/4 left-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-purple-900/20 to-pink-600/10 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-10 right-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyan-900/15 blur-[180px] pointer-events-none" />

      {/* Hojas */}
      <div className="anim-hoja-izquierda absolute top-6 left-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 pointer-events-none origin-top-left z-20">
        <Image src="/hoja-leaf.png" alt="Hoja Superior Izquierda" width={160} height={160} className="object-contain" priority />
      </div>
      <div className="anim-hoja-derecha absolute top-6 right-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 pointer-events-none origin-top-right z-20">
        <Image src="/hoja-right.png" alt="Hoja Superior Derecha" width={160} height={160} className="object-contain" priority />
      </div>
      <div className="anim-hoja-inf-izq absolute bottom-6 left-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 pointer-events-none origin-bottom-left rotate-180 z-20">
        <Image src="/hoja-leaf.png" alt="Hoja Inferior Izquierda" width={160} height={160} className="object-contain" priority />
      </div>
      <div className="anim-hoja-inf-der absolute bottom-6 right-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 pointer-events-none origin-bottom-right rotate-180 z-20">
        <Image src="/hoja-right.png" alt="Hoja Inferior Derecha" width={160} height={160} className="object-contain" priority />
      </div>

      {/* Contenido Central */}
      <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center gap-3 pt-4 sm:pt-8 w-full px-4">

        {/* Título */}
        <h1 className="anim-titulo font-orbitron font-black text-5xl sm:text-7xl md:text-8xl text-white uppercase tracking-wider leading-none text-center">
          {'Las Vegas'.split('').map((letra, i) => (
            <span
              key={i}
              className="letra-secuencial inline-block"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              {letra === ' ' ? '\u00A0' : letra}
            </span>
          ))}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
            Disco
          </span>
          <span className="contenedor-bar relative inline-block">
            <span className="anim-bar text-white transition-all duration-75 ml-1">
              Bar
            </span>
          </span>
        </h1>

        {/* Descripción */}
        <p className="anim-descripcion font-space font-medium text-[11px] xs:text-xs sm:text-base text-gray-300 whitespace-nowrap mt-1 text-center">
          Escanea el QR de tu mesa y participa en los concursos y sorpresas
        </p>

        {/* Tarjetas */}
        <div className="anim-contenedor-tarjetas mt-4 flex items-center justify-center gap-0 pointer-events-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
          
          <div className="anim-tarjeta relative w-28 h-36 sm:w-40 sm:h-52 md:w-52 md:h-64 border border-cyan-400/80 bg-[#0f0b21]/95 rounded-l-3xl overflow-hidden tarjeta-shadow-cyan z-10">
            <Image src="/lasvegas-14.jpg" alt="Evento 1" fill className="object-cover" priority />
          </div>

          <div className="anim-tarjeta relative w-32 h-40 sm:w-44 sm:h-56 md:w-56 md:h-68 border border-[#ff3ea5]/80 bg-[#0f0b21]/95 rounded-xl overflow-hidden tarjeta-shadow-fucsia z-20 -mx-2 sm:-mx-4">
            <Image src="/vegast.jpeg" alt="Evento 2" fill className="object-cover" priority />
          </div>

          <div className="anim-tarjeta relative w-28 h-36 sm:w-40 sm:h-52 md:w-52 md:h-64 border border-[#9b5de5]/80 bg-[#0f0b21]/95 rounded-r-3xl overflow-hidden tarjeta-shadow-violeta z-10">
            <Image src="/drin1.png" alt="Evento 3" fill className="object-cover" priority />
          </div>

        </div>

        {/* Bloque Interactivos */}
        <div className="relative w-full max-w-md mx-auto mt-6">
          
          {/* Copa Flotante */}
          <div className="anim-copa-derecha absolute -right-12 sm:-right-16 top-3 w-14 h-14 sm:w-20 sm:h-20 pointer-events-none drop-shadow-[0_0_15px_rgba(34,211,238,0.25)]">
            <Image src="/drink2.png" alt="Cóctel Pequeño" fill className="object-contain" />
          </div>

          {/* BOTONES */}
          <div className="flex flex-col gap-2 sm:gap-3 w-full">
            <Link 
              href="/juegos" 
              className="anim-boton block w-full py-3 sm:py-4 rounded-2xl font-space font-bold text-white text-sm sm:text-base tracking-wide bg-gradient-to-r from-[#ff3ea5] to-[#9b5de5] shadow-[0_0_20px_rgba(255,62,165,0.3)] hover:shadow-[0_0_30px_rgba(255,62,165,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-left px-6"
            >
              🎮 Entrar a los Juegos
            </Link>

            <Link 
              href="/tu-cancion" 
              className="anim-boton block w-full py-3 sm:py-4 rounded-2xl font-space font-medium text-gray-300 text-sm sm:text-base tracking-wide bg-[#0f0b21]/90 border border-[#2b1b4b] hover:border-cyan-500/80 hover:text-white hover:shadow-[0_0_15px_rgba(34,211,238,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 text-left px-6"
            >
              🎵 Pedir una Canción
            </Link>

            <Link 
              href="/nosotros" 
              className="anim-boton block w-full py-3 sm:py-4 rounded-2xl font-space font-medium text-gray-300 text-sm sm:text-base tracking-wide bg-[#0f0b21]/90 border border-[#2b1b4b] hover:border-cyan-500/80 hover:text-white hover:shadow-[0_0_15px_rgba(34,211,238,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 text-left px-6"
            >
              ℹ️ Sobre Nosotros
            </Link>
          </div>

          {/* Lema Inferior */}
          <div className="mt-6 px-2 text-center">
            <p className="anim-lema-neon font-space font-bold text-[10px] sm:text-xs text-gray-200 uppercase tracking-widest">
              Descubre una nueva forma de farriar en{' '}
              <span className="contenedor-sopetran relative inline-block">
                <span className="anim-sopetran inline-block text-[#d41a7e] transition-all duration-75 select-none text-sm sm:text-base font-orbitron font-black tracking-wider">
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