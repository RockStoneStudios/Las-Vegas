'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocketStore } from '@/lib/store/useSocketStore';

// Importamos los componentes separados
import MesaHeader from '@/app/components/mesa/MesaHeader';
import LlamarMeseroBtn from '@/app/components/mesa/LlamarMeseroBtn';
import PanelReacciones from '@/app/components/mesa/PanelReacciones';
import MenuOpciones from '@/app/components/mesa/MenuOpciones';
import ModalesMesa from '@/app/components/mesa/ModalMesa';
import Image from 'next/image';
// 🔥 IMPORTAMOS LA RULETA DE MESAS
import RuletaMesas from '@/app/components/RuletasMesa';
import confetti from 'canvas-confetti';
import gsap from 'gsap';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function PageMesaCliente() {
  const params = useParams();
  const router = useRouter();
  const numeroMesa = Number(params?.id) || 1;
  
  // 🔌 Store de WebSocket
  const { conectarSocket, enviarMensaje, mensajeWS, conectado } = useSocketStore();

  // ========== ESTADOS COMPARTIDOS ==========
  const [sessionIdActiva, setSessionIdActiva] = useState<string | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState<boolean>(true);
  const [errorSesion, setErrorSesion] = useState<string | null>(null);
  const [mesaLimpiada, setMesaLimpiada] = useState<boolean>(false);
  const [meseroEnCamino, setMeseroEnCamino] = useState<boolean>(false);
  const [juegosDesbloqueados, setJuegosDesbloqueados] = useState<string[]>([]);
  const [seccionActiva, setSeccionActiva] = useState<'inicio' | 'juegos_privados' | 'votaciones' | 'cancion' | 'ruleta-premios'>('inicio');
  const [votacionActiva, setVotacionActiva] = useState<any>(null);
  const [votacionIniciada, setVotacionIniciada] = useState(false);
  const [yaVoto, setYaVoto] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(0);

  // 🎰 ESTADOS DE LA RULETA PÚBLICA
  const [animando, setAnimando] = useState<boolean>(false);
  const [mesaGanadoraTarget, setMesaGanadoraTarget] = useState<number | null>(null);
  const [duracionGiroWS, setDuracionGiroWS] = useState<number>(11);
  const [numMesasRuleta, setNumMesasRuleta] = useState<number>(16);
  const [mensajeFinal, setMensajeFinal] = useState<{
    esGanador: boolean;
    titulo: string;
    descripcion: string;
  } | null>(null);

  // 🎁 ESTADO PARA LOS PREMIOS DE LA RULETA
  const [premiosRuleta, setPremiosRuleta] = useState<any[]>([]);

  // 🎵 Control del modo "Pedir Canción"
  const [pedirCancionActivo, setPedirCancionActivo] = useState(false);

  // 🎵 ESTADOS PARA EL MODAL DE CANCIÓN
  const [cancionInput, setCancionInput] = useState('');
  const [autorInput, setAutorInput] = useState('');

  // ========== REDIRECCIÓN AUTOMÁTICA AL CERRAR MESA ==========
    // ========== ANIMACIÓN NEÓN CON GSAP ==========
  // ========== ANIMACIÓN NEÓN CON GSAP ==========
  // ========== REDIRECCIÓN AUTOMÁTICA Y ANIMACIÓN GSAP ==========
  useEffect(() => {
    if (mesaLimpiada) {
      // 1. Iniciar la animación del neón (letras y barra)
      const ctx = gsap.context(() => {
        gsap.fromTo(".neon-letter", 
          { opacity: 0, textShadow: "0 0 0px rgba(255,255,255,0)" },
          { 
            opacity: 1, 
            textShadow: "0 0 10px rgba(120,200,255,0.8), 0 0 20px rgba(120,200,255,0.6), 0 0 30px rgba(59,130,246,0.4)", 
            stagger: 0.08, 
            duration: 0.5,
            ease: "power2.out"
          }
        );

        gsap.fromTo(".neon-progress", 
          { boxShadow: "0 0 5px rgba(59,130,246,0.5)" },
          { 
            boxShadow: "0 0 15px rgba(59,130,246,0.8), 0 0 30px rgba(59,130,246,0.5)", 
            duration: 1, 
            yoyo: true, 
            repeat: -1
          }
        );
      });

      // 2. Redirigir después de 9 segundos (9000 ms)
      const timer = setTimeout(() => {
        router.push('/'); // Redirige a la raíz
      }, 9000);

      // 3. Limpiar tanto la animación como el timer
      return () => {
        clearTimeout(timer);
        ctx.revert();
      };
    }
  }, [mesaLimpiada, router]);

  // ========== INICIALIZACIÓN ==========
  useEffect(() => {
    async function obtenerSesionYConectar() {
      try {
        setCargandoSesion(true);
        const urlParams = new URLSearchParams(window.location.search);
        const tokenMesa = urlParams.get('token');

        let sessionIdObtenido = localStorage.getItem('mesa_sessionId');

        if (tokenMesa) {
          try {
            const res = await fetch(`${API_URL}/api/auth/mesa/${numeroMesa}?token=${tokenMesa}`);
            if (res.ok) {
              const data = await res.json();
              if (data?.sessionId) {
                sessionIdObtenido = data.sessionId as string;
                localStorage.setItem('mesa_sessionId', sessionIdObtenido);
                localStorage.setItem('mesa_numero', String(numeroMesa));
              }
            }
          } catch (fetchErr) {
            console.warn('⚠️ Error fetching token', fetchErr);
          }
        }

        if (!sessionIdObtenido) {
          setErrorSesion('Por favor vuelve a escanear el código QR de tu mesa.');
          return;
        }

        setSessionIdActiva(sessionIdObtenido);
        conectarSocket(sessionIdObtenido, numeroMesa, 'cliente');
      } catch (error: any) {
        setErrorSesion('Error de conexión con el servidor.');
      } finally {
        setCargandoSesion(false);
      }
    }

    if (numeroMesa) obtenerSesionYConectar();
  }, [numeroMesa, conectarSocket]);

  // ========== EVENTOS WEBSOCKET ==========
  useEffect(() => {
    if (!mensajeWS) return;

    const tipo = mensajeWS.tipo;
    const payload = mensajeWS.payload || {};
    console.log('📩 [CLIENTE WS] Evento recibido:', tipo, payload);

    // 🔴 0. CERRAR MESA / LIMPIAR MESA
    if (tipo === 'EVENT:MESA_CERRADA' || tipo === 'EVENT:MESA_LIMPIADA' || tipo === 'ACTION:CERRAR_MESA') {
      const mesaEvento = payload.mesa ?? payload.numeroMesa;
      if (mesaEvento && Number(mesaEvento) !== Number(numeroMesa)) {
        return;
      }
      console.log('🔴 [CLIENTE] La mesa ha sido cerrada/limpiada');
      setMesaLimpiada(true);
      localStorage.removeItem('mesa_sessionId');
      localStorage.removeItem('mesa_numero');
      return;
    }

    // 🎵 NUEVO: Evento del modo "Pedir Canción"
    if (tipo === 'EVENT:MODO_PEDIR_CANCION') {
      console.log('🎵 [CLIENTE] Modo Pedir Canción cambiado a:', payload.activo);
      setPedirCancionActivo(payload.activo);
      return;
    }

    // ✅ 1. MESERO EN CAMINO - Resetear botón
    if (tipo === 'EVENT:MESERO_EN_CAMINO') {
      setMeseroEnCamino(false);
      return;
    }

    // ✅ 2. LLAMADO ATENDIDO - Resetear botón
    const eventosAtendido = ['EVENT:LLAMADO_ATENDIDO', 'ACTION:CANCELAR_LLAMADO', 'EVENT:LLAMADO_CANCELADO', 'EVENT:MESERO_ATENDIO', 'ACTION:ATENDER_MESA', 'EVENT:ATENDER_MESA', 'EVENT:MESA_ATENDIDA'];
    if (eventosAtendido.includes(tipo)) {
      const mesaAtendida = payload.mesa ?? payload.numeroMesa;
      if (Number(mesaAtendida) === Number(numeroMesa) || !mesaAtendida) {
        setMeseroEnCamino(false);
      }
    }

    // 🎰 3. SORTEO PÚBLICO DE RULETA GENERAL
    const eventosGiro = ['EVENT:SORTEO_MESA_RESULTADO', 'ACTION:GIRAR_RULETA', 'EVENT:RULETA_GIRAR'];
    if (eventosGiro.includes(tipo)) {
      const ganadora = payload.mesaGanadora ?? payload.ganador ?? payload.mesa;
      let duracion = 11;
      if (payload.duracionSegundos) {
        duracion = Number(payload.duracionSegundos);
      } else if (payload.duracionAnimacionMs) {
        duracion = Math.round(Number(payload.duracionAnimacionMs) / 1000);
      }
      const totalMesas = payload.totalMesas ?? payload.totalMesasParticipantes ?? 16;
      setNumMesasRuleta(totalMesas);
      setSeccionActiva('inicio');
      setMensajeFinal(null);
      setMesaGanadoraTarget(ganadora);
      setDuracionGiroWS(duracion);
      setAnimando(true);
      
      if (ganadora === numeroMesa) {
        setJuegosDesbloqueados((prev) => {
          if (!prev.includes('ruleta-premios')) {
            return [...prev, 'ruleta-premios'];
          }
          return prev;
        });
      }
    }

    // 🎮 4. JUEGO PRIVADO DESBLOQUEADO
    if (tipo === 'EVENT:JUEGO_PRIVADO_DESBLOQUEADO') {
      console.log('🎮 [CLIENTE] Juego desbloqueado:', payload);
      const juegoId = payload.juegoId;
      const mesaDestino = payload.mesa;
      
      if (Number(mesaDestino) !== Number(numeroMesa)) {
        return;
      }
      
      setJuegosDesbloqueados((prev) => {
        if (!prev.includes(juegoId)) {
          return [...prev, juegoId];
        }
        return prev;
      });
      
      setSeccionActiva('juegos_privados');
      
      if (juegoId === 'ruleta-premios') {
        console.log('🎰 [CLIENTE] Ruleta de premios desbloqueada!');
      }
    }

    // 🗳️ 5. VOTACIONES
    if (tipo === 'EVENT:VOTACION_EXPRES_START') {
      setVotacionActiva({
        id: payload.id,
        pregunta: payload.pregunta,
        opciones: payload.opciones,
        duracion: payload.duracion || 30,
      });
      setVotacionIniciada(true);
      setYaVoto(false);
      setTiempoRestante(payload.duracion || 30);
      setSeccionActiva('votaciones');
    }

    if (tipo === 'EVENT:VOTACION_CERRADA') {
      setVotacionIniciada(false);
      setVotacionActiva(null);
      setTiempoRestante(0);
      setYaVoto(false);
      if (seccionActiva === 'votaciones') {
        setSeccionActiva('inicio');
      }
    }

    // 🎁 3.5 RECEPCIÓN DE PREMIOS Y APERTURA DE RULETA DE PREMIOS
    if (tipo === 'EVENT:RULETA_CONFIGURACION_INICIAL') {
      console.log('🎁 [CLIENTE] Configuración de premios recibida:', payload.premios);
      if (payload.premios && Array.isArray(payload.premios)) {
        setPremiosRuleta(payload.premios);
      }
      if (juegosDesbloqueados.includes('ruleta-premios')) {
        setSeccionActiva('ruleta-premios');
      }
    }

  }, [mensajeWS, numeroMesa, seccionActiva, router, sessionIdActiva, juegosDesbloqueados]);

  // ========== FUNCIONES ==========
  const handleLlamarMesero = () => {
    if (meseroEnCamino || !sessionIdActiva) return;
    setMeseroEnCamino(true);
    enviarMensaje({ tipo: 'ACTION:SOLICITAR_ATENCION', payload: { mesa: numeroMesa, sessionId: sessionIdActiva } });
  };

  const handleVotar = (opcionId: number) => {
    if (yaVoto || !votacionActiva) return;
    setYaVoto(true);
    enviarMensaje({ tipo: 'ACTION:VOTAR_OPCION', payload: { votacionId: votacionActiva.id, opcionId } });
  };

  // 🎵 NUEVA FUNCIÓN: Enviar la canción al backend
  const handleEnviarCancion = async () => {
    if (!cancionInput.trim() || !autorInput.trim()) {
      alert('Por favor, escribe el nombre de la canción y el autor.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/canciones/solicitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cancion: cancionInput.trim(),
          autor: autorInput.trim(),
          mesa: numeroMesa,
        }),
      });

      if (res.ok) {
        alert('✅ ¡Sugerencia enviada al DJ!');
        setCancionInput('');
        setAutorInput('');
        setSeccionActiva('inicio');
      } else {
        alert('❌ Hubo un error al enviar la canción. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error al enviar canción:', error);
      alert('❌ Error de conexión con el servidor.');
    }
  };

  const lanzarConfetiGanador = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      zIndex: 9999,
      colors: ['#ff00a0', '#2ee6d6', '#ffd700'],
    });
  };

  if (mesaLimpiada) {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#020106] flex items-center justify-center p-6">
      {/* Fondo con gradiente Neon Punk sin amarillo */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#05010d] via-[#020106] to-[#0a0120]" />
      
      {/* Luces neón de fondo (Violeta y Azul Eléctrico) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-48 h-48 bg-[#a855f7]/25 blur-[90px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#3b82f6]/25 blur-[90px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#ec4899]/20 blur-[60px] rounded-full" />
      </div>
      
      {/* Modal de despedida (Acentos en violeta y rosa neón) */}
      <div className="relative z-10 max-w-sm w-full bg-[#0d0722] border border-[#a855f7]/40 rounded-3xl p-8 text-center shadow-[0_0_60px_rgba(168,85,247,0.25)] backdrop-blur-xl">
        
        {/* LOGO GRANDE CON EFECTO NEÓN */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/lasvesgas-logo.PNG"
            alt="Las Vegas Discobar"
            width={256}
            height={256}
            className="w-64 h-auto object-contain drop-shadow-[0_0_35px_rgba(168,85,247,0.8)]"
          />
        </div>
        
        {/* Texto de despedida */}
        <h2 className="font-orbitron font-black text-2xl text-[#d8b4fe] uppercase tracking-widest mb-4">
          ¡Muchas Gracias!
        </h2>
        <p className="text-[#60a5fa] font-space text-base mb-4">
          Por habernos acompañado.
        </p>
       <p className="text-white font-space text-base mb-6">
  Te esperamos el próximo fin de semana en 
  <span className="block font-orbitron font-bold mt-1 text-xl">
    {"Las Vegas Discobar".split("").map((letra, i) => (
      <span key={i} className="neon-letter text-[#60a5fa] inline-block">
        {letra}
      </span>
    ))}
  </span>
</p>
        {/* Barra de progreso de 9 segundos (Violeta a Azul) */}
        { }
        {/* Barra de progreso de 9 segundos (Neón Blanco Azulado) */}
        <div className="w-full bg-[#1f1645] h-2 rounded-full overflow-hidden mb-6">
          <div className="neon-progress h-full bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] animate-progress-bar" />
        </div>
        {/* Botón manual (Neón Violeta) */}
        <button 
          onClick={() => router.push('/')}
          className="w-full py-3 bg-gradient-to-r from-[#a855f7] to-[#3b82f6] rounded-xl font-orbitron font-black text-xs text-white uppercase tracking-widest hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all active:scale-95"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}

  // 🚀 RENDER PRINCIPAL
  return (
    <main className="relative min-h-screen pt-4 pb-8 px-4 bg-[#020106] flex flex-col items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#060413] via-[#020106] to-[#0a071d] z-0" />

      {/* 1. HEADER */}
      <MesaHeader numeroMesa={numeroMesa} sessionId={sessionIdActiva} />

      <div className="relative z-10 w-full max-w-md flex-1 flex flex-col gap-4 mt-4">
        
        {/* 🎰 RULETA DE MESAS */}
        {animando ? (
          <div className="w-full flex flex-col items-center gap-4">
            <RuletaMesas
              numMesas={numMesasRuleta}
              mesaGanadoraTarget={mesaGanadoraTarget}
              duracionSegundos={duracionGiroWS}
              onResultado={() => {
                const gano = mesaGanadoraTarget === numeroMesa;
                setAnimando(false);
                if (gano) {
                  lanzarConfetiGanador();
                  setMensajeFinal({
                    esGanador: true,
                    titulo: '¡MESA GANADORA! 🎉',
                    descripcion: '¡Felicitaciones! Tu mesa se llevó el premio.',
                  });
                } else {
                  setMensajeFinal({
                    esGanador: false,
                    titulo: 'SUERTE A LA PRÓXIMA 😅',
                    descripcion: `El premio fue para la Mesa #${mesaGanadoraTarget}.`,
                  });
                }
              }}
            />
          </div>
        ) : mensajeFinal ? (
          <div className={`text-center p-6 backdrop-blur-md border rounded-2xl max-w-xs ${
            mensajeFinal.esGanador ? 'bg-[#1b143d] border-[#ffd700]' : 'bg-[#060413]/80 border-[#2a1e5c]'
          }`}>
            <div className="text-5xl mb-3">{mensajeFinal.esGanador ? '🏆' : '🍻'}</div>
            <h2 className="font-orbitron font-black text-base uppercase mb-2 text-[#ffd700]">{mensajeFinal.titulo}</h2>
            <p className="text-xs text-gray-300 mb-4">{mensajeFinal.descripcion}</p>
            <button onClick={() => setMensajeFinal(null)} className="px-4 py-2 bg-[#1f1645] rounded-xl text-xs font-bold">
              Volver al Menú
            </button>
          </div>
        ) : (
          <>
            {/* 2. BOTÓN LLAMAR MESERO */}
            <LlamarMeseroBtn onClick={handleLlamarMesero} disabled={meseroEnCamino} enCamino={meseroEnCamino} />

            {/* 3. PANEL DE REACCIONES */}
            <PanelReacciones enviarMensaje={enviarMensaje} />

            {/* 4. MENÚ DE OPCIONES */}
            <MenuOpciones 
              juegosDesbloqueados={juegosDesbloqueados} 
              numeroMesa={numeroMesa}
              sessionId={sessionIdActiva}
              pedirCancionActivo={pedirCancionActivo}
              onSelect={(seccion) => setSeccionActiva(seccion)} 
            />
          </>
        )}

        {/* 5. MODALES (AHORA CON LAS PROPS DE LAS CANCIONES Y PREMIOS) */}
        <ModalesMesa 
          seccionActiva={seccionActiva}
          onClose={() => setSeccionActiva('inicio')}
          juegosDesbloqueados={juegosDesbloqueados}
          numeroMesa={numeroMesa}
          sessionId={sessionIdActiva}
          votacionActiva={votacionActiva}
          tiempoRestante={tiempoRestante}
          yaVoto={yaVoto}
          onVotar={handleVotar}
          // 🎁 PROPS PARA LA RULETA DE PREMIOS
          premiosRuleta={premiosRuleta}
          // 🎵 NUEVAS PROPS PARA CANCIONES
          cancionInput={cancionInput}
          setCancionInput={setCancionInput}
          autorInput={autorInput}
          setAutorInput={setAutorInput}
          onEnviarCancion={handleEnviarCancion}
        />
      </div>
    </main>
  );
}