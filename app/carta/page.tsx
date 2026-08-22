'use client';

import { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Wine, Sparkles, Citrus, Beer, FlaskConical, Martini, GlassWater, ArrowLeft, ArrowRight } from 'lucide-react';

const MENU_DATA = [
  {
    categoria: 'Cervezas',
    icono: Beer,
    color: 'text-amber-400',
    borderColor: 'border-amber-400',
    items: [
      { id: 101, name: 'Pilsen', description: 'Cerveza clásica, suave y refrescante.', price: '$5,000' },
      { id: 102, name: 'Negra', description: 'Cerveza oscura con notas de caramelo y café.', price: '$5,000' },
      { id: 103, name: 'Light', description: 'Cerveza ligera con bajo contenido calórico.', price: '$5,500' },
      { id: 104, name: 'Club Colombia', description: 'Cerveza premium, sabor suave y equilibrado.', price: '$6,000' },
      { id: 105, name: 'Corona', description: 'Cerveza clara de origen mexicano, muy refrescante.', price: '$8,000' },
    ]
  },
  {
    categoria: 'Aguardiente',
    icono: FlaskConical,
    color: 'text-amber-200',
    borderColor: 'border-amber-200',
    items: [
      { id: 201, name: 'Media Antioqueño', description: 'Aguardiente antioqueño, media botella.', price: '$60.000' },
      { id: 202, name: 'Litro Antioqueño', description: 'Aguardiente antioqueño, botella completa.', price: '$140.000' },
      { id: 203, name: 'Garrafa Antioqueño', description: 'Aguardiente antioqueño, garrafa de 3 litros.', price: '$180.000' },
      { id: 204, name: 'Media Amarillo', description: 'Aguardiente Amarillo, media botella.', price: '$70.000' },
      { id: 205, name: 'Litro Amarillo', description: 'Aguardiente Amarillo, botella completa.', price: '$140.000' },
      { id: 206, name: 'Garrafa Amarillo', description: 'Aguardiente Amarillo, garrafa de 3 litros.', price: '$180.000' },
    ]
  },
  {
    categoria: 'Rones',
    icono: GlassWater,
    color: 'text-amber-600',
    borderColor: 'border-amber-600',
    items: [
      { id: 301, name: 'Ron Medellín Añejo', description: 'Ron añejo de la casa, suave al paladar.', price: '$35,000' },
      { id: 302, name: 'Ron Medellín 8 Años', description: 'Edición limitada, 8 años de maduración.', price: '$70,000' },
      { id: 303, name: 'Ron Medellín 12 Años', description: 'Premium, 12 años de envejecimiento.', price: '$120,000' },
    ]
  },
  {
    categoria: 'Cócteles',
    icono: Martini,
    color: 'text-pink-500',
    borderColor: 'border-pink-500',
    items: [
      { id: 401, name: 'Daiquiri', description: 'Ron, jugo de limón y azúcar.', price: '$15,000' },
      { id: 402, name: 'Peach Mojito', description: 'Ron con durazno, menta y lima.', price: '$15,000' },
      { id: 403, name: 'Manhattan', description: 'Whiskey mezclado con vermouth.', price: '$18,000' },
    ]
  }
];

