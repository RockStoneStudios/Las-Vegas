'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useSocketStore } from '@/lib/store/useSocketStore';
import { useRouter } from 'next/navigation';
import { Music, Gamepad2, Martini } from 'lucide-react';

const COLORES_LUCES = ['#22d3ee', '#ff3ea5', '#9b5de5', '#fbbf24', '#34d399', '#f472b6'];

export default function HeroSection() {
  const contenedorHero = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const socketStore = useSocketStore() as any;
  const { mensajeWS } = useSocketStore();
  
  const [mesaDetectada, setMesaDetectada] = useState<number | null>(null);
  const [solicitando, setSolicitando] = useState(false);
  const [meseroEnCamino, setMeseroEnCamino] = useState(false);
  const [mostrarModalQR, setMostrarModalQR] = useState(false);

  // 🎯 BÚSQUEDA DE LA MESA
  useEffect(() => {
    const buscarMesa = () => {
      const badgeMesa = document.body.innerText.match(/MESA\s*#?(\d+)/i);
      if (badgeMesa && badgeMesa[1]) return parseInt(badgeMesa[1], 10);

      const urlMesa = searchParams.get('mesa') || searchParams.get('table');
      if (urlMesa) return parseInt(urlMesa, 10);

      if (socketStore?.mesa) return parseInt(socketStore.mesa, 10);

      if (typeof window !== 'undefined') {
        const keys = ['mesa', 'numeroMesa', 'table', 'mesaId', 'mesa_id'];
        for (const key of keys) {
          const valLocal = localStorage.getItem(key) || sessionStorage.getItem(key);
          if (valLocal && !isNaN(parseInt(valLocal, 10))) return parseInt(valLocal, 10);
        }
        const cookieMatch = document.cookie.match(/(?:mesa|table|numeroMesa)=(\d+)/i);
        if (cookieMatch && cookieMatch[1]) return parseInt(cookieMatch[1], 10);
      }
      return null;
    };

    const num = buscarMesa();
    if (num) setMesaDetectada(num);
  }, [searchParams, socketStore]);

  // ✅ Solo navega si hay mesa. Si no, abre el modal.
  const handleNavegacionSegura = (ruta: string, necesitaMesa: boolean = true) => {
    if (necesitaMesa && !mesaDetectada) {
      setMostrarModalQR(true);
      return;
    }
    router.push(ruta);
  };

  // 🔥 Solo se usa en la app de la mesa, NO en la página principal
  const handleLlamarMesero = () => {
    return;
  };

  useEffect(() => {
    if (!mensajeWS) return;
    const eventosAtendido = ['EVENT:LLAMADO_ATENDIDO', 'ACTION:CANCELAR_LLAMADO', 'EVENT:LLAMADO_CANCELADO', 'EVENT:MESERO_ATENDIO'];
    if (eventosAtendido.includes(mensajeWS.tipo)) {
      setMeseroEnCamino(false);
    }
  }, [mensajeWS]);

  // 🎬 ANIMACIONES GSAP PRINCIPALES
  useGSAP(() => {
    const tlEntrada = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tlEntrada
      .from('.anim-subtitulo', { opacity: 0, y: -20, duration: 0.8 })
      .from('.anim-titulo', { opacity: 0, scale: 0.95, duration: 1.2 }, '-=0.4')
      .from('.anim-descripcion', { opacity: 0, y: 20, duration: 0.8 }, '-=0.6')
      .from('.anim-tarjeta', { opacity: 0, scale: 0.8, y: 40, stagger: 0.15, duration: 1 }, '-=0.4')
      .from('.anim-boton-explorar', { opacity: 0, scale: 0.5, y: 50, duration: 1.2, ease: 'elastic.out(1, 0.5)' }, '-=0.6')
      .from('.anim-enlaces', { opacity: 0, y: 20, stagger: 0.1, duration: 0.6 }, '-=0.4')
      .from('.anim-copa-derecha', { opacity: 0, x: 30, duration: 1 }, '-=1')
      .from('.anim-lema-neon', { opacity: 0, y: 15, duration: 0.8 }, '-=0.5');

    // 🎨 ANIMACIONES CONTINUAS (Neón y Luces)
    gsap.to('.anim-bar', {
      keyframes: {
        '0%': { opacity: 1, textShadow: '0 0 4px #fff, 0 0 12px #fff' },
        '50%': { opacity: 0.3, textShadow: 'none' },
        '100%': { opacity: 1, textShadow: '0 0 4px #fff, 0 0 12px #fff' }
      },
      duration: 3,
      repeat: -1,
      ease: 'none'
    });

    gsap.to('.anim-sopetran', {
      keyframes: {
        '0%': { opacity: 1, textShadow: '0 0 4px #ff3ea5, 0 0 12px #9b5de5' },
        '50%': { opacity: 0.2, textShadow: 'none' },
        '100%': { opacity: 1, textShadow: '0 0 4px #ff3ea5, 0 0 12px #9b5de5' }
      },
      duration: 2.5,
      repeat: -1,
      ease: 'none'
    });

    // 💗 BOTÓN EXPLORAR LATIENDO
    gsap.to('.anim-boton-explorar', {
      scale: 1.05,
      boxShadow: '0 0 50px rgba(255,62,165,0.8), 0 0 100px rgba(155,93,229,0.6)',
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // 🌿 ANIMACIÓN DE LAS HOJAS (Flotando, girando y balanceándose)
    gsap.to('.anim-hoja-izquierda', {
      y: 10,
      rotation: -10,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to('.anim-hoja-derecha', {
      y: 10,
      rotation: 10,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to('.anim-hoja-abajo-izquierda', {
      y: -8,
      rotation: 12,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to('.anim-hoja-abajo-derecha', {
      y: -8,
      rotation: -12,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to('.anim-contenedor-tarjetas', { y: 8, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.anim-copa-derecha', { y: -6, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    // 🍸 ANIMACIÓN DE LA COPA IZQUIERDA
    gsap.to('.anim-copa-izquierda', {
      y: -6,
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // 💎 ANIMACIÓN DE LAS TARJETAS
    gsap.to('.anim-beneficio', { y: 6, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut' });

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

  }, { scope: contenedorHero });

  return (
    <>
      <section 
        ref={contenedorHero} 
        className="relative w-full min-h-[calc(100dvh-70px)] bg-[#060413] flex flex-col items-center justify-between overflow-hidden px-4 py-2 select-none"
      >
        <style jsx global>{`
          @keyframes letraNeon {
            0%, 42% { opacity: 1; text-shadow: 0 0 4px #fff, 0 0 10px #22d3ee; }
            50% { opacity: 0.25; text-shadow: none; }
            58%, 100% { opacity: 1; text-shadow: 0 0 4px #fff, 0 0 10px #22d3ee; }
          }
          .letra-secuencial { animation: letraNeon 3s ease-in-out infinite; }
          
          @keyframes moverNeon {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .borde-neon-animado {
            animation: moverNeon 4s linear infinite;
          }
        `}</style>

        {/* LUCES DE FONDO */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {COLORES_LUCES.map((color, i) => (
            <div
              key={i}
              className="luz-disco absolute w-[30vw] h-[30vw] max-w-[300px] max-h-[300px] rounded-full blur-[120px]"
              style={{
                backgroundColor: color,
                left: '50%',
                top: '50%',
                opacity: 0.15,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        {/* 🌿 HOJAS ARRIBA Y ABAJO */}
        <div className="anim-hoja-izquierda absolute top-0 left-0 w-20 h-20 sm:w-28 sm:h-28 pointer-events-none origin-top-left z-20">
          <Image src="/hoja-leaf.png" alt="Hoja Izquierda" width={140} height={140} className="object-contain" priority />
        </div>
        <div className="anim-hoja-derecha absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28 pointer-events-none origin-top-right z-20">
          <Image src="/hoja-right.png" alt="Hoja Derecha" width={140} height={140} className="object-contain" priority />
        </div>

        <div className="anim-hoja-abajo-izquierda absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 pointer-events-none origin-bottom-left z-20">
          <Image src="/hoja-leaf.png" alt="Hoja Izquierda" width={140} height={140} className="object-contain" priority />
        </div>
        <div className="anim-hoja-abajo-derecha absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 pointer-events-none origin-bottom-right z-20">
          <Image src="/hoja-right.png" alt="Hoja Derecha" width={140} height={140} className="object-contain" priority />
        </div>

        {/* Contenido Central */}
        <div className="relative z-20 max-w-6xl mx-auto flex flex-col items-center gap-2 w-full my-auto">

          {/* Título */}
          <h1 className="anim-titulo font-orbitron font-black text-4xl sm:text-6xl md:text-7xl text-white uppercase tracking-wider leading-none text-center">
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
          <p className="anim-descripcion font-space font-medium text-[11.5px] mt-2 sm:text-xs text-gray-300 text-center">
            Escanea el QR de tu mesa y participa en los concursos y sorpresas
          </p>

          {/* 📸 TARJETAS 10% MÁS PEQUEÑAS */}
          <div className="anim-contenedor-tarjetas my-2 flex items-center justify-center gap-2 pointer-events-none drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]">
            <div className="anim-tarjeta relative w-36 h-48 sm:w-50 sm:h-64 md:w-56 md:h-72 border border-cyan-400/80 bg-[#0f0b21]/95 rounded-l-2xl overflow-hidden tarjeta-shadow-cyan z-10">
              <Image src="/lasvegas-14.jpg" alt="Evento 1" fill className="object-cover" priority />
            </div>
            <div className="anim-tarjeta relative w-40 h-52 sm:w-54 sm:h-68 md:w-60 md:h-76 border border-[#ff3ea5]/80 bg-[#0f0b21]/95 rounded-lg overflow-hidden tarjeta-shadow-fucsia z-20 -mx-3 sm:-mx-4">
              <Image src="/vegast.jpeg" alt="Evento 2" fill className="object-cover" priority />
            </div>
            <div className="anim-tarjeta relative w-36 h-48 sm:w-50 sm:h-64 md:w-56 md:h-72 border border-[#9b5de5]/80 bg-[#0f0b21]/95 rounded-r-2xl overflow-hidden tarjeta-shadow-violeta z-10">
              <Image src="/drin1.png" alt="Evento 3" fill className="object-cover" priority />
            </div>
          </div>

          {/* 📢 TEXTO LLAMATIVO */}
          <p className="anim-texto-llamativo font-orbitron font-black text-lg sm:text-2xl md:text-3xl text-[#AAEEAA] uppercase tracking-widest text-center mt-10 mb-4 [text-shadow:0_0_5px_rgba(255,255,255,0.8),0_0_15px_rgba(255,255,255,0.5),0_0_30px_rgba(255,215,0,0.4)]">
            ¡La Mejor Rumba en Sopetrán!
          </p>

          {/* 📊 TARJETAS DE BENEFICIOS (Más contenido, sin OFFLINE, más grandes) */}
          <div className="mt-8 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            {/* Música en Vivo */}
            <div className="relative group p-[2px] rounded-2xl overflow-hidden transition-all duration-300 anim-beneficio">
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl">
                <div className="borde-neon-animado aspect-square w-[250%] origin-center transition-all duration-500 bg-[conic-gradient(from_0deg,#00f3ff,transparent,#ff007f,transparent,#00f3ff)] opacity-60 group-hover:opacity-100" />
              </div>
              <div className="relative z-10 w-full h-full rounded-[14px] p-8 flex flex-col items-center text-center gap-4 transition-all duration-300 select-none bg-[#090714] hover:bg-[#0d091f]">
                <div className="relative z-10 my-1">
                  <Music className="w-16 h-16 text-white filter drop-shadow-[0_0_12px_rgba(0,243,255,0.8)] group-hover:scale-110 transition-all" />
                </div>
                <h3 className="relative z-10 font-orbitron font-black text-white text-2xl tracking-wider uppercase leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
                  Música en Vivo
                </h3>
                <div className="relative z-10 font-space font-bold text-sm leading-relaxed tracking-wide">
                  <p className="text-gray-300">DJ en cabina y música para todos los gustos.</p>
                  <p className="text-gray-400 mt-2">Los mejores éxitos y ritmos para que la fiesta no pare.</p>
                </div>
              </div>
            </div>

            {/* Juegos y Premios */}
            <div className="relative group p-[2px] rounded-2xl overflow-hidden transition-all duration-300 anim-beneficio">
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl">
                <div className="borde-neon-animado aspect-square w-[250%] origin-center transition-all duration-500 bg-[conic-gradient(from_0deg,#00f3ff,transparent,#ff007f,transparent,#00f3ff)] opacity-60 group-hover:opacity-100" />
              </div>
              <div className="relative z-10 w-full h-full rounded-[14px] p-8 flex flex-col items-center text-center gap-4 transition-all duration-300 select-none bg-[#090714] hover:bg-[#0d091f]">
                <div className="relative z-10 my-1">
                  <Gamepad2 className="w-16 h-16 text-white filter drop-shadow-[0_0_12px_rgba(0,243,255,0.8)] group-hover:scale-110 transition-all" />
                </div>
                <h3 className="relative z-10 font-orbitron font-black text-white text-2xl tracking-wider uppercase leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
                  Juegos y Premios
                </h3>
                <div className="relative z-10 font-space font-bold text-sm leading-relaxed tracking-wide">
                  <p className="text-gray-300">Ruleta, concursos y premios para tu mesa.</p>
                  <p className="text-gray-400 mt-2">Participa y gana sorpresas mientras disfrutas la noche.</p>
                </div>
              </div>
            </div>

            {/* Cócteles */}
            <div className="relative group p-[2px] rounded-2xl overflow-hidden transition-all duration-300 anim-beneficio">
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl">
                <div className="borde-neon-animado aspect-square w-[250%] origin-center transition-all duration-500 bg-[conic-gradient(from_0deg,#00f3ff,transparent,#ff007f,transparent,#00f3ff)] opacity-60 group-hover:opacity-100" />
              </div>
              <div className="relative z-10 w-full h-full rounded-[14px] p-8 flex flex-col items-center text-center gap-4 transition-all duration-300 select-none bg-[#090714] hover:bg-[#0d091f]">
                <div className="relative z-10 my-1">
                  <Martini className="w-16 h-16 text-white filter drop-shadow-[0_0_12px_rgba(0,243,255,0.8)] group-hover:scale-110 transition-all" />
                </div>
                <h3 className="relative z-10 font-orbitron font-black text-white text-2xl tracking-wider uppercase leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
                  Cócteles
                </h3>
                <div className="relative z-10 font-space font-bold text-sm leading-relaxed tracking-wide">
                  <p className="text-gray-300">Bebidas y cócteles premium para la fiesta.</p>
                  <p className="text-gray-400 mt-2">Sabores exóticos y las mejores marcas para brindar.</p>
                </div>
              </div>
            </div>
          </div>

          {/* BOTONES */}
          <div className="relative w-full max-w-md mx-auto mt-8">
            
            {/* 🍸 COPA IZQUIERDA FLOTANTE (Ajustada para responsive) */}
            <div className="anim-copa-izquierda absolute left-0 sm:left-2 -top-6 w-10 h-10 sm:w-16 sm:h-16 pointer-events-none z-30">
              <Image src="/drink2.png" alt="Cóctel Izquierdo" fill className="object-contain" />
            </div>

            <div className="anim-copa-derecha absolute right-0 sm:right-2 -top-6 w-10 h-10 sm:w-14 sm:h-14 pointer-events-none z-30">
              <Image src="/drink2.png" alt="Cóctel Pequeño" fill className="object-contain" />
            </div>

            {/* 💎 EXPLORAR (Informativo, no requiere mesa) */}
            <div className="grid grid-cols-1 gap-2 w-full">
              <button
                onClick={() => router.push('/nosotros')}
                className={`anim-boton-explorar col-span-1 w-full py-5 rounded-2xl font-orbitron font-black text-lg sm:text-xl tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-2 border-white/20 bg-gradient-to-r from-[#ff3ea5] to-[#9b5de5] text-white shadow-[0_0_40px_rgba(255,62,165,0.6)] hover:scale-[1.03] active:scale-[0.97]`}
              >
                <span className="text-3xl">🎉</span>
                <span>
                  EXPLORAR
                </span>
              </button>
            </div>

            {/* ENLACES MINIMALISTAS CON HOVER */}
            <div className="mt-3 flex items-center justify-center gap-6">
              <button 
                onClick={() => handleNavegacionSegura('/juegos', true)}
                className="anim-enlaces font-space font-bold text-xs sm:text-sm text-gray-300 hover:text-white transition-all duration-300"
              >
                🎮 Juegos
              </button>

              <span className="text-gray-600">|</span>

              <button 
                onClick={() => handleNavegacionSegura('/tu-cancion', true)}
                className="anim-enlaces font-space font-medium text-xs sm:text-sm text-gray-300 hover:text-white transition-all duration-300"
              >
                🎵 Pedir Canción
              </button>

              <span className="text-gray-600">|</span>

              <Link 
                href="/nosotros" 
                className="anim-enlaces font-space font-medium text-xs sm:text-sm text-gray-300 hover:text-white transition-all duration-300"
              >
                ℹ️ Sobre Nosotros
              </Link>
            </div>

            <div className="mt-3 text-center">
              <p className="anim-lema-neon font-space font-bold text-[9px] sm:text-[10px] text-gray-300 uppercase tracking-widest">
                Descubre una nueva forma de farriar en{' '}
                <span className="contenedor-sopetran relative inline-block">
                  <span className="anim-sopetran inline-block text-[#d41a7e] select-none font-orbitron font-black tracking-wider">
                    Sopetrán
                  </span>
                </span>
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 🔥 MODAL NEÓN: ESCANEAR QR PARA ACTIVAR */}
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