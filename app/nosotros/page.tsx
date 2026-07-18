'use client';

import Image from 'next/image';

export default function Nosotros() {
    // Array de imágenes para el mosaico apuntando a tus archivos locales
    const fotosMosaico = [
        { id: 1, src: '/lasVegas.jpg', alt: 'Luces de neón en la pista', className: 'col-span-2 row-span-2 h-64 md:h-80' },
        { id: 2, src: '/lasvegas1.webp', alt: 'DJ mezclando en vivo', className: 'col-span-1 row-span-1 h-32 md:h-36' },
        { id: 3, src: '/lasvegas2.jpg', alt: 'Cócteles premium con brillo ultravioleta', className: 'col-span-1 row-span-1 h-32 md:h-36' },
        { id: 4, src: '/lasvegas3.jpg', alt: 'Gente disfrutando la rumba', className: 'col-span-2 row-span-1 h-32 md:h-40' },
    ];

    return (
        <main 
            className="relative min-h-screen pt-14 pb-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat flex items-start md:items-center overflow-hidden select-none"
            style={{ backgroundImage: "url('/fondo.webp')" }}
        >
            {/* Capa de superposición para oscurecer el fondo.webp y darle un tinte Neo-Punk */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#060413]/95 via-[#020106]/90 to-[#0a071d]/95 z-0" />

            <div className="relative max-w-7xl mx-auto w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                {/* LADO IZQUIERDO: Mosaico Asimétrico con Next Image */}
                <div className="lg:col-span-6 grid grid-cols-2 gap-4 order-2 lg:order-1">
                    {fotosMosaico.map((foto) => (
                        <div
                            key={foto.id}
                            className={`relative overflow-hidden rounded-2xl border border-[#1f1645] bg-[#0c0824] shadow-[0_0_15px_rgba(31,22,69,0.3)] group hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-300 ${foto.className}`}
                        >
                            {/* Overlay interno con tinte neón al pasar el mouse */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#ff00a0]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                            {/* Componente Image optimizado */}
                            <Image
                                src={foto.src}
                                alt={foto.alt}
                                fill
                                sizes="(max-w-7xl) 50vw, 100vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                priority={foto.id === 1} // Prioridad a la imagen principal del mosaico
                            />
                        </div>
                    ))}
                </div>

                {/* LADO DERECHO: Texto de Historia / Atributos con Estilo Neón */}
                <div className="lg:col-span-6 flex flex-col space-y-6 order-1 lg:order-2 text-left">

                    {/* Tag de Ubicación Superior - Con Orbitron */}
                    <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-md bg-[#ff00a0]/10 border border-[#ff00a0]/40 shadow-[0_0_10px_rgba(255,0,160,0.2)]">
                        <span className="w-2 h-2 rounded-full bg-[#ff00a0] animate-ping" />
                        <span className="font-orbitron font-black text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#ff00a0]">
                            Sopetrán, Antioquia
                        </span>
                    </div>

                    {/* Título Principal - Con Orbitron */}
                    <h1 className="font-orbitron font-black text-4xl sm:text-5xl lg:text-6xl uppercase tracking-wider text-white leading-none">
                        El Epicentro de la <br />
                        <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">
                            Noche Eterna
                        </span>
                    </h1>

                    {/* Línea Separadora Neón Blanco */}
                    <hr className="border-none h-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)] w-24 opacity-80" />

                    {/* Párrafo 1 - Solo "Vegas" se enciende en Cian Eléctrico */}
                    <p className="font-space font-medium text-base sm:text-lg text-gray-300 leading-relaxed">
                        Bajo el hechizo de las luces que encienden la noche y el ritmo imparable de la mejor música,{' '}
                        <span className="font-orbitron font-medium tracking-wide text-white">
                            Las{' '}
                            <span className="font-black text-[#2ee6d6] drop-shadow-[0_0_10px_#2ee6d6,_0_0_25px_#2ee6d6]">
                                Vegas
                            </span>{' '}
                            Discobar
                        </span>{' '}
                        se ha convertido en el epicentro de la vida nocturna en Sopetrán, tierra turística del occidente antioqueño. No somos un simple bar: somos una experiencia sensorial donde la intensidad, el estilo y la autenticidad se viven desde el primer beat.
                    </p>

                    {/* Párrafo 2 - Solo "DiscoBar" se enciende en Violeta Neo-Punk */}
                    <p className="font-space font-normal text-[15px] sm:text-base text-gray-300 leading-relaxed mt-4">
                        Con una ubicación privilegiada, un diseño industrial-neón, acústica de primer nivel y un ambiente seguro, hemos creado el escenario perfecto para noches inolvidables. Por eso, locales y visitantes nos eligen cada fin de semana: porque en{' '}
                        <span className="font-orbitron font-medium tracking-wide text-white">
                            Las Vegas{' '}
                            <span className="font-black text-[#9b5de5] drop-shadow-[0_0_10px_#9b5de5,_0_0_25px_#9b5de5]">
                                DiscoBar
                            </span>
                        </span>
                        , la fiesta no tiene límites.
                    </p>

                    {/* Atributos / Características del Sitio */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">

                        {/* Atributo 3 - Con Orbitron y Space Grotesk */}
                        <div className="p-4 rounded-xl border border-[#1f1645] bg-[#060413]/60 backdrop-blur-sm hover:border-white/40 transition-all duration-300">
                            <h3 className="font-orbitron font-black text-[11px] sm:text-xs uppercase tracking-widest text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] mb-1">
                                🍹 Coctelería Alquímica
                            </h3>
                            <p className="font-space font-normal text-xs text-gray-400 leading-normal">
                                Barras iluminadas con tragos de autor diseñados para brillar en la oscuridad.
                            </p>
                        </div>

                        {/* Atributo 4 - Con Orbitron y Space Grotesk */}
                        <div className="p-4 rounded-xl border border-[#1f1645] bg-[#060413]/60 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300">
                            <h3 className="font-orbitron font-black text-[11px] sm:text-xs uppercase tracking-widest text-purple-400 mb-1">
                                🕹️ Zona Interactiva
                            </h3>
                            <p className="font-space font-normal text-xs text-gray-400 leading-normal">
                                Pantallas y dinámicas integradas en tu mesa para competir por premios reales en vivo.
                            </p>
                        </div>

                    </div>

                </div>

            </div>
        </main>
    );
}