export default function LasVegasMenu() {
  const [paginaActual, setPaginaActual] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const totalPaginas = MENU_DATA.length;
  const pagina = MENU_DATA[paginaActual];

  // Animación de entrada inicial (Ajustada para la altura)
  useGSAP(() => {
    if (!cardRef.current || !contentRef.current) return;
    gsap.fromTo(cardRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' });
    gsap.fromTo(contentRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.2 });
  }, { scope: containerRef });

  // Animación de cambio de categoría (GSAP suave)
  const cambiarPagina = (nuevaPagina: number) => {
    if (!contentRef.current) return;
    gsap.to(contentRef.current, {
      y: -20,
      opacity: 0,
      duration: 0.2,
      ease: 'power1.in',
      onComplete: () => {
        setPaginaActual(nuevaPagina);
        gsap.fromTo(contentRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' });
      }
    });
  };

  const handleNext = () => { if (paginaActual < totalPaginas - 1) cambiarPagina(paginaActual + 1); };
  const handlePrev = () => { if (paginaActual > 0) cambiarPagina(paginaActual - 1); };

  return (
    <main ref={containerRef} className="min-h-screen w-full bg-[#0a0512] flex items-center justify-center p-4 sm:p-8 font-sans overflow-hidden relative select-none">
      
      <div className="absolute top-10 left-10 w-96 h-96 bg-pink-600/30 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/25 rounded-full blur-[130px] pointer-events-none" />

      {/* Marco Principal (Aumentado en padding y altura) */}
      <div ref={cardRef} className="relative w-full max-w-lg bg-[#0d0718]/90 backdrop-blur-xl rounded-2xl p-8 sm:p-12 border-2 border-pink-500 shadow-[0_0_25px_#ec4899,inset_0_0_15px_#ec4899] transition-all">
        <div className="absolute inset-2 rounded-xl border border-cyan-400 shadow-[0_0_15px_#22d3ee] pointer-events-none" />

        {/* Encabezado */}
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
            LAS VEGAS
          </h1>
          <p className="text-cyan-400 text-xs sm:text-sm tracking-[0.3em] font-semibold uppercase mt-1 drop-shadow-[0_0_8px_#22d3ee]">
            DISCOBAR
          </p>
        </div>

        {/* Contenido de la página (min-h aumentado a 420px para que quepa todo verticalmente) */}
        <div 
          ref={contentRef} 
          className="relative w-full min-h-[420px] bg-black/30 rounded-xl p-6 border border-white/5"
        >
          {/* 🍺 ICONO DE CERVEZA EN LA ESQUINA INFERIOR IZQUIERDA */}
          <div className="absolute -bottom-6 -left-6 text-amber-400/40 drop-shadow-[0_0_10px_#f59e0b] pointer-events-none">
            <Beer className="w-12 h-12" />
          </div>

          {/* Encabezado de Categoría */}
          <div className="flex items-center gap-3 mb-5">
            <div className={`p-2 rounded-xl border-2 ${pagina.borderColor} shadow-[0_0_10px_currentColor]`}>
              <pagina.icono className={`w-6 h-6 ${pagina.color}`} />
            </div>
            <h2 className={`text-xl font-black tracking-wider ${pagina.color} drop-shadow-[0_0_6px_currentColor]`}>
              {pagina.categoria}
            </h2>
          </div>

          {/* Items de la categoría (Ajustado el gap para distribución uniforme) */}
          <div className="space-y-4">
            {pagina.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl border-2 ${pagina.borderColor} bg-black/50 flex items-center justify-center shrink-0`}>
                  <pagina.icono className={`w-5 h-5 ${pagina.color} opacity-80`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-black text-sm sm:text-base tracking-wider text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]">
                      {item.name}
                    </h3>
                    <span className="text-amber-400 font-bold text-xs sm:text-sm drop-shadow-[0_0_6px_#f59e0b]">
                      {item.price}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[10px] sm:text-xs tracking-wide leading-tight mt-0.5 uppercase">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controles de navegación (Ajustados con más margen superior para dar aire) */}
        <div className="flex items-center justify-between mt-6">
          <button 
            onClick={handlePrev}
            disabled={paginaActual === 0}
            className={`p-2 rounded-xl border border-cyan-400 text-cyan-400 transition-all hover:bg-cyan-400/20 ${paginaActual === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <span className="text-zinc-400 font-mono text-xs">
            {paginaActual + 1} / {totalPaginas}
          </span>

          <button 
            onClick={handleNext}
            disabled={paginaActual === totalPaginas - 1}
            className={`p-2 rounded-xl border border-pink-500 text-pink-500 transition-all hover:bg-pink-500/20 ${paginaActual === totalPaginas - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Decoración Neón */}
        <div className="absolute -top-5 -right-5 text-pink-400 drop-shadow-[0_0_10px_#ec4899]">
          <Sparkles className="w-10 h-10" />
        </div>
        <div className="absolute -top-4 -left-4 text-lime-400 drop-shadow-[0_0_10px_#a3e635]">
          <Citrus className="w-10 h-10" />
        </div>

      </div>
    </main>
  );
}