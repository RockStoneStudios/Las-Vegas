'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocketStore } from '@/lib/store/useSocketStore';
import { toast } from 'sonner';

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
  const {
    conectarSocket,
    enviarMensaje,
    mensajeWS,
    conectado,
    meseroBloqueado,
    setMeseroBloqueado,
    votacionActiva,
  } = useSocketStore();

  // ========== ESTADOS COMPARTIDOS ==========
  const [sessionIdActiva, setSessionIdActiva] = useState<string | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState<boolean>(true);
  const [errorSesion, setErrorSesion] = useState<string | null>(null);
  const [mesaLimpiada, setMesaLimpiada] = useState<boolean>(false);
  const [juegosDesbloqueados, setJuegosDesbloqueados] = useState<string[]>([]);
  const [seccionActiva, setSeccionActiva] = useState<'inicio' | 'juegos_privados' | 'votaciones' | 'cancion' | 'ruleta-premios' | 'subasta'>('inicio');
  const [yaVoto, setYaVoto] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const votacionAbiertaRef = useRef<string | null>(null);

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

  // 🆕 CUPO DE CANCIONES (2 por mesa por turno)
  const [cancionesUsadas, setCancionesUsadas] = useState(0);
  const [cancionesLimite, setCancionesLimite] = useState(2);
  const [cancionesRestantes, setCancionesRestantes] = useState(2);

  // ⚡ SUBASTA
  const [subastaActiva, setSubastaActiva] = useState(false);
  const [subasta, setSubasta] = useState<any>(null);
  const [montoPuja, setMontoPuja] = useState('');

  console.log('🧪 [PAGE] votacionActiva =', votacionActiva?.id ?? null, '| seccionActiva =', seccionActiva);

  // ========== REDIRECCIÓN AUTOMÁTICA Y ANIMACIÓN GSAP ==========
  useEffect(() => {
    if (mesaLimpiada) {
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
      const timer = setTimeout(() => {
        router.push('/');
      }, 9000);
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
        const sessionStorageKey = `lasvegas_mesa_${numeroMesa}_session_id`;
        let sessionIdObtenido: string | null = localStorage.getItem(sessionStorageKey);
        if (tokenMesa) {
          const deviceId = obtenerDeviceId();
          const params = new URLSearchParams({ token: tokenMesa, deviceId });
          const res = await fetch(`${API_URL}/api/auth/mesa/${numeroMesa}?${params.toString()}`);
          if (!res.ok) throw new Error('No fue posible validar el acceso a esta mesa');
          const data = await res.json();
          const sessionIdServidor = data?.sessionId;
          if (typeof sessionIdServidor !== 'string' || !sessionIdServidor) throw new Error('El servidor no devolvió una sesión válida');
          sessionIdObtenido = sessionIdServidor;
          localStorage.setItem(sessionStorageKey, sessionIdServidor);
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

  // 🗳 Abrir el modal cuando aparece una votación nueva
  useEffect(() => {
    if (!votacionActiva) {
      votacionAbiertaRef.current = null;
      setSeccionActiva((prev) => (prev === 'votaciones' ? 'inicio' : prev));
      setYaVoto(false);
      return;
    }
    if (votacionAbiertaRef.current !== votacionActiva.id) {
      votacionAbiertaRef.current = votacionActiva.id;
      setYaVoto(false);
      setSeccionActiva('votaciones');
    }
  }, [votacionActiva?.id]);

  // 🗳 Cuenta regresiva
  useEffect(() => {
    if (!votacionActiva) { setTiempoRestante(0); return; }
    const calcular = () => Math.max(0, Math.ceil((votacionActiva.finalizaEn - Date.now()) / 1000));
    setTiempoRestante(calcular());
    const t = setInterval(() => {
      const s = calcular();
      setTiempoRestante(s);
      if (s <= 0) { clearInterval(t); setSeccionActiva((prev) => (prev === 'votaciones' ? 'inicio' : prev)); }
    }, 250);
    return () => clearInterval(t);
  }, [votacionActiva?.id, votacionActiva?.finalizaEn]);

  // 🆕 RE-SYNC: Mesero
  useEffect(() => {
    if (!numeroMesa) return;
    const verificarEstadoMesero = async () => {
      try {
        const res = await fetch(`${API_URL}/api/mesero/estado/${numeroMesa}`);
        if (!res.ok) return;
        const data = await res.json();
        setMeseroBloqueado(!!data.bloqueado);
      } catch (e) { console.warn('⚠ [RE-SYNC] No se pudo verificar estado del mesero:', e); }
    };
    verificarEstadoMesero();
  }, [numeroMesa, setMeseroBloqueado]);

  // 🆕 RE-SYNC: Modo canciones
  useEffect(() => {
    if (!numeroMesa) return;
    const verificarModoCanciones = async () => {
      try {
        const res = await fetch(`${API_URL}/api/canciones/modo-activo`);
        if (!res.ok) return;
        const data = await res.json();
        setPedirCancionActivo(data.activo);
        if (data.activo) {
          const resCupo = await fetch(`${API_URL}/api/canciones/estado-mesa/${numeroMesa}`);
          if (resCupo.ok) {
            const cupo = await resCupo.json();
            setCancionesUsadas(cupo.usadas ?? 0);
            setCancionesLimite(cupo.limite ?? 2);
            setCancionesRestantes(cupo.restantes ?? 2);
          }
        }
      } catch (e) { console.warn('⚠ [RE-SYNC] No se pudo verificar modo canciones:', e); }
    };
    verificarModoCanciones();
  }, [numeroMesa]);

  // 🆕 CUPO AL ABRIR MODAL CANCION
  useEffect(() => {
    if (seccionActiva !== 'cancion') return;
    const consultarCupo = async () => {
      try {
        const res = await fetch(`${API_URL}/api/canciones/estado-mesa/${numeroMesa}`);
        if (!res.ok) return;
        const data = await res.json();
        setCancionesUsadas(data.usadas ?? 0);
        setCancionesLimite(data.limite ?? 2);
        setCancionesRestantes(data.restantes ?? 2);
      } catch (e) { console.warn('⚠ No se pudo consultar cupo de canciones:', e); }
    };
    consultarCupo();
  }, [seccionActiva, numeroMesa]);

  // ⚡ RE-SYNC SUBASTA - cada 5 seg pregunta si el admin la activó
  useEffect(() => {
    const verificarSubasta = async () => {
      try {
        const res = await fetch(`${API_URL}/api/subastas/activa`);
        const json = await res.json();
        if (json.ok && json.data) {
          setSubastaActiva(true);
          setSubasta(json.data);
          setMontoPuja(String(json.data.precioActual + 10000));
        } else {
          setSubastaActiva(false);
          setSubasta(null);
          if (seccionActiva === 'subasta') setSeccionActiva('inicio');
        }
      } catch {
        setSubastaActiva(false);
        setSubasta(null);
      }
    };
    verificarSubasta();
    const interval = setInterval(verificarSubasta, 5000);
    return () => clearInterval(interval);
  }, []);

  // ========== EVENTOS WEBSOCKET ==========
  useEffect(() => {
    if (!mensajeWS) return;
    const tipo = mensajeWS.tipo;
    const payload = mensajeWS.payload || {};
    console.log('📩 [CLIENTE WS] Evento recibido:', tipo, payload);

    if (tipo === 'EVENT:MESA_CERRADA' || tipo === 'EVENT:MESA_LIMPIADA' || tipo === 'ACTION:CERRAR_MESA') {
      const mesaEvento = payload.mesa ?? payload.numeroMesa;
      if (mesaEvento && Number(mesaEvento) !== Number(numeroMesa)) return;
      setMesaLimpiada(true);
      setMeseroBloqueado(false);
      localStorage.removeItem(`lasvegas_mesa_${numeroMesa}_session_id`);
      localStorage.removeItem('mesa_sessionId');
      return;
    }

    if (tipo === 'EVENT:MODO_PEDIR_CANCION') {
      setPedirCancionActivo(payload.activo);
      if (payload.activo) {
        setCancionesUsadas(0);
        setCancionesRestantes(cancionesLimite);
        setCancionInput('');
        setAutorInput('');
      }
      return;
    }

    if (tipo === 'EVENT:MESERO_SOLICITADO') {
      if (Number(payload.mesa) === Number(numeroMesa)) setMeseroBloqueado(true);
      return;
    }

    if (tipo === 'EVENT:MESERO_ATENDIDO') {
      if (Number(payload.mesa) === Number(numeroMesa)) setMeseroBloqueado(false);
      return;
    }

    const eventosAtendido = ['EVENT:LLAMADO_ATENDIDO', 'ACTION:CANCELAR_LLAMADO', 'EVENT:LLAMADO_CANCELADO', 'EVENT:MESERO_ATENDIO', 'ACTION:ATENDER_MESA', 'EVENT:ATENDER_MESA', 'EVENT:MESA_ATENDIDA'];
    if (eventosAtendido.includes(tipo)) {
      const mesaAtendida = payload.mesa ?? payload.numeroMesa;
      if (Number(mesaAtendida) === Number(numeroMesa) || !mesaAtendida) setMeseroBloqueado(false);
    }

    const eventosGiro = ['EVENT:SORTEO_MESA_RESULTADO', 'ACTION:GIRAR_RULETA', 'EVENT:RULETA_GIRAR'];
    if (eventosGiro.includes(tipo)) {
      const ganadora = payload.mesaGanadora ?? payload.ganador ?? payload.mesa;
      let duracion = 11;
      if (payload.duracionSegundos) duracion = Number(payload.duracionSegundos);
      else if (payload.duracionAnimacionMs) duracion = Math.round(Number(payload.duracionAnimacionMs) / 1000);
      const totalMesas = payload.totalMesas ?? payload.totalMesasParticipantes ?? 16;
      setNumMesasRuleta(totalMesas);
      setSeccionActiva('inicio');
      setMensajeFinal(null);
      setMesaGanadoraTarget(ganadora);
      setDuracionGiroWS(duracion);
      setAnimando(true);
      if (ganadora === numeroMesa) {
        setJuegosDesbloqueados((prev) => prev.includes('ruleta-premios') ? prev : [...prev, 'ruleta-premios']);
      }
    }

    if (tipo === 'EVENT:JUEGO_PRIVADO_DESBLOQUEADO') {
      const juegoId = payload.juegoId;
      const mesaDestino = payload.mesa;
      if (Number(mesaDestino) !== Number(numeroMesa)) return;
      setJuegosDesbloqueados((prev) => prev.includes(juegoId) ? prev : [...prev, juegoId]);
      setSeccionActiva('juegos_privados');
    }

    if (tipo === 'EVENT:RULETA_CONFIGURACION_INICIAL') {
      if (payload.premios && Array.isArray(payload.premios)) setPremiosRuleta(payload.premios);
      if (juegosDesbloqueados.includes('ruleta-premios')) setSeccionActiva('ruleta-premios');
    }

  }, [mensajeWS, numeroMesa, seccionActiva, router, sessionIdActiva, juegosDesbloqueados, setMeseroBloqueado, cancionesLimite]);

  // ========== FUNCIONES ==========
  const handleLlamarMesero = async () => {
    if (meseroBloqueado || !sessionIdActiva) return;
    setMeseroBloqueado(true);
    enviarMensaje({ tipo: 'ACTION:SOLICITAR_ATENCION', payload: { mesa: numeroMesa, sessionId: sessionIdActiva } });
    toast.success('Mesero en camino 🍹', { description: `Mesa ${numeroMesa} - ya viene a atenderte` });
  };

  const handleVotar = (opcionId: number) => {
    if (yaVoto || !votacionActiva) return;
    setYaVoto(true);
    enviarMensaje({ tipo: 'ACTION:VOTAR_OPCION', payload: { votacionId: votacionActiva.id, opcionId } });
    toast.success('¡Voto registrado! 🗳️');
  };

  const handleEnviarCancion = async () => {
    if (!cancionInput.trim() || !autorInput.trim()) {
      toast.error('Falta info 🎵', { description: 'Escribe el nombre de la canción y el autor.' });
      return;
    }
    if (cancionesRestantes <= 0) {
      toast.warning('⛔ Sin cupo', { description: 'Ya pediste el máximo de canciones en este turno.' });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/canciones/solicitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancion: cancionInput.trim(), autor: autorInput.trim(), mesa: numeroMesa }),
      });
      const data = await res.json();
      if (res.ok) {
        setCancionesUsadas(data.usadas);
        setCancionesRestantes(data.restantes);
        setCancionInput('');
        setAutorInput('');
        toast.success('✅ ¡Sugerencia enviada!', {
          description: `Te quedan ${data.restantes} ${data.restantes === 1 ? 'canción' : 'canciones'} en este turno.`,
          style: {
            background: '#0a0720',
            border: '1px solid #00f3ff',
            boxShadow: '0 0 20px rgba(0,243,255,0.4)',
            color: '#fff',
          },
        });
      } else if (res.status === 429) {
        setCancionesUsadas(data.usadas ?? cancionesLimite);
        setCancionesRestantes(0);
        toast.error(`⛔ ${data.error}`);
      } else if (res.status === 403) {
        toast.warning('⛔ DJ pausado', { description: 'El DJ no está aceptando canciones ahora mismo.' });
      } else {
        toast.error(`❌ ${data.error || 'Error al enviar la canción'}`);
      }
    } catch (error) {
      console.error('Error al enviar canción:', error);
      toast.error('❌ Error de conexión', { description: 'No pudimos contactar al servidor.' });
    }
  };

  // ⚡ PUJAR
  const handlePujar = async () => {
    if (!subasta) return;
    const monto = Number(montoPuja);
    if (!monto || monto <= subasta.precioActual) {
      toast.error('Puja muy baja 💸', { description: `Debe ser mayor a $${subasta.precioActual.toLocaleString()}` });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/subastas/${subasta._id}/pujar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mesa: numeroMesa, monto }),
      });
      const json = await res.json();
      if (json.ok) {
        setSubasta(json.data);
        setMontoPuja(String(json.data.precioActual + 10000));
        toast.success(`🔥 ¡Vas ganando con $${monto.toLocaleString()}!`, {
          style: {
            background: '#0a0720',
            border: '1px solid #ffe600',
            boxShadow: '0 0 25px rgba(255,230,0,0.5)',
          },
        });
      } else {
        toast.error(`❌ ${json.error || 'No se pudo pujar'}`);
      }
    } catch {
      toast.error('❌ Error de conexión');
    }
  };

  const lanzarConfetiGanador = () => {
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, zIndex: 9999, colors: ['#ff00a0', '#2ee6d6', '#ffd700'] });
  };

  if (mesaLimpiada) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#020106] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#05010d] via-[#020106] to-[#0a0120]" />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-48 h-48 bg-[#a855f7]/25 blur- rounded-full" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#3b82f6]/25 blur- rounded-full" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#ec4899]/20 blur- rounded-full" />
        </div>
        <div className="relative z-10 max-w-sm w-full bg-[#0d0722] border border-[#a855f7]/40 rounded-3xl p-8 text-center shadow-[0_0_60px_rgba(168,85,247,0.25)] backdrop-blur-xl">
          <div className="mb-6 flex justify-center">
            <Image src="/lasvesgas-logo.PNG" alt="Las Vegas Discobar" width={256} height={256} className="w-64 h-auto object-contain drop-shadow-[0_0_35px_rgba(168,85,247,0.8)]" />
          </div>
          <h2 className="font-orbitron font-black text-2xl text-[#d8b4fe] uppercase tracking-widest mb-4">¡Muchas Gracias!</h2>
          <p className="text-[#60a5fa] font-space text-base mb-4">Por habernos acompañado.</p>
          <p className="text-white font-space text-base mb-6">
            Te esperamos el próximo fin de semana en
            <span className="block font-orbitron font-bold mt-1 text-xl">
              {"Las Vegas Discobar".split("").map((letra, i) => (
                <span key={i} className="neon-letter text-[#60a5fa] inline-block">{letra}</span>
              ))}
            </span>
          </p>
          <div className="w-full bg-[#1f1645] h-2 rounded-full overflow-hidden mb-6">
            <div className="neon-progress h-full bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] animate-progress-bar" />
          </div>
          <button onClick={() => router.push('/')} className="w-full py-3 bg-gradient-to-r from-[#a855f7] to-[#3b82f6] rounded-xl font-orbitron font-black text-xs text-white uppercase tracking-widest hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all active:scale-95">
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
      <MesaHeader numeroMesa={numeroMesa} sessionId={sessionIdActiva} />
      <div className="relative z-10 w-full max-w-md flex-1 flex flex-col gap-4 mt-4">
        {animando ? (
          <div className="w-full flex flex-col items-center gap-4">
            <RuletaMesas numMesas={numMesasRuleta} mesaGanadoraTarget={mesaGanadoraTarget} duracionSegundos={duracionGiroWS}
              onResultado={() => {
                const gano = mesaGanadoraTarget === numeroMesa;
                setAnimando(false);
                if (gano) {
                  lanzarConfetiGanador();
                  setMensajeFinal({ esGanador: true, titulo: '¡MESA GANADORA! 🎉', descripcion: '¡Felicitaciones! Tu mesa se llevó el premio.' });
                } else {
                  setMensajeFinal({ esGanador: false, titulo: 'SUERTE A LA PRÓXIMA 😅', descripcion: `El premio fue para la Mesa #${mesaGanadoraTarget}.` });
                }
              }}
            />
          </div>
        ) : mensajeFinal ? (
          <div className={`text-center p-6 backdrop-blur-md border rounded-2xl max-w-xs ${mensajeFinal.esGanador ? 'bg-[#1b143d] border-[#ffd700]' : 'bg-[#060413]/80 border-[#2a1e5c]'}`}>
            <div className="text-5xl mb-3">{mensajeFinal.esGanador ? '🏆' : '🍻'}</div>
            <h2 className="font-orbitron font-black text-base uppercase mb-2 text-[#ffd700]">{mensajeFinal.titulo}</h2>
            <p className="text-xs text-gray-300 mb-4">{mensajeFinal.descripcion}</p>
            <button onClick={() => setMensajeFinal(null)} className="px-4 py-2 bg-[#1f1645] rounded-xl text-xs font-bold">Volver al Menú</button>
          </div>
        ) : (
          <>
            <LlamarMeseroBtn onClick={handleLlamarMesero} disabled={meseroBloqueado} enCamino={meseroBloqueado} />
            <PanelReacciones enviarMensaje={enviarMensaje} />
            <MenuOpciones
              juegosDesbloqueados={juegosDesbloqueados}
              numeroMesa={numeroMesa}
              sessionId={sessionIdActiva}
              pedirCancionActivo={pedirCancionActivo}
              cancionesRestantes={cancionesRestantes}
              cancionesLimite={cancionesLimite}
              subastaActiva={subastaActiva}
              onSelect={(seccion) => setSeccionActiva(seccion)}
            />
          </>
        )}

        {/* 5. MODALES - ahora con subasta */}
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
          premiosRuleta={premiosRuleta}
          cancionInput={cancionInput}
          setCancionInput={setCancionInput}
          autorInput={autorInput}
          setAutorInput={setAutorInput}
          onEnviarCancion={handleEnviarCancion}
          cancionesUsadas={cancionesUsadas}
          cancionesLimite={cancionesLimite}
          cancionesRestantes={cancionesRestantes}
          subasta={subasta}
          montoPuja={montoPuja}
          setMontoPuja={setMontoPuja}
          onPujar={handlePujar}
        />
      </div>
    </main>
  );
}

function obtenerDeviceId() {
  const key = 'lasvegas_device_id';
  let deviceId = localStorage.getItem(key);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(key, deviceId);
  }
  return deviceId;
}