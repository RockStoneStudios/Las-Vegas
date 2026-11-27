// // 'use client';

// // import { useState, useEffect } from 'react';
// // import { Plus, Save, Trash2, Move, Layout, Users, Disc } from 'lucide-react';

// // interface IMesa {
// //   id: string;
// //   numero: string;
// //   tipo: 'MESA' | 'BARRA' | 'ESCENARIO' | 'VIP' | 'PISTA_BAILE' | 'BANO';
// //   capacidad: number;
// //   posX: number;
// //   posY: number;
// //   width: number;
// //   height: number;
// // }

// // const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// // export default function AdminMesasPage() {
// //   const [mesas, setMesas] = useState<IMesa[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [saving, setSaving] = useState(false);
// //   const [draggedMesaId, setDraggedMesaId] = useState<string | null>(null);
// //   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

// //   // Formulario para crear nueva mesa o elemento
// //   const [nuevaMesa, setNuevaMesa] = useState({
// //     numero: '',
// //     tipo: 'MESA' as 'MESA' | 'BARRA' | 'ESCENARIO' | 'VIP' | 'PISTA_BAILE' | 'BANO',
// //     capacidad: 4,
// //   });

// //   // 1. Cargar mesas activas al montar el componente
// //   useEffect(() => {
// //     fetchMesas();
// //   }, []);

// //   const fetchMesas = async () => {
// //     try {
// //       setLoading(true);
// //       const res = await fetch(`${API_URL}/mesas`);
// //       const data = await res.json();
// //       if (Array.isArray(data)) {
// //         setMesas(data);
// //       }
// //     } catch (error) {
// //       console.error('Error cargando mesas:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // 2. Manejo de Drag & Drop en el canvas
// //   const handleMouseDown = (e: React.MouseEvent, mesa: IMesa) => {
// //     setDraggedMesaId(mesa.id);
// //     setDragOffset({
// //       x: e.clientX - mesa.posX,
// //       y: e.clientY - mesa.posY,
// //     });
// //   };

// //   const handleMouseMove = (e: React.MouseEvent) => {
// //     if (!draggedMesaId) return;

// //     const newX = Math.max(0, e.clientX - dragOffset.x);
// //     const newY = Math.max(0, e.clientY - dragOffset.y);

// //     setMesas((prev) =>
// //       prev.map((m) =>
// //         m.id === draggedMesaId
// //           ? { ...m, posX: Math.round(newX), posY: Math.round(newY) }
// //           : m
// //       )
// //     );
// //   };

// //   const handleMouseUp = () => {
// //     setDraggedMesaId(null);
// //   };

// //   // 3. Guardar todo el layout modificado (PUT /mesas/layout)
// //   const guardarLayout = async () => {
// //     try {
// //       setSaving(true);
// //       const itemsToUpdate = mesas.map((m) => ({
// //         id: m.id,
// //         posX: m.posX,
// //         posY: m.posY,
// //         width: m.width,
// //         height: m.height,
// //       }));

// //       const res = await fetch(`${API_URL}/mesas/layout`, {
// //         method: 'PUT',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(itemsToUpdate),
// //       });

// //       if (res.ok) {
// //         alert('¡Layout del plano guardado con éxito!');
// //       } else {
// //         alert('Error al guardar el layout');
// //       }
// //     } catch (error) {
// //       console.error('Error guardando layout:', error);
// //       alert('Error de conexión al guardar');
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   // 4. Crear nueva mesa/elemento (POST /mesas)
// //   const crearMesa = async (e: React.FormEvent) => {
// //     e.preventDefault();

// //     if (!nuevaMesa.numero.trim()) {
// //       alert('Ingresa un número o nombre para el elemento (Ej: Pista Principal, Mesa 5)');
// //       return;
// //     }

// //     // Definir dimensiones iniciales según el tipo de elemento
// //     let initialWidth = 80;
// //     let initialHeight = 80;

// //     if (nuevaMesa.tipo === 'BARRA') {
// //       initialWidth = 280;
// //       initialHeight = 60;
// //     } else if (nuevaMesa.tipo === 'ESCENARIO') {
// //       initialWidth = 200;
// //       initialHeight = 100;
// //     } else if (nuevaMesa.tipo === 'VIP') {
// //       initialWidth = 120;
// //       initialHeight = 120;
// //     } else if (nuevaMesa.tipo === 'PISTA_BAILE') {
// //       initialWidth = 240;
// //       initialHeight = 160;
// //     } else if (nuevaMesa.tipo === 'BANO') {
// //       initialWidth = 100;
// //       initialHeight = 100;
// //     }

// //     try {
// //       const res = await fetch(`${API_URL}/mesas`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           numero: nuevaMesa.numero,
// //           tipo: nuevaMesa.tipo,
// //           capacidad: Number(nuevaMesa.capacidad),
// //           posX: 30,
// //           posY: 30,
// //           width: initialWidth,
// //           height: initialHeight,
// //         }),
// //       });

// //       if (res.ok) {
// //         const creada = await res.json();
// //         const mesaFormateada = {
// //           ...creada,
// //           id: creada.id || creada._id,
// //         };

// //         setMesas((prev) => [...prev, mesaFormateada]);
// //         setNuevaMesa({ numero: '', tipo: 'MESA', capacidad: 4 });
// //       } else {
// //         const err = await res.json().catch(() => ({}));
// //         console.error('❌ Error del backend:', err);
// //         alert(`Error al crear elemento: ${err.error || err.message || JSON.stringify(err) || 'Respuesta no válida'}`);
// //       }
// //     } catch (error) {
// //       console.error('Error creando mesa/elemento:', error);
// //       alert('Ocurrió un error de conexión al crear el elemento');
// //     }
// //   };

// //   // 5. Eliminar elemento del plano (DELETE /mesas/:id)
// //   const eliminarMesa = async (id: string) => {
// //     if (!confirm('¿Estás seguro de eliminar este elemento del plano?')) return;

// //     try {
// //       const res = await fetch(`${API_URL}/mesas/${id}`, { method: 'DELETE' });
// //       if (res.ok) {
// //         setMesas((prev) => prev.filter((m) => m.id !== id));
// //       }
// //     } catch (error) {
// //       console.error('Error eliminando mesa:', error);
// //     }
// //   };

// //   // Helper para los estilos según el tipo de elemento
// //   const getTipoEstilo = (tipo: string) => {
// //     switch (tipo) {
// //       case 'VIP':
// //         return 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-amber-500/10';
// //       case 'BARRA':
// //         return 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-cyan-500/20';
// //       case 'ESCENARIO':
// //         return 'bg-purple-950/60 border-purple-500 text-purple-200 font-bold uppercase tracking-widest';
// //       case 'PISTA_BAILE':
// //         return 'bg-pink-950/40 border-pink-500/80 text-pink-300 font-bold uppercase tracking-wider border-dashed shadow-pink-500/20';
// //       case 'BANO':
// //         return 'bg-slate-800/60 border-slate-400 text-slate-200 shadow-slate-400/20';
// //       default:
// //         return 'bg-zinc-800 border-zinc-600 text-zinc-100';
// //     }
// //   };

// //   return (
// //     <div className="p-6 max-w-7xl mx-auto space-y-6 text-white min-h-screen">
// //       {/* HEADER */}
// //       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
// //         <div>
// //           <h1 className="text-2xl font-bold flex items-center gap-2">
// //             <Layout className="text-amber-500" /> Editor del Plano de Mesas
// //           </h1>
// //           <p className="text-zinc-400 text-sm">
// //             Arrastra los elementos para ubicarlos en el lienzo y guarda los cambios.
// //           </p>
// //         </div>

// //         <button
// //           onClick={guardarLayout}
// //           disabled={saving}
// //           className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
// //         >
// //           <Save size={18} />
// //           {saving ? 'Guardando...' : 'Guardar Plano'}
// //         </button>
// //       </div>

// //       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
// //         {/* PANEL LATERAL: FORMULARIO */}
// //         <div className="lg:col-span-1 bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-4">
// //           <h2 className="text-lg font-semibold flex items-center gap-2">
// //             <Plus size={18} className="text-amber-500" /> Agregar Elemento
// //           </h2>

// //           <form onSubmit={crearMesa} className="space-y-3">
// //             <div>
// //               <label className="text-xs text-zinc-400">Identificador / Número</label>
// //               <input
// //                 type="text"
// //                 placeholder="Ej: Mesa 1, Pista Principal, VIP 2"
// //                 value={nuevaMesa.numero}
// //                 onChange={(e) => setNuevaMesa({ ...nuevaMesa, numero: e.target.value })}
// //                 className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
// //               />
// //             </div>

// //             <div>
// //               <label className="text-xs text-zinc-400">Tipo de Elemento</label>
// //               <select
// //                 value={nuevaMesa.tipo}
// //                 onChange={(e) =>
// //                   setNuevaMesa({
// //                     ...nuevaMesa,
// //                     tipo: e.target.value as any,
// //                   })
// //                 }
// //                 className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
// //               >
// //                 <option value="MESA">Mesa Standard</option>
// //                 <option value="VIP">Mesa VIP</option>
// //                 <option value="BARRA">Barra</option>
// //                 <option value="ESCENARIO">Escenario / DJ</option>
// //                 <option value="PISTA_BAILE">Pista de Baile 💃</option>
// //                 <option value="BANO">Baño 🚻</option>
// //               </select>
// //             </div>

// //             <div>
// //               <label className="text-xs text-zinc-400">Capacidad / Aforo Estimado</label>
// //               <input
// //                 type="number"
// //                 value={nuevaMesa.capacidad}
// //                 onChange={(e) =>
// //                   setNuevaMesa({
// //                     ...nuevaMesa,
// //                     capacidad: Number(e.target.value),
// //                   })
// //                 }
// //                 className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
// //               />
// //             </div>

// //             <button
// //               type="submit"
// //               className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-medium py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer"
// //             >
// //               <Plus size={16} /> Crear Elemento
// //             </button>
// //           </form>
// //         </div>

// //         {/* LIENZO / CANVAS INTERACTIVO */}
// //         <div className="lg:col-span-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800 overflow-hidden">
// //           {loading ? (
// //             <div className="h-[550px] flex items-center justify-center text-zinc-500">
// //               Cargando plano...
// //             </div>
// //           ) : (
// //             <div
// //               className="relative w-full h-[550px] bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800 overflow-auto select-none"
// //               style={{
// //                 backgroundImage:
// //                   'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
// //                 backgroundSize: '20px 20px',
// //               }}
// //               onMouseMove={handleMouseMove}
// //               onMouseUp={handleMouseUp}
// //             >
// //               {mesas.map((mesa) => (
// //                 <div
// //                   key={mesa.id}
// //                   onMouseDown={(e) => handleMouseDown(e, mesa)}
// //                   style={{
// //                     position: 'absolute',
// //                     left: `${mesa.posX}px`,
// //                     top: `${mesa.posY}px`,
// //                     width: `${mesa.width}px`,
// //                     height: `${mesa.height}px`,
// //                   }}
// //                   className={`cursor-grab active:cursor-grabbing border-2 rounded-xl p-2 flex flex-col justify-between shadow-lg transition-shadow hover:shadow-amber-500/10 ${getTipoEstilo(
// //                     mesa.tipo
// //                   )}`}
// //                 >
// //                   <div className="flex justify-between items-center">
// //                     <span className="font-bold text-xs truncate flex items-center gap-1">
// //                       {mesa.tipo === 'PISTA_BAILE' && <Disc size={12} className="animate-spin" />}
// //                       {mesa.tipo === 'BANO' && '🚻 '}
// //                       {mesa.numero}
// //                     </span>
// //                     <button
// //                       onClick={(e) => {
// //                         e.stopPropagation();
// //                         eliminarMesa(mesa.id);
// //                       }}
// //                       className="text-zinc-400 hover:text-red-400 transition cursor-pointer"
// //                       title="Eliminar elemento"
// //                     >
// //                       <Trash2 size={13} />
// //                     </button>
// //                   </div>

// //                   <div className="flex justify-between items-end text-[10px] opacity-80">
// //                     <span className="flex items-center gap-1">
// //                       <Users size={10} /> {mesa.capacidad}
// //                     </span>
// //                     <Move size={10} className="opacity-50" />
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// 'use client';

// import { useState, useEffect } from 'react';
// import {
//   Plus,
//   Save,
//   Trash2,
//   Move,
//   Layout,
//   Users,
//   Disc,
//   Maximize2,
//   Minimize2,
// } from 'lucide-react';

// interface IMesa {
//   id: string;
//   numero: string;
//   tipo: 'MESA' | 'BARRA' | 'ESCENARIO' | 'VIP' | 'PISTA_BAILE' | 'BANO';
//   capacidad: number;
//   posX: number;
//   posY: number;
//   width: number;
//   height: number;
// }

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// export default function AdminMesasPage() {
//   const [mesas, setMesas] = useState<IMesa[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [draggedMesaId, setDraggedMesaId] = useState<string | null>(null);
//   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

//   // Pantalla completa: oculta el panel lateral y expande el lienzo
//   const [pantallaCompleta, setPantallaCompleta] = useState(false);

//   // Formulario para crear nueva mesa o elemento
//   const [nuevaMesa, setNuevaMesa] = useState({
//     numero: '',
//     tipo: 'MESA' as 'MESA' | 'BARRA' | 'ESCENARIO' | 'VIP' | 'PISTA_BAILE' | 'BANO',
//     capacidad: 4,
//   });

//   // 1. Cargar mesas activas al montar el componente
//   useEffect(() => {
//     fetchMesas();
//   }, []);

//   // Salir de pantalla completa con la tecla Escape
//   useEffect(() => {
//     if (!pantallaCompleta) return;
//     const manejarTecla = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') setPantallaCompleta(false);
//     };
//     window.addEventListener('keydown', manejarTecla);
//     return () => window.removeEventListener('keydown', manejarTecla);
//   }, [pantallaCompleta]);

//   const fetchMesas = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(`${API_URL}/mesas`);
//       const data = await res.json();
//       if (Array.isArray(data)) {
//         setMesas(data);
//       }
//     } catch (error) {
//       console.error('Error cargando mesas:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 2. Manejo de Drag & Drop en el canvas
//   const handleMouseDown = (e: React.MouseEvent, mesa: IMesa) => {
//     setDraggedMesaId(mesa.id);
//     setDragOffset({
//       x: e.clientX - mesa.posX,
//       y: e.clientY - mesa.posY,
//     });
//   };

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (!draggedMesaId) return;

//     const newX = Math.max(0, e.clientX - dragOffset.x);
//     const newY = Math.max(0, e.clientY - dragOffset.y);

//     setMesas((prev) =>
//       prev.map((m) =>
//         m.id === draggedMesaId
//           ? { ...m, posX: Math.round(newX), posY: Math.round(newY) }
//           : m
//       )
//     );
//   };

//   const handleMouseUp = () => {
//     setDraggedMesaId(null);
//   };

//   // 3. Guardar todo el layout modificado (PUT /mesas/layout)
//   const guardarLayout = async () => {
//     try {
//       setSaving(true);
//       const itemsToUpdate = mesas.map((m) => ({
//         id: m.id,
//         posX: m.posX,
//         posY: m.posY,
//         width: m.width,
//         height: m.height,
//       }));

//       const res = await fetch(`${API_URL}/mesas/layout`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(itemsToUpdate),
//       });

//       if (res.ok) {
//         alert('¡Layout del plano guardado con éxito!');
//       } else {
//         alert('Error al guardar el layout');
//       }
//     } catch (error) {
//       console.error('Error guardando layout:', error);
//       alert('Error de conexión al guardar');
//     } finally {
//       setSaving(false);
//     }
//   };

//   // 4. Crear nueva mesa/elemento (POST /mesas)
//   const crearMesa = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!nuevaMesa.numero.trim()) {
//       alert('Ingresa un número o nombre para el elemento (Ej: Pista Principal, Mesa 5)');
//       return;
//     }

//     // Dimensiones iniciales compactas según el tipo de elemento
//     let initialWidth = 64;
//     let initialHeight = 64;

//     if (nuevaMesa.tipo === 'BARRA') {
//       initialWidth = 200;
//       initialHeight = 44;
//     } else if (nuevaMesa.tipo === 'ESCENARIO') {
//       initialWidth = 150;
//       initialHeight = 72;
//     } else if (nuevaMesa.tipo === 'VIP') {
//       initialWidth = 92;
//       initialHeight = 92;
//     } else if (nuevaMesa.tipo === 'PISTA_BAILE') {
//       initialWidth = 176;
//       initialHeight = 120;
//     } else if (nuevaMesa.tipo === 'BANO') {
//       initialWidth = 72;
//       initialHeight = 72;
//     }

//     // Posición escalonada para que los elementos nuevos no se apilen en (30,30)
//     const offset = (mesas.length % 8) * 16;

//     try {
//       const res = await fetch(`${API_URL}/mesas`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           numero: nuevaMesa.numero,
//           tipo: nuevaMesa.tipo,
//           capacidad: Number(nuevaMesa.capacidad),
//           posX: 30 + offset,
//           posY: 30 + offset,
//           width: initialWidth,
//           height: initialHeight,
//         }),
//       });

//       if (res.ok) {
//         const creada = await res.json();
//         const mesaFormateada = {
//           ...creada,
//           id: creada.id || creada._id,
//         };

//         setMesas((prev) => [...prev, mesaFormateada]);
//         setNuevaMesa({ numero: '', tipo: 'MESA', capacidad: 4 });
//       } else {
//         const err = await res.json().catch(() => ({}));
//         console.error('❌ Error del backend:', err);
//         alert(`Error al crear elemento: ${err.error || err.message || JSON.stringify(err) || 'Respuesta no válida'}`);
//       }
//     } catch (error) {
//       console.error('Error creando mesa/elemento:', error);
//       alert('Ocurrió un error de conexión al crear el elemento');
//     }
//   };

//   // 5. Eliminar elemento del plano (DELETE /mesas/:id)
//   const eliminarMesa = async (id: string) => {
//     if (!confirm('¿Estás seguro de eliminar este elemento del plano?')) return;

//     try {
//       const res = await fetch(`${API_URL}/mesas/${id}`, { method: 'DELETE' });
//       if (res.ok) {
//         setMesas((prev) => prev.filter((m) => m.id !== id));
//       }
//     } catch (error) {
//       console.error('Error eliminando mesa:', error);
//     }
//   };

//   // Helper para los estilos según el tipo de elemento
//   const getTipoEstilo = (tipo: string) => {
//     switch (tipo) {
//       case 'VIP':
//         return 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-amber-500/10';
//       case 'BARRA':
//         return 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-cyan-500/20';
//       case 'ESCENARIO':
//         return 'bg-purple-950/60 border-purple-500 text-purple-200 font-bold uppercase tracking-widest';
//       case 'PISTA_BAILE':
//         return 'bg-pink-950/40 border-pink-500/80 text-pink-300 font-bold uppercase tracking-wider border-dashed shadow-pink-500/20';
//       case 'BANO':
//         return 'bg-slate-800/60 border-slate-400 text-slate-200 shadow-slate-400/20';
//       default:
//         return 'bg-zinc-800 border-zinc-600 text-zinc-100';
//     }
//   };

//   return (
//     <div
//       className={
//         pantallaCompleta
//           ? 'fixed inset-0 z-50 bg-zinc-950 text-white p-4 flex flex-col gap-4 overflow-hidden'
//           : 'p-6 max-w-7xl mx-auto space-y-6 text-white min-h-screen'
//       }
//     >
//       {/* HEADER */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800 shrink-0">
//         <div>
//           <h1 className="text-2xl font-bold flex items-center gap-2">
//             <Layout className="text-amber-500" /> Editor del Plano de Mesas
//           </h1>
//           <p className={`text-zinc-400 text-sm ${pantallaCompleta ? 'hidden' : ''}`}>
//             Arrastra los elementos para ubicarlos en el lienzo y guarda los cambios.
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           {/* Botón de pantalla completa: oculta el sidebar y expande el lienzo */}
//           <button
//             onClick={() => setPantallaCompleta((v) => !v)}
//             title={pantallaCompleta ? 'Salir de pantalla completa (Esc)' : 'Pantalla completa'}
//             className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium px-4 py-2.5 rounded-lg transition cursor-pointer"
//           >
//             {pantallaCompleta ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
//             <span className="hidden sm:inline">
//               {pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
//             </span>
//           </button>

//           <button
//             onClick={guardarLayout}
//             disabled={saving}
//             className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
//           >
//             <Save size={18} />
//             {saving ? 'Guardando...' : 'Guardar Plano'}
//           </button>
//         </div>
//       </div>

//       <div className={pantallaCompleta ? 'flex-1 min-h-0 flex flex-col' : 'grid grid-cols-1 lg:grid-cols-4 gap-6'}>
//         {/* PANEL LATERAL: FORMULARIO (se oculta en pantalla completa) */}
//         {!pantallaCompleta && (
//           <div className="lg:col-span-1 bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-4">
//             <h2 className="text-lg font-semibold flex items-center gap-2">
//               <Plus size={18} className="text-amber-500" /> Agregar Elemento
//             </h2>

//             <form onSubmit={crearMesa} className="space-y-3">
//               <div>
//                 <label className="text-xs text-zinc-400">Identificador / Número</label>
//                 <input
//                   type="text"
//                   placeholder="Ej: Mesa 1, Pista Principal, VIP 2"
//                   value={nuevaMesa.numero}
//                   onChange={(e) => setNuevaMesa({ ...nuevaMesa, numero: e.target.value })}
//                   className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
//                 />
//               </div>

//               <div>
//                 <label className="text-xs text-zinc-400">Tipo de Elemento</label>
//                 <select
//                   value={nuevaMesa.tipo}
//                   onChange={(e) =>
//                     setNuevaMesa({
//                       ...nuevaMesa,
//                       tipo: e.target.value as any,
//                     })
//                   }
//                   className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
//                 >
//                   <option value="MESA">Mesa Standard</option>
//                   <option value="VIP">Mesa VIP</option>
//                   <option value="BARRA">Barra</option>
//                   <option value="ESCENARIO">Escenario / DJ</option>
//                   <option value="PISTA_BAILE">Pista de Baile 💃</option>
//                   <option value="BANO">Baño 🚻</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="text-xs text-zinc-400">Capacidad / Aforo Estimado</label>
//                 <input
//                   type="number"
//                   value={nuevaMesa.capacidad}
//                   onChange={(e) =>
//                     setNuevaMesa({
//                       ...nuevaMesa,
//                       capacidad: Number(e.target.value),
//                     })
//                   }
//                   className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-medium py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer"
//               >
//                 <Plus size={16} /> Crear Elemento
//               </button>
//             </form>
//           </div>
//         )}

//         {/* LIENZO / CANVAS INTERACTIVO */}
//         <div
//           className={`bg-zinc-950 p-4 rounded-xl border border-zinc-800 overflow-hidden ${
//             pantallaCompleta ? 'flex-1 min-h-0 flex flex-col' : 'lg:col-span-3'
//           }`}
//         >
//           {loading ? (
//             <div
//               className={`flex items-center justify-center text-zinc-500 ${
//                 pantallaCompleta ? 'h-full' : 'h-[550px]'
//               }`}
//             >
//               Cargando plano...
//             </div>
//           ) : (
//             <div
//               className={`relative w-full bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800 overflow-auto select-none ${
//                 pantallaCompleta ? 'flex-1 min-h-0' : 'h-[550px]'
//               }`}
//               style={{
//                 backgroundImage:
//                   'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
//                 backgroundSize: '20px 20px',
//               }}
//               onMouseMove={handleMouseMove}
//               onMouseUp={handleMouseUp}
//             >
//               {mesas.map((mesa) => (
//                 <div
//                   key={mesa.id}
//                   onMouseDown={(e) => handleMouseDown(e, mesa)}
//                   style={{
//                     position: 'absolute',
//                     left: `${mesa.posX}px`,
//                     top: `${mesa.posY}px`,
//                     width: `${mesa.width}px`,
//                     height: `${mesa.height}px`,
//                   }}
//                   className={`cursor-grab active:cursor-grabbing border-2 rounded-lg p-1.5 flex flex-col justify-between shadow-lg transition-shadow hover:shadow-amber-500/10 ${getTipoEstilo(
//                     mesa.tipo
//                   )}`}
//                 >
//                   <div className="flex justify-between items-center gap-1">
//                     <span className="font-bold text-[11px] truncate flex items-center gap-1">
//                       {mesa.tipo === 'PISTA_BAILE' && <Disc size={11} className="animate-spin" />}
//                       {mesa.tipo === 'BANO' && '🚻 '}
//                       {mesa.numero}
//                     </span>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         eliminarMesa(mesa.id);
//                       }}
//                       className="text-zinc-400 hover:text-red-400 transition shrink-0 cursor-pointer"
//                       title="Eliminar elemento"
//                     >
//                       <Trash2 size={12} />
//                     </button>
//                   </div>

//                   <div className="flex justify-between items-end text-[10px] opacity-80">
//                     <span className="flex items-center gap-1">
//                       <Users size={10} /> {mesa.capacidad}
//                     </span>
//                     <Move size={10} className="opacity-50" />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import {
//   Plus,
//   Save,
//   Trash2,
//   Move,
//   Layout,
//   Users,
//   Disc,
//   Maximize2,
//   Minimize2,
//   Layers,
// } from 'lucide-react';

// interface IMesa {
//   id: string;
//   numero: string;
//   tipo: 'MESA' | 'BARRA' | 'ESCENARIO' | 'VIP' | 'PISTA_BAILE' | 'BANO';
//   capacidad: number;
//   posX: number;
//   posY: number;
//   width: number;
//   height: number;
// }

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// // Zonas del lienzo según el plano del local:
// // Z3 (arriba-izq) · Z1 (arriba-der) · Z4 (abajo-izq) · Z2 (abajo-der)
// type ZonaId = 'Z1' | 'Z2' | 'Z3' | 'Z4';

// const ZONAS: ZonaId[] = ['Z1', 'Z2', 'Z3', 'Z4'];

// const POSICION_ZONA: Record<ZonaId, { left: string; top: string }> = {
//   Z1: { left: '50%', top: '0%' },
//   Z2: { left: '50%', top: '50%' },
//   Z3: { left: '0%', top: '0%' },
//   Z4: { left: '0%', top: '50%' },
// };

// const COLORES_ZONA: Record<ZonaId, string> = {
//   Z1: 'text-emerald-300 border-emerald-500/60',
//   Z2: 'text-sky-300 border-sky-500/60',
//   Z3: 'text-orange-300 border-orange-500/60',
//   Z4: 'text-fuchsia-300 border-fuchsia-500/60',
// };

// export default function AdminMesasPage() {
//   const [mesas, setMesas] = useState<IMesa[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [draggedMesaId, setDraggedMesaId] = useState<string | null>(null);
//   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

//   // Pantalla completa: oculta el panel lateral y expande el lienzo
//   const [pantallaCompleta, setPantallaCompleta] = useState(false);

//   // Zonas: overlay de división del lienzo y tamaño medido del canvas
//   const [verZonas, setVerZonas] = useState(true);
//   const canvasRef = useRef<HTMLDivElement>(null);
//   const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

//   // Formulario para crear nueva mesa o elemento
//   const [nuevaMesa, setNuevaMesa] = useState({
//     numero: '',
//     tipo: 'MESA' as 'MESA' | 'BARRA' | 'ESCENARIO' | 'VIP' | 'PISTA_BAILE' | 'BANO',
//     capacidad: 4,
//     zona: 'Z1' as ZonaId,
//   });

//   // 1. Cargar mesas activas al montar el componente
//   useEffect(() => {
//     fetchMesas();
//   }, []);

//   // Salir de pantalla completa con la tecla Escape
//   useEffect(() => {
//     if (!pantallaCompleta) return;
//     const manejarTecla = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') setPantallaCompleta(false);
//     };
//     window.addEventListener('keydown', manejarTecla);
//     return () => window.removeEventListener('keydown', manejarTecla);
//   }, [pantallaCompleta]);

//   // Medir el tamaño del lienzo para calcular la división por zonas
//   useEffect(() => {
//     const el = canvasRef.current;
//     if (!el) return;
//     const actualizar = () => setCanvasSize({ w: el.clientWidth, h: el.clientHeight });
//     actualizar();
//     const observer = new ResizeObserver(actualizar);
//     observer.observe(el);
//     return () => observer.disconnect();
//   }, [loading]);

//   const fetchMesas = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(`${API_URL}/mesas`);
//       const data = await res.json();
//       if (Array.isArray(data)) {
//         setMesas(data);
//       }
//     } catch (error) {
//       console.error('Error cargando mesas:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 2. Manejo de Drag & Drop en el canvas
//   const handleMouseDown = (e: React.MouseEvent, mesa: IMesa) => {
//     setDraggedMesaId(mesa.id);
//     setDragOffset({
//       x: e.clientX - mesa.posX,
//       y: e.clientY - mesa.posY,
//     });
//   };

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (!draggedMesaId) return;

//     const newX = Math.max(0, e.clientX - dragOffset.x);
//     const newY = Math.max(0, e.clientY - dragOffset.y);

//     setMesas((prev) =>
//       prev.map((m) =>
//         m.id === draggedMesaId
//           ? { ...m, posX: Math.round(newX), posY: Math.round(newY) }
//           : m
//       )
//     );
//   };

//   const handleMouseUp = () => {
//     setDraggedMesaId(null);
//   };

//   // 3. Guardar todo el layout modificado (PUT /mesas/layout)
//   const guardarLayout = async () => {
//     try {
//       setSaving(true);
//       const itemsToUpdate = mesas.map((m) => ({
//         id: m.id,
//         posX: m.posX,
//         posY: m.posY,
//         width: m.width,
//         height: m.height,
//       }));

//       const res = await fetch(`${API_URL}/mesas/layout`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(itemsToUpdate),
//       });

//       if (res.ok) {
//         alert('¡Layout del plano guardado con éxito!');
//       } else {
//         alert('Error al guardar el layout');
//       }
//     } catch (error) {
//       console.error('Error guardando layout:', error);
//       alert('Error de conexión al guardar');
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Zona de una posición del lienzo (según el plano: Z3·Z1 arriba, Z4·Z2 abajo)
//   const getZonaDe = (x: number, y: number): ZonaId => {
//     if (canvasSize.w === 0 || canvasSize.h === 0) return 'Z1';
//     const arriba = y < canvasSize.h / 2;
//     const derecha = x >= canvasSize.w / 2;
//     if (arriba && derecha) return 'Z1';
//     if (!arriba && derecha) return 'Z2';
//     if (arriba && !derecha) return 'Z3';
//     return 'Z4';
//   };

//   // Centro de cada zona para ubicar los elementos nuevos
//   const centroDeZona = (zona: ZonaId) => ({
//     x: zona === 'Z3' || zona === 'Z4' ? canvasSize.w * 0.25 : canvasSize.w * 0.75,
//     y: zona === 'Z3' || zona === 'Z1' ? canvasSize.h * 0.25 : canvasSize.h * 0.75,
//   });

//   // 4. Crear nueva mesa/elemento (POST /mesas)
//   const crearMesa = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!nuevaMesa.numero.trim()) {
//       alert('Ingresa un número o nombre para el elemento (Ej: Pista Principal, Mesa 5)');
//       return;
//     }

//     // Dimensiones iniciales compactas según el tipo de elemento
//     let initialWidth = 64;
//     let initialHeight = 64;

//     if (nuevaMesa.tipo === 'BARRA') {
//       initialWidth = 200;
//       initialHeight = 44;
//     } else if (nuevaMesa.tipo === 'ESCENARIO') {
//       initialWidth = 150;
//       initialHeight = 72;
//     } else if (nuevaMesa.tipo === 'VIP') {
//       initialWidth = 92;
//       initialHeight = 92;
//     } else if (nuevaMesa.tipo === 'PISTA_BAILE') {
//       initialWidth = 176;
//       initialHeight = 120;
//     } else if (nuevaMesa.tipo === 'BANO') {
//       initialWidth = 72;
//       initialHeight = 72;
//     }

//     // Spawn en el centro de la zona elegida, escalonado para no apilar
//     const offset = (mesas.length % 8) * 16;
//     const centro = centroDeZona(nuevaMesa.zona);
//     const spawnX = Math.max(0, Math.round(centro.x - initialWidth / 2 + offset));
//     const spawnY = Math.max(0, Math.round(centro.y - initialHeight / 2 + offset));

//     try {
//       const res = await fetch(`${API_URL}/mesas`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           numero: nuevaMesa.numero,
//           tipo: nuevaMesa.tipo,
//           capacidad: Number(nuevaMesa.capacidad),
//           posX: spawnX,
//           posY: spawnY,
//           width: initialWidth,
//           height: initialHeight,
//         }),
//       });

//       if (res.ok) {
//         const creada = await res.json();
//         const mesaFormateada = {
//           ...creada,
//           id: creada.id || creada._id,
//         };

//         setMesas((prev) => [...prev, mesaFormateada]);
//         setNuevaMesa({ numero: '', tipo: 'MESA', capacidad: 4, zona: nuevaMesa.zona });
//       } else {
//         const err = await res.json().catch(() => ({}));
//         console.error('❌ Error del backend:', err);
//         alert(`Error al crear elemento: ${err.error || err.message || JSON.stringify(err) || 'Respuesta no válida'}`);
//       }
//     } catch (error) {
//       console.error('Error creando mesa/elemento:', error);
//       alert('Ocurrió un error de conexión al crear el elemento');
//     }
//   };

//   // 5. Eliminar elemento del plano (DELETE /mesas/:id)
//   const eliminarMesa = async (id: string) => {
//     if (!confirm('¿Estás seguro de eliminar este elemento del plano?')) return;

//     try {
//       const res = await fetch(`${API_URL}/mesas/${id}`, { method: 'DELETE' });
//       if (res.ok) {
//         setMesas((prev) => prev.filter((m) => m.id !== id));
//       }
//     } catch (error) {
//       console.error('Error eliminando mesa:', error);
//     }
//   };

//   // Helper para los estilos según el tipo de elemento
//   const getTipoEstilo = (tipo: string) => {
//     switch (tipo) {
//       case 'VIP':
//         return 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-amber-500/10';
//       case 'BARRA':
//         return 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-cyan-500/20';
//       case 'ESCENARIO':
//         return 'bg-purple-950/60 border-purple-500 text-purple-200 font-bold uppercase tracking-widest';
//       case 'PISTA_BAILE':
//         return 'bg-pink-950/40 border-pink-500/80 text-pink-300 font-bold uppercase tracking-wider border-dashed shadow-pink-500/20';
//       case 'BANO':
//         return 'bg-slate-800/60 border-slate-400 text-slate-200 shadow-slate-400/20';
//       default:
//         return 'bg-zinc-800 border-zinc-600 text-zinc-100';
//     }
//   };

//   return (
//     <div
//       className={
//         pantallaCompleta
//           ? 'fixed inset-0 z-50 bg-zinc-950 text-white p-4 flex flex-col gap-4 overflow-hidden'
//           : 'p-6 max-w-7xl mx-auto space-y-6 text-white min-h-screen'
//       }
//     >
//       {/* HEADER */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800 shrink-0">
//         <div>
//           <h1 className="text-2xl font-bold flex items-center gap-2">
//             <Layout className="text-amber-500" /> Editor del Plano de Mesas
//           </h1>
//           <p className={`text-zinc-400 text-sm ${pantallaCompleta ? 'hidden' : ''}`}>
//             Arrastra los elementos para ubicarlos en el lienzo y guarda los cambios.
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           {/* Botón para mostrar/ocultar la división por zonas */}
//           <button
//             onClick={() => setVerZonas((v) => !v)}
//             title={verZonas ? 'Ocultar división por zonas' : 'Mostrar división por zonas'}
//             className={`flex items-center gap-2 border font-medium px-4 py-2.5 rounded-lg transition cursor-pointer ${
//               verZonas
//                 ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-300'
//                 : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
//             }`}
//           >
//             <Layers size={18} />
//             <span className="hidden sm:inline">{verZonas ? 'Ocultar zonas' : 'Ver zonas'}</span>
//           </button>

//           {/* Botón de pantalla completa: oculta el sidebar y expande el lienzo */}
//           <button
//             onClick={() => setPantallaCompleta((v) => !v)}
//             title={pantallaCompleta ? 'Salir de pantalla completa (Esc)' : 'Pantalla completa'}
//             className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium px-4 py-2.5 rounded-lg transition cursor-pointer"
//           >
//             {pantallaCompleta ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
//             <span className="hidden sm:inline">
//               {pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
//             </span>
//           </button>

//           <button
//             onClick={guardarLayout}
//             disabled={saving}
//             className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
//           >
//             <Save size={18} />
//             {saving ? 'Guardando...' : 'Guardar Plano'}
//           </button>
//         </div>
//       </div>

//       <div className={pantallaCompleta ? 'flex-1 min-h-0 flex flex-col' : 'grid grid-cols-1 lg:grid-cols-4 gap-6'}>
//         {/* PANEL LATERAL: FORMULARIO (se oculta en pantalla completa) */}
//         {!pantallaCompleta && (
//           <div className="lg:col-span-1 bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-4">
//             <h2 className="text-lg font-semibold flex items-center gap-2">
//               <Plus size={18} className="text-amber-500" /> Agregar Elemento
//             </h2>

//             <form onSubmit={crearMesa} className="space-y-3">
//               <div>
//                 <label className="text-xs text-zinc-400">Identificador / Número</label>
//                 <input
//                   type="text"
//                   placeholder="Ej: Mesa 1, Pista Principal, VIP 2"
//                   value={nuevaMesa.numero}
//                   onChange={(e) => setNuevaMesa({ ...nuevaMesa, numero: e.target.value })}
//                   className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
//                 />
//               </div>

//               <div>
//                 <label className="text-xs text-zinc-400">Tipo de Elemento</label>
//                 <select
//                   value={nuevaMesa.tipo}
//                   onChange={(e) =>
//                     setNuevaMesa({
//                       ...nuevaMesa,
//                       tipo: e.target.value as any,
//                     })
//                   }
//                   className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
//                 >
//                   <option value="MESA">Mesa Standard</option>
//                   <option value="VIP">Mesa VIP</option>
//                   <option value="BARRA">Barra</option>
//                   <option value="ESCENARIO">Escenario / DJ</option>
//                   <option value="PISTA_BAILE">Pista de Baile 💃</option>
//                   <option value="BANO">Baño 🚻</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="text-xs text-zinc-400">Zona del lienzo</label>
//                 <select
//                   value={nuevaMesa.zona}
//                   onChange={(e) =>
//                     setNuevaMesa({ ...nuevaMesa, zona: e.target.value as ZonaId })
//                   }
//                   className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
//                 >
//                   <option value="Z1">Z1 · Arriba derecha (Mesas 1-12)</option>
//                   <option value="Z2">Z2 · Abajo derecha (Mesas 30-34)</option>
//                   <option value="Z3">Z3 · Arriba izquierda (Mesas 13-24)</option>
//                   <option value="Z4">Z4 · Abajo izquierda (Mesas 25-29)</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="text-xs text-zinc-400">Capacidad / Aforo Estimado</label>
//                 <input
//                   type="number"
//                   value={nuevaMesa.capacidad}
//                   onChange={(e) =>
//                     setNuevaMesa({
//                       ...nuevaMesa,
//                       capacidad: Number(e.target.value),
//                     })
//                   }
//                   className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-medium py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer"
//               >
//                 <Plus size={16} /> Crear Elemento
//               </button>
//             </form>
//           </div>
//         )}

//         {/* LIENZO / CANVAS INTERACTIVO */}
//         <div
//           className={`bg-zinc-950 p-4 rounded-xl border border-zinc-800 overflow-hidden ${
//             pantallaCompleta ? 'flex-1 min-h-0 flex flex-col' : 'lg:col-span-3'
//           }`}
//         >
//           {/* LEYENDA DE ZONAS con conteo de elementos */}
//           {!loading && verZonas && (
//             <div className="flex flex-wrap items-center gap-2 mb-3 shrink-0">
//               {ZONAS.map((z) => (
//                 <span
//                   key={z}
//                   className={`text-[11px] font-semibold px-2 py-1 rounded border bg-zinc-900/60 ${
//                     COLORES_ZONA[z]
//                   }`}
//                 >
//                   {z}: {mesas.filter((m) => getZonaDe(m.posX, m.posY) === z).length} elem.
//                 </span>
//               ))}
//             </div>
//           )}

//           {loading ? (
//             <div
//               className={`flex items-center justify-center text-zinc-500 ${
//                 pantallaCompleta ? 'h-full' : 'h-[550px]'
//               }`}
//             >
//               Cargando plano...
//             </div>
//           ) : (
//             <div
//               ref={canvasRef}
//               className={`relative w-full bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800 overflow-auto select-none ${
//                 pantallaCompleta ? 'flex-1 min-h-0' : 'h-[550px]'
//               }`}
//               style={{
//                 backgroundImage:
//                   'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
//                 backgroundSize: '20px 20px',
//               }}
//               onMouseMove={handleMouseMove}
//               onMouseUp={handleMouseUp}
//             >
//               {/* DIVISIÓN POR ZONAS según el plano (decorativa, no intercepta el mouse) */}
//               {verZonas && canvasSize.w > 0 && (
//                 <>
//                   {ZONAS.map((z) => (
//                     <div
//                       key={z}
//                       className="absolute pointer-events-none border border-dashed z-0"
//                       style={{
//                         left: POSICION_ZONA[z].left,
//                         top: POSICION_ZONA[z].top,
//                         width: '50%',
//                         height: '50%',
//                       }}
//                     >
//                       <span
//                         className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded border bg-zinc-950/80 ${
//                           COLORES_ZONA[z]
//                         }`}
//                       >
//                         {z}
//                       </span>
//                     </div>
//                   ))}
//                 </>
//               )}

//               {mesas.map((mesa) => (
//                 <div
//                   key={mesa.id}
//                   onMouseDown={(e) => handleMouseDown(e, mesa)}
//                   style={{
//                     position: 'absolute',
//                     left: `${mesa.posX}px`,
//                     top: `${mesa.posY}px`,
//                     width: `${mesa.width}px`,
//                     height: `${mesa.height}px`,
//                   }}
//                   className={`cursor-grab active:cursor-grabbing border-2 rounded-lg p-1.5 flex flex-col justify-between shadow-lg transition-shadow hover:shadow-amber-500/10 ${getTipoEstilo(
//                     mesa.tipo
//                   )}`}
//                 >
//                   <div className="flex justify-between items-center gap-1">
//                     <span className="font-bold text-[11px] truncate flex items-center gap-1">
//                       {mesa.tipo === 'PISTA_BAILE' && <Disc size={11} className="animate-spin" />}
//                       {mesa.tipo === 'BANO' && '🚻 '}
//                       {mesa.numero}
//                     </span>
//                     {verZonas && (
//                       <span
//                         className={`text-[9px] font-bold px-1 rounded border leading-4 shrink-0 bg-zinc-950/60 ${COLORES_ZONA[
//                           getZonaDe(mesa.posX, mesa.posY)
//                         ]}`}
//                       >
//                         {getZonaDe(mesa.posX, mesa.posY)}
//                       </span>
//                     )}
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         eliminarMesa(mesa.id);
//                       }}
//                       className="text-zinc-400 hover:text-red-400 transition shrink-0 cursor-pointer"
//                       title="Eliminar elemento"
//                     >
//                       <Trash2 size={12} />
//                     </button>
//                   </div>

//                   <div className="flex justify-between items-end text-[10px] opacity-80">
//                     <span className="flex items-center gap-1">
//                       <Users size={10} /> {mesa.capacidad}
//                     </span>
//                     <Move size={10} className="opacity-50" />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import {
//   Plus,
//   Save,
//   Trash2,
//   Move,
//   Layout,
//   Users,
//   Disc,
//   Maximize2,
//   Minimize2,
//   Layers,
//   Shrink,
// } from 'lucide-react';

// interface IMesa {
//   id: string;
//   numero: string;
//   tipo: 'MESA' | 'BARRA' | 'ESCENARIO' | 'VIP' | 'PISTA_BAILE' | 'BANO';
//   capacidad: number;
//   posX: number;
//   posY: number;
//   width: number;
//   height: number;
// }

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// // Zonas del lienzo según el plano del local:
// // Z3 (arriba-izq) · Z1 (arriba-der) · Z4 (abajo-izq) · Z2 (abajo-der)
// type ZonaId = 'Z1' | 'Z2' | 'Z3' | 'Z4';

// const ZONAS: ZonaId[] = ['Z1', 'Z2', 'Z3', 'Z4'];

// const POSICION_ZONA: Record<ZonaId, { left: string; top: string }> = {
//   Z1: { left: '50%', top: '0%' },
//   Z2: { left: '50%', top: '50%' },
//   Z3: { left: '0%', top: '0%' },
//   Z4: { left: '0%', top: '50%' },
// };

// const COLORES_ZONA: Record<ZonaId, string> = {
//   Z1: 'text-emerald-300 border-emerald-500/60',
//   Z2: 'text-sky-300 border-sky-500/60',
//   Z3: 'text-orange-300 border-orange-500/60',
//   Z4: 'text-fuchsia-300 border-fuchsia-500/60',
// };

// // Tamaños iniciales compactos por tipo de elemento (px)
// const TAMAÑO_POR_TIPO: Record<string, { w: number; h: number }> = {
//   MESA: { w: 64, h: 64 },
//   VIP: { w: 92, h: 92 },
//   BARRA: { w: 200, h: 44 },
//   ESCENARIO: { w: 150, h: 72 },
//   PISTA_BAILE: { w: 176, h: 120 },
//   BANO: { w: 72, h: 72 },
// };

// // Límites al redimensionar (nunca más pequeños que esto)
// const MIN_ANCHO = 40;
// const MIN_ALTO = 36;

// export default function AdminMesasPage() {
//   const [mesas, setMesas] = useState<IMesa[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [draggedMesaId, setDraggedMesaId] = useState<string | null>(null);
//   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

//   // Elemento seleccionado (muestra anillo y tiradores de redimensionado)
//   const [selectedMesaId, setSelectedMesaId] = useState<string | null>(null);
//   const [resizeState, setResizeState] = useState<{
//     id: string;
//     eje: 'ambos' | 'x' | 'y';
//     originX: number;
//     originY: number;
//     startW: number;
//     startH: number;
//   } | null>(null);

//   // Pantalla completa: oculta el panel lateral y expande el lienzo
//   const [pantallaCompleta, setPantallaCompleta] = useState(false);

//   // Zonas: overlay de división del lienzo y tamaño medido del canvas
//   const [verZonas, setVerZonas] = useState(true);
//   const canvasRef = useRef<HTMLDivElement>(null);
//   const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

//   // Formulario para crear nueva mesa o elemento
//   const [nuevaMesa, setNuevaMesa] = useState({
//     numero: '',
//     tipo: 'MESA' as 'MESA' | 'BARRA' | 'ESCENARIO' | 'VIP' | 'PISTA_BAILE' | 'BANO',
//     capacidad: 4,
//     zona: 'Z1' as ZonaId,
//   });

//   // 1. Cargar mesas activas al montar el componente
//   useEffect(() => {
//     fetchMesas();
//   }, []);

//   // Salir de pantalla completa con la tecla Escape
//   useEffect(() => {
//     if (!pantallaCompleta) return;
//     const manejarTecla = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') setPantallaCompleta(false);
//     };
//     window.addEventListener('keydown', manejarTecla);
//     return () => window.removeEventListener('keydown', manejarTecla);
//   }, [pantallaCompleta]);

//   // Medir el tamaño del lienzo para calcular la división por zonas
//   useEffect(() => {
//     const el = canvasRef.current;
//     if (!el) return;
//     const actualizar = () => setCanvasSize({ w: el.clientWidth, h: el.clientHeight });
//     actualizar();
//     const observer = new ResizeObserver(actualizar);
//     observer.observe(el);
//     return () => observer.disconnect();
//   }, [loading]);

//   // Soltar el arrastre/redimensionado aunque el mouse se suelte fuera del lienzo
//   useEffect(() => {
//     const soltar = () => {
//       setDraggedMesaId(null);
//       setResizeState(null);
//     };
//     window.addEventListener('mouseup', soltar);
//     return () => window.removeEventListener('mouseup', soltar);
//   }, []);

//   const fetchMesas = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(`${API_URL}/mesas`);
//       const data = await res.json();
//       if (Array.isArray(data)) {
//         setMesas(data);
//       }
//     } catch (error) {
//       console.error('Error cargando mesas:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 2. Manejo de Drag & Drop en el canvas
//   const handleMouseDown = (e: React.MouseEvent, mesa: IMesa) => {
//     e.stopPropagation(); // el clic sobre una mesa no deselecciona en el lienzo
//     setSelectedMesaId(mesa.id);
//     setDraggedMesaId(mesa.id);
//     setDragOffset({
//       x: e.clientX - mesa.posX,
//       y: e.clientY - mesa.posY,
//     });
//   };

//   const handleMouseMove = (e: React.MouseEvent) => {
//     // Redimensionado en vivo desde los tiradores
//     if (resizeState) {
//       const dx = e.clientX - resizeState.originX;
//       const dy = e.clientY - resizeState.originY;
//       setMesas((prev) =>
//         prev.map((m) => {
//           if (m.id !== resizeState.id) return m;
//           const maxW = canvasSize.w > 0 ? canvasSize.w - m.posX - 2 : 800;
//           const maxH = canvasSize.h > 0 ? canvasSize.h - m.posY - 2 : 800;
//           const width =
//             resizeState.eje === 'y'
//               ? m.width
//               : Math.min(maxW, Math.max(MIN_ANCHO, resizeState.startW + dx));
//           const height =
//             resizeState.eje === 'x'
//               ? m.height
//               : Math.min(maxH, Math.max(MIN_ALTO, resizeState.startH + dy));
//           return { ...m, width: Math.round(width), height: Math.round(height) };
//         })
//       );
//       return;
//     }

//     if (!draggedMesaId) return;

//     const newX = Math.max(0, e.clientX - dragOffset.x);
//     const newY = Math.max(0, e.clientY - dragOffset.y);

//     setMesas((prev) =>
//       prev.map((m) =>
//         m.id === draggedMesaId
//           ? { ...m, posX: Math.round(newX), posY: Math.round(newY) }
//           : m
//       )
//     );
//   };

//   const handleMouseUp = () => {
//     setDraggedMesaId(null);
//     setResizeState(null);
//   };

//   // Iniciar redimensionado desde un tirador (esquina = ambos ejes)
//   const handleResizeStart = (
//     e: React.MouseEvent,
//     mesa: IMesa,
//     eje: 'ambos' | 'x' | 'y'
//   ) => {
//     e.stopPropagation();
//     setSelectedMesaId(mesa.id);
//     setResizeState({
//       id: mesa.id,
//       eje,
//       originX: e.clientX,
//       originY: e.clientY,
//       startW: mesa.width,
//       startH: mesa.height,
//     });
//   };

//   // Doble clic: restaurar el tamaño compacto estándar del tipo de elemento
//   const resetTamaño = (mesa: IMesa) => {
//     const t = TAMAÑO_POR_TIPO[mesa.tipo] ?? TAMAÑO_POR_TIPO.MESA;
//     setMesas((prev) =>
//       prev.map((m) => (m.id === mesa.id ? { ...m, width: t.w, height: t.h } : m))
//     );
//   };

//   // Compactar todo: reduce a 70% los elementos grandes ya guardados en la BD
//   const compactarTodo = () => {
//     if (
//       !confirm(
//         '¿Reducir el tamaño de TODOS los elementos a 70%? Luego puedes ajustar cada uno con sus tiradores y guardar el plano.'
//       )
//     )
//       return;
//     setMesas((prev) =>
//       prev.map((m) => ({
//         ...m,
//         width: Math.max(MIN_ANCHO, Math.round(m.width * 0.7)),
//         height: Math.max(MIN_ALTO, Math.round(m.height * 0.7)),
//       }))
//     );
//   };

//   // 3. Guardar todo el layout modificado (PUT /mesas/layout)
//   const guardarLayout = async () => {
//     try {
//       setSaving(true);
//       const itemsToUpdate = mesas.map((m) => ({
//         id: m.id,
//         posX: m.posX,
//         posY: m.posY,
//         width: m.width,
//         height: m.height,
//       }));

//       const res = await fetch(`${API_URL}/mesas/layout`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(itemsToUpdate),
//       });

//       if (res.ok) {
//         alert('¡Layout del plano guardado con éxito!');
//       } else {
//         alert('Error al guardar el layout');
//       }
//     } catch (error) {
//       console.error('Error guardando layout:', error);
//       alert('Error de conexión al guardar');
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Zona de una posición del lienzo (según el plano: Z3·Z1 arriba, Z4·Z2 abajo)
//   const getZonaDe = (x: number, y: number): ZonaId => {
//     if (canvasSize.w === 0 || canvasSize.h === 0) return 'Z1';
//     const arriba = y < canvasSize.h / 2;
//     const derecha = x >= canvasSize.w / 2;
//     if (arriba && derecha) return 'Z1';
//     if (!arriba && derecha) return 'Z2';
//     if (arriba && !derecha) return 'Z3';
//     return 'Z4';
//   };

//   // Centro de cada zona para ubicar los elementos nuevos
//   const centroDeZona = (zona: ZonaId) => ({
//     x: zona === 'Z3' || zona === 'Z4' ? canvasSize.w * 0.25 : canvasSize.w * 0.75,
//     y: zona === 'Z3' || zona === 'Z1' ? canvasSize.h * 0.25 : canvasSize.h * 0.75,
//   });

//   // 4. Crear nueva mesa/elemento (POST /mesas)
//   const crearMesa = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!nuevaMesa.numero.trim()) {
//       alert('Ingresa un número o nombre para el elemento (Ej: Pista Principal, Mesa 5)');
//       return;
//     }

//     // Dimensiones iniciales compactas según el tipo de elemento
//     const { w: initialWidth, h: initialHeight } =
//       TAMAÑO_POR_TIPO[nuevaMesa.tipo] ?? TAMAÑO_POR_TIPO.MESA;

//     // Spawn en el centro de la zona elegida, escalonado para no apilar
//     const offset = (mesas.length % 8) * 16;
//     const centro = centroDeZona(nuevaMesa.zona);
//     const spawnX = Math.max(0, Math.round(centro.x - initialWidth / 2 + offset));
//     const spawnY = Math.max(0, Math.round(centro.y - initialHeight / 2 + offset));

//     try {
//       const res = await fetch(`${API_URL}/mesas`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           numero: nuevaMesa.numero,
//           tipo: nuevaMesa.tipo,
//           capacidad: Number(nuevaMesa.capacidad),
//           posX: spawnX,
//           posY: spawnY,
//           width: initialWidth,
//           height: initialHeight,
//         }),
//       });

//       if (res.ok) {
//         const creada = await res.json();
//         const mesaFormateada = {
//           ...creada,
//           id: creada.id || creada._id,
//         };

//         setMesas((prev) => [...prev, mesaFormateada]);
//         setNuevaMesa({ numero: '', tipo: 'MESA', capacidad: 4, zona: nuevaMesa.zona });
//       } else {
//         const err = await res.json().catch(() => ({}));
//         console.error('❌ Error del backend:', err);
//         alert(`Error al crear elemento: ${err.error || err.message || JSON.stringify(err) || 'Respuesta no válida'}`);
//       }
//     } catch (error) {
//       console.error('Error creando mesa/elemento:', error);
//       alert('Ocurrió un error de conexión al crear el elemento');
//     }
//   };

//   // 5. Eliminar elemento del plano (DELETE /mesas/:id)
//   const eliminarMesa = async (id: string) => {
//     if (!confirm('¿Estás seguro de eliminar este elemento del plano?')) return;

//     try {
//       const res = await fetch(`${API_URL}/mesas/${id}`, { method: 'DELETE' });
//       if (res.ok) {
//         setMesas((prev) => prev.filter((m) => m.id !== id));
//       }
//     } catch (error) {
//       console.error('Error eliminando mesa:', error);
//     }
//   };

//   // Helper para los estilos según el tipo de elemento
//   const getTipoEstilo = (tipo: string) => {
//     switch (tipo) {
//       case 'VIP':
//         return 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-amber-500/10';
//       case 'BARRA':
//         return 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-cyan-500/20';
//       case 'ESCENARIO':
//         return 'bg-purple-950/60 border-purple-500 text-purple-200 font-bold uppercase tracking-widest';
//       case 'PISTA_BAILE':
//         return 'bg-pink-950/40 border-pink-500/80 text-pink-300 font-bold uppercase tracking-wider border-dashed shadow-pink-500/20';
//       case 'BANO':
//         return 'bg-slate-800/60 border-slate-400 text-slate-200 shadow-slate-400/20';
//       default:
//         return 'bg-zinc-800 border-zinc-600 text-zinc-100';
//     }
//   };

//   return (
//     <div
//       className={
//         pantallaCompleta
//           ? 'fixed inset-0 z-50 bg-zinc-950 text-white p-4 flex flex-col gap-4 overflow-hidden'
//           : 'p-6 max-w-7xl mx-auto space-y-6 text-white min-h-screen'
//       }
//     >
//       {/* HEADER */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800 shrink-0">
//         <div>
//           <h1 className="text-2xl font-bold flex items-center gap-2">
//             <Layout className="text-amber-500" /> Editor del Plano de Mesas
//           </h1>
//           <p className={`text-zinc-400 text-sm ${pantallaCompleta ? 'hidden' : ''}`}>
//             Clic selecciona · arrastra mueve · tiradores ámbar redimensionan · doble clic restaura
//             el tamaño compacto. Guarda los cambios al terminar.
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           {/* Botón para mostrar/ocultar la división por zonas */}
//           <button
//             onClick={() => setVerZonas((v) => !v)}
//             title={verZonas ? 'Ocultar división por zonas' : 'Mostrar división por zonas'}
//             className={`flex items-center gap-2 border font-medium px-4 py-2.5 rounded-lg transition cursor-pointer ${
//               verZonas
//                 ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-300'
//                 : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
//             }`}
//           >
//             <Layers size={18} />
//             <span className="hidden sm:inline">{verZonas ? 'Ocultar zonas' : 'Ver zonas'}</span>
//           </button>

//           {/* Botón de pantalla completa: oculta el sidebar y expande el lienzo */}
//           <button
//             onClick={() => setPantallaCompleta((v) => !v)}
//             title={pantallaCompleta ? 'Salir de pantalla completa (Esc)' : 'Pantalla completa'}
//             className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium px-4 py-2.5 rounded-lg transition cursor-pointer"
//           >
//             {pantallaCompleta ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
//             <span className="hidden sm:inline">
//               {pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
//             </span>
//           </button>

//           {/* Compactar todo: arregla de un golpe los elementos grandes ya guardados */}
//           <button
//             onClick={compactarTodo}
//             title="Reduce todos los elementos a 70% de su tamaño actual"
//             className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium px-4 py-2.5 rounded-lg transition cursor-pointer"
//           >
//             <Shrink size={18} />
//             <span className="hidden sm:inline">Compactar todo</span>
//           </button>

//           <button
//             onClick={guardarLayout}
//             disabled={saving}
//             className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
//           >
//             <Save size={18} />
//             {saving ? 'Guardando...' : 'Guardar Plano'}
//           </button>
//         </div>
//       </div>

//       <div className={pantallaCompleta ? 'flex-1 min-h-0 flex flex-col' : 'grid grid-cols-1 lg:grid-cols-4 gap-6'}>
//         {/* PANEL LATERAL: FORMULARIO (se oculta en pantalla completa) */}
//         {!pantallaCompleta && (
//           <div className="lg:col-span-1 bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-4">
//             <h2 className="text-lg font-semibold flex items-center gap-2">
//               <Plus size={18} className="text-amber-500" /> Agregar Elemento
//             </h2>

//             <form onSubmit={crearMesa} className="space-y-3">
//               <div>
//                 <label className="text-xs text-zinc-400">Identificador / Número</label>
//                 <input
//                   type="text"
//                   placeholder="Ej: Mesa 1, Pista Principal, VIP 2"
//                   value={nuevaMesa.numero}
//                   onChange={(e) => setNuevaMesa({ ...nuevaMesa, numero: e.target.value })}
//                   className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
//                 />
//               </div>

//               <div>
//                 <label className="text-xs text-zinc-400">Tipo de Elemento</label>
//                 <select
//                   value={nuevaMesa.tipo}
//                   onChange={(e) =>
//                     setNuevaMesa({
//                       ...nuevaMesa,
//                       tipo: e.target.value as any,
//                     })
//                   }
//                   className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
//                 >
//                   <option value="MESA">Mesa Standard</option>
//                   <option value="VIP">Mesa VIP</option>
//                   <option value="BARRA">Barra</option>
//                   <option value="ESCENARIO">Escenario / DJ</option>
//                   <option value="PISTA_BAILE">Pista de Baile 💃</option>
//                   <option value="BANO">Baño 🚻</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="text-xs text-zinc-400">Zona del lienzo</label>
//                 <select
//                   value={nuevaMesa.zona}
//                   onChange={(e) =>
//                     setNuevaMesa({ ...nuevaMesa, zona: e.target.value as ZonaId })
//                   }
//                   className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
//                 >
//                   <option value="Z1">Z1 · Arriba derecha (Mesas 1-12)</option>
//                   <option value="Z2">Z2 · Abajo derecha (Mesas 30-34)</option>
//                   <option value="Z3">Z3 · Arriba izquierda (Mesas 13-24)</option>
//                   <option value="Z4">Z4 · Abajo izquierda (Mesas 25-29)</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="text-xs text-zinc-400">Capacidad / Aforo Estimado</label>
//                 <input
//                   type="number"
//                   value={nuevaMesa.capacidad}
//                   onChange={(e) =>
//                     setNuevaMesa({
//                       ...nuevaMesa,
//                       capacidad: Number(e.target.value),
//                     })
//                   }
//                   className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-medium py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer"
//               >
//                 <Plus size={16} /> Crear Elemento
//               </button>
//             </form>
//           </div>
//         )}

//         {/* LIENZO / CANVAS INTERACTIVO */}
//         <div
//           className={`bg-zinc-950 p-4 rounded-xl border border-zinc-800 overflow-hidden ${
//             pantallaCompleta ? 'flex-1 min-h-0 flex flex-col' : 'lg:col-span-3'
//           }`}
//         >
//           {/* LEYENDA DE ZONAS con conteo de elementos */}
//           {!loading && verZonas && (
//             <div className="flex flex-wrap items-center gap-2 mb-3 shrink-0">
//               {ZONAS.map((z) => (
//                 <span
//                   key={z}
//                   className={`text-[11px] font-semibold px-2 py-1 rounded border bg-zinc-900/60 ${
//                     COLORES_ZONA[z]
//                   }`}
//                 >
//                   {z}: {mesas.filter((m) => getZonaDe(m.posX, m.posY) === z).length} elem.
//                 </span>
//               ))}
//             </div>
//           )}

//           {loading ? (
//             <div
//               className={`flex items-center justify-center text-zinc-500 ${
//                 pantallaCompleta ? 'h-full' : 'h-[550px]'
//               }`}
//             >
//               Cargando plano...
//             </div>
//           ) : (
//             <div
//               ref={canvasRef}
//               className={`relative w-full bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800 overflow-auto select-none ${
//                 pantallaCompleta ? 'flex-1 min-h-0' : 'h-[550px]'
//               }`}
//               style={{
//                 backgroundImage:
//                   'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
//                 backgroundSize: '20px 20px',
//               }}
//               onMouseDown={() => setSelectedMesaId(null)}
//               onMouseMove={handleMouseMove}
//               onMouseUp={handleMouseUp}
//             >
//               {/* DIVISIÓN POR ZONAS según el plano (decorativa, no intercepta el mouse) */}
//               {verZonas && canvasSize.w > 0 && (
//                 <>
//                   {ZONAS.map((z) => (
//                     <div
//                       key={z}
//                       className="absolute pointer-events-none border border-dashed z-0"
//                       style={{
//                         left: POSICION_ZONA[z].left,
//                         top: POSICION_ZONA[z].top,
//                         width: '50%',
//                         height: '50%',
//                       }}
//                     >
//                       <span
//                         className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded border bg-zinc-950/80 ${
//                           COLORES_ZONA[z]
//                         }`}
//                       >
//                         {z}
//                       </span>
//                     </div>
//                   ))}
//                 </>
//               )}

//               {mesas.map((mesa) => (
//                 <div
//                   key={mesa.id}
//                   onMouseDown={(e) => handleMouseDown(e, mesa)}
//                   onDoubleClick={() => resetTamaño(mesa)}
//                   style={{
//                     position: 'absolute',
//                     left: `${mesa.posX}px`,
//                     top: `${mesa.posY}px`,
//                     width: `${mesa.width}px`,
//                     height: `${mesa.height}px`,
//                   }}
//                   className={`cursor-grab active:cursor-grabbing border-2 rounded-lg p-1.5 flex flex-col justify-between shadow-lg transition-shadow hover:shadow-amber-500/10 ${
//                     selectedMesaId === mesa.id ? 'ring-2 ring-amber-400 z-10' : ''
//                   } ${getTipoEstilo(mesa.tipo)}`}
//                 >
//                   {/* Tamaño en vivo mientras se redimensiona */}
//                   {resizeState?.id === mesa.id && (
//                     <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
//                       {mesa.width}×{mesa.height} px
//                     </span>
//                   )}

//                   {/* Tiradores de redimensionado (solo en el elemento seleccionado) */}
//                   {selectedMesaId === mesa.id && (
//                     <>
//                       <div
//                         onMouseDown={(e) => handleResizeStart(e, mesa, 'ambos')}
//                         className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-amber-400 border border-amber-600 rounded-tl-md cursor-nwse-resize z-20"
//                         title="Arrastra para redimensionar ancho y alto"
//                       />
//                       <div
//                         onMouseDown={(e) => handleResizeStart(e, mesa, 'x')}
//                         className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-6 bg-amber-400/90 rounded cursor-ew-resize z-20"
//                         title="Redimensionar ancho"
//                       />
//                       <div
//                         onMouseDown={(e) => handleResizeStart(e, mesa, 'y')}
//                         className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-6 h-2 bg-amber-400/90 rounded cursor-ns-resize z-20"
//                         title="Redimensionar alto"
//                       />
//                     </>
//                   )}
//                   <div className="flex justify-between items-center gap-1">
//                     <span className="font-bold text-[11px] truncate flex items-center gap-1">
//                       {mesa.tipo === 'PISTA_BAILE' && <Disc size={11} className="animate-spin" />}
//                       {mesa.tipo === 'BANO' && '🚻 '}
//                       {mesa.numero}
//                     </span>
//                     {verZonas && (
//                       <span
//                         className={`text-[9px] font-bold px-1 rounded border leading-4 shrink-0 bg-zinc-950/60 ${COLORES_ZONA[
//                           getZonaDe(mesa.posX, mesa.posY)
//                         ]}`}
//                       >
//                         {getZonaDe(mesa.posX, mesa.posY)}
//                       </span>
//                     )}
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         eliminarMesa(mesa.id);
//                       }}
//                       className="text-zinc-400 hover:text-red-400 transition shrink-0 cursor-pointer"
//                       title="Eliminar elemento"
//                     >
//                       <Trash2 size={12} />
//                     </button>
//                   </div>

//                   <div className="flex justify-between items-end text-[10px] opacity-80">
//                     <span className="flex items-center gap-1">
//                       <Users size={10} /> {mesa.capacidad}
//                     </span>
//                     <Move size={10} className="opacity-50" />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import {
//   Plus,
//   Save,
//   Trash2,
//   Move,
//   Layout,
//   Users,
//   Disc,
//   Maximize2,
//   Minimize2,
//   Layers,
//   Shrink,
// } from 'lucide-react';

// interface IMesa {
//   id: string;
//   numero: string;
//   tipo: 'MESA' | 'BARRA' | 'ESCENARIO' | 'VIP' | 'PISTA_BAILE' | 'BANO';
//   capacidad: number;
//   posX: number;
//   posY: number;
//   width: number;
//   height: number;
// }

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// // Zonas del lienzo según el plano del local:
// // Z3 (arriba-izq) · Z1 (arriba-der) · Z4 (abajo-izq) · Z2 (abajo-der)
// type ZonaId = 'Z1' | 'Z2' | 'Z3' | 'Z4';

// const ZONAS: ZonaId[] = ['Z1', 'Z2', 'Z3', 'Z4'];

// const POSICION_ZONA: Record<ZonaId, { left: string; top: string }> = {
//   Z1: { left: '50%', top: '0%' },
//   Z2: { left: '50%', top: '50%' },
//   Z3: { left: '0%', top: '0%' },
//   Z4: { left: '0%', top: '50%' },
// };

// const COLORES_ZONA: Record<ZonaId, string> = {
//   Z1: 'text-emerald-300 border-emerald-500/60',
//   Z2: 'text-sky-300 border-sky-500/60',
//   Z3: 'text-orange-300 border-orange-500/60',
//   Z4: 'text-fuchsia-300 border-fuchsia-500/60',
// };

// // Tamaños iniciales compactos por tipo de elemento (px)
// const TAMAÑO_POR_TIPO: Record<string, { w: number; h: number }> = {
//   MESA: { w: 64, h: 64 },
//   VIP: { w: 92, h: 92 },
//   BARRA: { w: 200, h: 44 },
//   ESCENARIO: { w: 150, h: 72 },
//   PISTA_BAILE: { w: 176, h: 120 },
//   BANO: { w: 72, h: 72 },
// };

// // Límites al redimensionar (nunca más pequeños que esto)
// const MIN_ANCHO = 40;
// const MIN_ALTO = 36;

// export default function AdminMesasPage() {
//   const [mesas, setMesas] = useState<IMesa[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [draggedMesaId, setDraggedMesaId] = useState<string | null>(null);
//   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

//   // Elemento seleccionado (muestra anillo y tiradores de redimensionado)
//   const [selectedMesaId, setSelectedMesaId] = useState<string | null>(null);
//   const [resizeState, setResizeState] = useState<{
//     id: string;
//     eje: 'ambos' | 'x' | 'y';
//     originX: number;
//     originY: number;
//     startW: number;
//     startH: number;
//   } | null>(null);

//   // Pantalla completa: oculta el panel lateral y expande el lienzo
//   const [pantallaCompleta, setPantallaCompleta] = useState(false);

//   // Zonas: overlay de división del lienzo y tamaño medido del canvas
//   const [verZonas, setVerZonas] = useState(true);
//   const canvasRef = useRef<HTMLDivElement>(null);
//   const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

//   // Formulario para crear nueva mesa o elemento
//   const [nuevaMesa, setNuevaMesa] = useState({
//     numero: '',
//     tipo: 'MESA' as 'MESA' | 'BARRA' | 'ESCENARIO' | 'VIP' | 'PISTA_BAILE' | 'BANO',
//     capacidad: 4,
//     zona: 'Z1' as ZonaId,
//   });

//   // 1. Cargar mesas activas al montar el componente
//   useEffect(() => {
//     fetchMesas();
//   }, []);

//   // Salir de pantalla completa con la tecla Escape
//   useEffect(() => {
//     if (!pantallaCompleta) return;
//     const manejarTecla = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') setPantallaCompleta(false);
//     };
//     window.addEventListener('keydown', manejarTecla);
//     return () => window.removeEventListener('keydown', manejarTecla);
//   }, [pantallaCompleta]);

//   // Medir el tamaño del lienzo para calcular la división por zonas
//   useEffect(() => {
//     const el = canvasRef.current;
//     if (!el) return;
//     const actualizar = () => setCanvasSize({ w: el.clientWidth, h: el.clientHeight });
//     actualizar();
//     const observer = new ResizeObserver(actualizar);
//     observer.observe(el);
//     return () => observer.disconnect();
//   }, [loading]);

//   // Soltar el arrastre/redimensionado aunque el mouse se suelte fuera del lienzo
//   useEffect(() => {
//     const soltar = () => {
//       setDraggedMesaId(null);
//       setResizeState(null);
//     };
//     window.addEventListener('mouseup', soltar);
//     return () => window.removeEventListener('mouseup', soltar);
//   }, []);

//   const fetchMesas = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(`${API_URL}/mesas`);
//       const data = await res.json();
//       if (Array.isArray(data)) {
//         setMesas(data);
//       }
//     } catch (error) {
//       console.error('Error cargando mesas:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 2. Manejo de Drag & Drop en el canvas
//   const handleMouseDown = (e: React.MouseEvent, mesa: IMesa) => {
//     e.stopPropagation(); // el clic sobre una mesa no deselecciona en el lienzo
//     setSelectedMesaId(mesa.id);
//     setDraggedMesaId(mesa.id);
//     setDragOffset({
//       x: e.clientX - mesa.posX,
//       y: e.clientY - mesa.posY,
//     });
//   };

//   const handleMouseMove = (e: React.MouseEvent) => {
//     // Redimensionado en vivo desde los tiradores
//     if (resizeState) {
//       const dx = e.clientX - resizeState.originX;
//       const dy = e.clientY - resizeState.originY;
//       setMesas((prev) =>
//         prev.map((m) => {
//           if (m.id !== resizeState.id) return m;
//           const maxW = canvasSize.w > 0 ? canvasSize.w - m.posX - 2 : 800;
//           const maxH = canvasSize.h > 0 ? canvasSize.h - m.posY - 2 : 800;
//           const width =
//             resizeState.eje === 'y'
//               ? m.width
//               : Math.min(maxW, Math.max(MIN_ANCHO, resizeState.startW + dx));
//           const height =
//             resizeState.eje === 'x'
//               ? m.height
//               : Math.min(maxH, Math.max(MIN_ALTO, resizeState.startH + dy));
//           return { ...m, width: Math.round(width), height: Math.round(height) };
//         })
//       );
//       return;
//     }

//     if (!draggedMesaId) return;

//     const newX = Math.max(0, e.clientX - dragOffset.x);
//     const newY = Math.max(0, e.clientY - dragOffset.y);

//     setMesas((prev) =>
//       prev.map((m) =>
//         m.id === draggedMesaId
//           ? { ...m, posX: Math.round(newX), posY: Math.round(newY) }
//           : m
//       )
//     );
//   };

//   const handleMouseUp = () => {
//     setDraggedMesaId(null);
//     setResizeState(null);
//   };

//   // Iniciar redimensionado desde un tirador (esquina = ambos ejes)
//   const handleResizeStart = (
//     e: React.MouseEvent,
//     mesa: IMesa,
//     eje: 'ambos' | 'x' | 'y'
//   ) => {
//     e.stopPropagation();
//     setSelectedMesaId(mesa.id);
//     setResizeState({
//       id: mesa.id,
//       eje,
//       originX: e.clientX,
//       originY: e.clientY,
//       startW: mesa.width,
//       startH: mesa.height,
//     });
//   };

//   // Doble clic: restaurar el tamaño compacto estándar del tipo de elemento
//   const resetTamaño = (mesa: IMesa) => {
//     const t = TAMAÑO_POR_TIPO[mesa.tipo] ?? TAMAÑO_POR_TIPO.MESA;
//     setMesas((prev) =>
//       prev.map((m) => (m.id === mesa.id ? { ...m, width: t.w, height: t.h } : m))
//     );
//   };

//   // Compactar todo: reduce a 70% los elementos grandes ya guardados en la BD
//   const compactarTodo = () => {
//     if (
//       !confirm(
//         '¿Reducir el tamaño de TODOS los elementos a 70%? Luego puedes ajustar cada uno con sus tiradores y guardar el plano.'
//       )
//     )
//       return;
//     setMesas((prev) =>
//       prev.map((m) => ({
//         ...m,
//         width: Math.max(MIN_ANCHO, Math.round(m.width * 0.7)),
//         height: Math.max(MIN_ALTO, Math.round(m.height * 0.7)),
//       }))
//     );
//   };

//   // 3. Guardar todo el layout modificado (PUT /mesas/layout)
//   const guardarLayout = async () => {
//     try {
//       setSaving(true);
//       const itemsToUpdate = mesas.map((m) => ({
//         id: m.id,
//         posX: m.posX,
//         posY: m.posY,
//         width: m.width,
//         height: m.height,
//       }));

//       const res = await fetch(`${API_URL}/mesas/layout`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(itemsToUpdate),
//       });

//       if (res.ok) {
//         alert('¡Layout del plano guardado con éxito!');
//       } else {
//         alert('Error al guardar el layout');
//       }
//     } catch (error) {
//       console.error('Error guardando layout:', error);
//       alert('Error de conexión al guardar');
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Zona de una posición del lienzo (según el plano: Z3·Z1 arriba, Z4·Z2 abajo)
//   const getZonaDe = (x: number, y: number): ZonaId => {
//     if (canvasSize.w === 0 || canvasSize.h === 0) return 'Z1';
//     const arriba = y < canvasSize.h / 2;
//     const derecha = x >= canvasSize.w / 2;
//     if (arriba && derecha) return 'Z1';
//     if (!arriba && derecha) return 'Z2';
//     if (arriba && !derecha) return 'Z3';
//     return 'Z4';
//   };

//   // Centro de cada zona para ubicar los elementos nuevos
//   const centroDeZona = (zona: ZonaId) => ({
//     x: zona === 'Z3' || zona === 'Z4' ? canvasSize.w * 0.25 : canvasSize.w * 0.75,
//     y: zona === 'Z3' || zona === 'Z1' ? canvasSize.h * 0.25 : canvasSize.h * 0.75,
//   });

//   // 4. Crear nueva mesa/elemento (POST /mesas)
//   const crearMesa = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!nuevaMesa.numero.trim()) {
//       alert('Ingresa un número o nombre para el elemento (Ej: Pista Principal, Mesa 5)');
//       return;
//     }

//     // Dimensiones iniciales compactas según el tipo de elemento
//     const { w: initialWidth, h: initialHeight } =
//       TAMAÑO_POR_TIPO[nuevaMesa.tipo] ?? TAMAÑO_POR_TIPO.MESA;

//     // Spawn en el centro de la zona elegida, escalonado para no apilar
//     const offset = (mesas.length % 8) * 16;
//     const centro = centroDeZona(nuevaMesa.zona);
//     const spawnX = Math.max(0, Math.round(centro.x - initialWidth / 2 + offset));
//     const spawnY = Math.max(0, Math.round(centro.y - initialHeight / 2 + offset));

//     try {
//       const res = await fetch(`${API_URL}/mesas`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           numero: nuevaMesa.numero,
//           tipo: nuevaMesa.tipo,
//           capacidad: Number(nuevaMesa.capacidad),
//           posX: spawnX,
//           posY: spawnY,
//           width: initialWidth,
//           height: initialHeight,
//         }),
//       });

//       if (res.ok) {
//         const creada = await res.json();
//         const mesaFormateada = {
//           ...creada,
//           id: creada.id || creada._id,
//         };

//         setMesas((prev) => [...prev, mesaFormateada]);
//         setNuevaMesa({ numero: '', tipo: 'MESA', capacidad: 4, zona: nuevaMesa.zona });
//       } else {
//         const err = await res.json().catch(() => ({}));
//         console.error('❌ Error del backend:', err);
//         alert(`Error al crear elemento: ${err.error || err.message || JSON.stringify(err) || 'Respuesta no válida'}`);
//       }
//     } catch (error) {
//       console.error('Error creando mesa/elemento:', error);
//       alert('Ocurrió un error de conexión al crear el elemento');
//     }
//   };

//   // 5. Eliminar elemento del plano (DELETE /mesas/:id)
//   const eliminarMesa = async (id: string) => {
//     if (!confirm('¿Estás seguro de eliminar este elemento del plano?')) return;

//     try {
//       const res = await fetch(`${API_URL}/mesas/${id}`, { method: 'DELETE' });
//       if (res.ok) {
//         setMesas((prev) => prev.filter((m) => m.id !== id));
//       }
//     } catch (error) {
//       console.error('Error eliminando mesa:', error);
//     }
//   };

//   // Helper para los estilos según el tipo de elemento
//   const getTipoEstilo = (tipo: string) => {
//     switch (tipo) {
//       case 'VIP':
//         return 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-amber-500/10';
//       case 'BARRA':
//         return 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-cyan-500/20';
//       case 'ESCENARIO':
//         return 'bg-purple-950/60 border-purple-500 text-purple-200 font-bold uppercase tracking-widest';
//       case 'PISTA_BAILE':
//         return 'bg-pink-950/40 border-pink-500/80 text-pink-300 font-bold uppercase tracking-wider border-dashed shadow-pink-500/20';
//       case 'BANO':
//         return 'bg-slate-800/60 border-slate-400 text-slate-200 shadow-slate-400/20';
//       default:
//         return 'bg-zinc-800 border-zinc-600 text-zinc-100';
//     }
//   };

//   return (
//     <div
//       className={
//         pantallaCompleta
//           ? 'fixed inset-0 z-50 bg-zinc-950 text-white p-4 flex flex-col gap-4 overflow-hidden'
//           : 'p-6 max-w-7xl mx-auto space-y-6 text-white min-h-screen'
//       }
//     >
//       {/* HEADER */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800 shrink-0">
//         <div>
//           <h1 className="text-2xl font-bold flex items-center gap-2">
//             <Layout className="text-amber-500" /> Editor del Plano de Mesas
//           </h1>
//           <p className={`text-zinc-400 text-sm ${pantallaCompleta ? 'hidden' : ''}`}>
//             Clic selecciona · arrastra mueve · tiradores ámbar redimensionan · doble clic restaura
//             el tamaño compacto. Guarda los cambios al terminar.
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           {/* Botón para mostrar/ocultar la división por zonas */}
//           <button
//             onClick={() => setVerZonas((v) => !v)}
//             title={verZonas ? 'Ocultar división por zonas' : 'Mostrar división por zonas'}
//             className={`flex items-center gap-2 border font-medium px-4 py-2.5 rounded-lg transition cursor-pointer ${
//               verZonas
//                 ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-300'
//                 : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
//             }`}
//           >
//             <Layers size={18} />
//             <span className="hidden sm:inline">{verZonas ? 'Ocultar zonas' : 'Ver zonas'}</span>
//           </button>

//           {/* Botón de pantalla completa: oculta el sidebar y expande el lienzo */}
//           <button
//             onClick={() => setPantallaCompleta((v) => !v)}
//             title={pantallaCompleta ? 'Salir de pantalla completa (Esc)' : 'Pantalla completa'}
//             className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium px-4 py-2.5 rounded-lg transition cursor-pointer"
//           >
//             {pantallaCompleta ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
//             <span className="hidden sm:inline">
//               {pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
//             </span>
//           </button>

//           {/* Compactar todo: arregla de un golpe los elementos grandes ya guardados */}
//           <button
//             onClick={compactarTodo}
//             title="Reduce todos los elementos a 70% de su tamaño actual"
//             className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium px-4 py-2.5 rounded-lg transition cursor-pointer"
//           >
//             <Shrink size={18} />
//             <span className="hidden sm:inline">Compactar todo</span>
//           </button>

//           <button
//             onClick={guardarLayout}
//             disabled={saving}
//             className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
//           >
//             <Save size={18} />
//             {saving ? 'Guardando...' : 'Guardar Plano'}
//           </button>
//         </div>
//       </div>

//       <div className={pantallaCompleta ? 'flex-1 min-h-0 flex flex-col' : 'grid grid-cols-1 lg:grid-cols-4 gap-6'}>
//         {/* PANEL LATERAL: FORMULARIO (se oculta en pantalla completa) */}
//         {!pantallaCompleta && (
//           <div className="lg:col-span-1 bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-4">
//             <h2 className="text-lg font-semibold flex items-center gap-2">
//               <Plus size={18} className="text-amber-500" /> Agregar Elemento
//             </h2>

//             <form onSubmit={crearMesa} className="space-y-3">
//               <div>
//                 <label className="text-xs text-zinc-400">Identificador / Número</label>
//                 <input
//                   type="text"
//                   placeholder="Ej: Mesa 1, Pista Principal, VIP 2"
//                   value={nuevaMesa.numero}
//                   onChange={(e) => setNuevaMesa({ ...nuevaMesa, numero: e.target.value })}
//                   className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
//                 />
//               </div>

//               <div>
//                 <label className="text-xs text-zinc-400">Tipo de Elemento</label>
//                 <select
//                   value={nuevaMesa.tipo}
//                   onChange={(e) =>
//                     setNuevaMesa({
//                       ...nuevaMesa,
//                       tipo: e.target.value as any,
//                     })
//                   }
//                   className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
//                 >
//                   <option value="MESA">Mesa Standard</option>
//                   <option value="VIP">Mesa VIP</option>
//                   <option value="BARRA">Barra</option>
//                   <option value="ESCENARIO">Escenario / DJ</option>
//                   <option value="PISTA_BAILE">Pista de Baile 💃</option>
//                   <option value="BANO">Baño 🚻</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="text-xs text-zinc-400">Zona del lienzo</label>
//                 <select
//                   value={nuevaMesa.zona}
//                   onChange={(e) =>
//                     setNuevaMesa({ ...nuevaMesa, zona: e.target.value as ZonaId })
//                   }
//                   className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
//                 >
//                   <option value="Z1">Z1 · Arriba derecha (Mesas 1-12)</option>
//                   <option value="Z2">Z2 · Abajo derecha (Mesas 30-34)</option>
//                   <option value="Z3">Z3 · Arriba izquierda (Mesas 13-24)</option>
//                   <option value="Z4">Z4 · Abajo izquierda (Mesas 25-29)</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="text-xs text-zinc-400">Capacidad / Aforo Estimado</label>
//                 <input
//                   type="number"
//                   value={nuevaMesa.capacidad}
//                   onChange={(e) =>
//                     setNuevaMesa({
//                       ...nuevaMesa,
//                       capacidad: Number(e.target.value),
//                     })
//                   }
//                   className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-medium py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer"
//               >
//                 <Plus size={16} /> Crear Elemento
//               </button>
//             </form>
//           </div>
//         )}

//         {/* LIENZO / CANVAS INTERACTIVO */}
//         <div
//           className={`bg-zinc-950 p-4 rounded-xl border border-zinc-800 overflow-hidden ${
//             pantallaCompleta ? 'flex-1 min-h-0 flex flex-col' : 'lg:col-span-3'
//           }`}
//         >
//           {/* LEYENDA DE ZONAS con conteo de elementos */}
//           {!loading && verZonas && (
//             <div className="flex flex-wrap items-center gap-2 mb-3 shrink-0">
//               {ZONAS.map((z) => (
//                 <span
//                   key={z}
//                   className={`text-[11px] font-semibold px-2 py-1 rounded border bg-zinc-900/60 ${
//                     COLORES_ZONA[z]
//                   }`}
//                 >
//                   {z}: {mesas.filter((m) => getZonaDe(m.posX, m.posY) === z).length} elem.
//                 </span>
//               ))}
//             </div>
//           )}

//           {loading ? (
//             <div
//               className={`flex items-center justify-center text-zinc-500 ${
//                 pantallaCompleta ? 'h-full' : 'h-[550px]'
//               }`}
//             >
//               Cargando plano...
//             </div>
//           ) : (
//             <div
//               ref={canvasRef}
//               className={`relative w-full bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800 overflow-auto select-none ${
//                 pantallaCompleta ? 'flex-1 min-h-0' : 'h-[550px]'
//               }`}
//               style={{
//                 backgroundImage:
//                   'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
//                 backgroundSize: '20px 20px',
//               }}
//               onMouseDown={() => setSelectedMesaId(null)}
//               onMouseMove={handleMouseMove}
//               onMouseUp={handleMouseUp}
//             >
//               {/* DIVISIÓN POR ZONAS según el plano (decorativa, no intercepta el mouse) */}
//               {verZonas && canvasSize.w > 0 && (
//                 <>
//                   {ZONAS.map((z) => (
//                     <div
//                       key={z}
//                       className="absolute pointer-events-none border border-dashed z-0"
//                       style={{
//                         left: POSICION_ZONA[z].left,
//                         top: POSICION_ZONA[z].top,
//                         width: '50%',
//                         height: '50%',
//                       }}
//                     >
//                       <span
//                         className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded border bg-zinc-950/80 ${
//                           COLORES_ZONA[z]
//                         }`}
//                       >
//                         {z}
//                       </span>
//                     </div>
//                   ))}
//                 </>
//               )}

//               {mesas.map((mesa) => (
//                 <div
//                   key={mesa.id}
//                   onMouseDown={(e) => handleMouseDown(e, mesa)}
//                   onDoubleClick={() => resetTamaño(mesa)}
//                   style={{
//                     position: 'absolute',
//                     left: `${mesa.posX}px`,
//                     top: `${mesa.posY}px`,
//                     width: `${mesa.width}px`,
//                     height: `${mesa.height}px`,
//                   }}
//                   className={`cursor-grab active:cursor-grabbing border-2 rounded-lg p-1.5 flex flex-col justify-between shadow-lg transition-shadow hover:shadow-amber-500/10 ${
//                     selectedMesaId === mesa.id ? 'ring-2 ring-amber-400 z-10' : ''
//                   } ${getTipoEstilo(mesa.tipo)}`}
//                 >
//                   {/* Tamaño en vivo mientras se redimensiona */}
//                   {resizeState?.id === mesa.id && (
//                     <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
//                       {mesa.width}×{mesa.height} px
//                     </span>
//                   )}

//                   {/* Tiradores de redimensionado (solo en el elemento seleccionado) */}
//                   {selectedMesaId === mesa.id && (
//                     <>
//                       <div
//                         onMouseDown={(e) => handleResizeStart(e, mesa, 'ambos')}
//                         className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-amber-400 border border-amber-600 rounded-tl-md cursor-nwse-resize z-20"
//                         title="Arrastra para redimensionar ancho y alto"
//                       />
//                       <div
//                         onMouseDown={(e) => handleResizeStart(e, mesa, 'x')}
//                         className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-6 bg-amber-400/90 rounded cursor-ew-resize z-20"
//                         title="Redimensionar ancho"
//                       />
//                       <div
//                         onMouseDown={(e) => handleResizeStart(e, mesa, 'y')}
//                         className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-6 h-2 bg-amber-400/90 rounded cursor-ns-resize z-20"
//                         title="Redimensionar alto"
//                       />
//                     </>
//                   )}
//                   <div className="flex justify-between items-center gap-1">
//                     <span
//                       className="font-bold text-sm truncate flex items-center gap-1"
//                       title={mesa.numero}
//                     >
//                       {mesa.tipo === 'PISTA_BAILE' && <Disc size={12} className="animate-spin" />}
//                       {mesa.tipo === 'BANO' && '🚻 '}
//                       {mesa.numero}
//                     </span>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         eliminarMesa(mesa.id);
//                       }}
//                       className="text-zinc-400 hover:text-red-400 transition shrink-0 cursor-pointer"
//                       title="Eliminar elemento"
//                     >
//                       <Trash2 size={12} />
//                     </button>
//                   </div>

//                   <div className="flex justify-between items-end text-[10px] opacity-80">
//                     <span className="flex items-center gap-1">
//                       <Users size={10} /> {mesa.capacidad}
//                     </span>
//                     <Move size={10} className="opacity-50" />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Save,
  Trash2,
  Move,
  Layout,
  Users,
  Disc,
  Maximize2,
  Minimize2,
  Layers,
  Shrink,
  Expand,
} from 'lucide-react';

interface IMesa {
  id: string;
  numero: string;
  tipo: 'MESA' | 'BARRA' | 'ESCENARIO' | 'VIP' | 'PISTA_BAILE' | 'BANO';
  capacidad: number;
  posX: number;
  posY: number;
  width: number;
  height: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Zonas del lienzo según el plano del local:
// Z3 (arriba-izq) · Z1 (arriba-der) · Z4 (abajo-izq) · Z2 (abajo-der)
type ZonaId = 'Z1' | 'Z2' | 'Z3' | 'Z4';

const ZONAS: ZonaId[] = ['Z1', 'Z2', 'Z3', 'Z4'];

const POSICION_ZONA: Record<ZonaId, { left: string; top: string }> = {
  Z1: { left: '50%', top: '0%' },
  Z2: { left: '50%', top: '50%' },
  Z3: { left: '0%', top: '0%' },
  Z4: { left: '0%', top: '50%' },
};

const COLORES_ZONA: Record<ZonaId, string> = {
  Z1: 'text-emerald-300 border-emerald-500/60',
  Z2: 'text-sky-300 border-sky-500/60',
  Z3: 'text-orange-300 border-orange-500/60',
  Z4: 'text-fuchsia-300 border-fuchsia-500/60',
};

// Tamaños iniciales compactos por tipo de elemento (px)
const TAMAÑO_POR_TIPO: Record<string, { w: number; h: number }> = {
  MESA: { w: 64, h: 64 },
  VIP: { w: 92, h: 92 },
  BARRA: { w: 200, h: 44 },
  ESCENARIO: { w: 150, h: 72 },
  PISTA_BAILE: { w: 176, h: 120 },
  BANO: { w: 72, h: 72 },
};

// Límites al redimensionar (nunca más pequeños que esto)
const MIN_ANCHO = 40;
const MIN_ALTO = 36;

export default function AdminMesasPage() {
  const [mesas, setMesas] = useState<IMesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedMesaId, setDraggedMesaId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Elemento seleccionado (muestra anillo y tiradores de redimensionado)
  const [selectedMesaId, setSelectedMesaId] = useState<string | null>(null);
  const [resizeState, setResizeState] = useState<{
    id: string;
    eje: 'ambos' | 'x' | 'y';
    originX: number;
    originY: number;
    startW: number;
    startH: number;
  } | null>(null);

  // Interruptor de compactado: guarda los tamaños originales para poder restaurarlos
  const [compactado, setCompactado] = useState(false);
  const [tamanosOriginales, setTamanosOriginales] = useState<
    Record<string, { w: number; h: number }>
  >({});

  // Pantalla completa: oculta el panel lateral y expande el lienzo
  const [pantallaCompleta, setPantallaCompleta] = useState(false);

  // Zonas: overlay de división del lienzo y tamaño medido del canvas
  const [verZonas, setVerZonas] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  // Formulario para crear nueva mesa o elemento
  const [nuevaMesa, setNuevaMesa] = useState({
    numero: '',
    tipo: 'MESA' as 'MESA' | 'BARRA' | 'ESCENARIO' | 'VIP' | 'PISTA_BAILE' | 'BANO',
    capacidad: 4,
    zona: 'Z1' as ZonaId,
  });

  // 1. Cargar mesas activas al montar el componente
  useEffect(() => {
    fetchMesas();
  }, []);

  // Salir de pantalla completa con la tecla Escape
  useEffect(() => {
    if (!pantallaCompleta) return;
    const manejarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPantallaCompleta(false);
    };
    window.addEventListener('keydown', manejarTecla);
    return () => window.removeEventListener('keydown', manejarTecla);
  }, [pantallaCompleta]);

  // Medir el tamaño del lienzo para calcular la división por zonas
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const actualizar = () => setCanvasSize({ w: el.clientWidth, h: el.clientHeight });
    actualizar();
    const observer = new ResizeObserver(actualizar);
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

  // Soltar el arrastre/redimensionado aunque el mouse se suelte fuera del lienzo
  useEffect(() => {
    const soltar = () => {
      setDraggedMesaId(null);
      setResizeState(null);
    };
    window.addEventListener('mouseup', soltar);
    return () => window.removeEventListener('mouseup', soltar);
  }, []);

  const fetchMesas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/mesas`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMesas(data);
      }
    } catch (error) {
      console.error('Error cargando mesas:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Manejo de Drag & Drop en el canvas
  const handleMouseDown = (e: React.MouseEvent, mesa: IMesa) => {
    e.stopPropagation(); // el clic sobre una mesa no deselecciona en el lienzo
    setSelectedMesaId(mesa.id);
    setDraggedMesaId(mesa.id);
    setDragOffset({
      x: e.clientX - mesa.posX,
      y: e.clientY - mesa.posY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Redimensionado en vivo desde los tiradores
    if (resizeState) {
      const dx = e.clientX - resizeState.originX;
      const dy = e.clientY - resizeState.originY;
      setMesas((prev) =>
        prev.map((m) => {
          if (m.id !== resizeState.id) return m;
          const maxW = canvasSize.w > 0 ? canvasSize.w - m.posX - 2 : 800;
          const maxH = canvasSize.h > 0 ? canvasSize.h - m.posY - 2 : 800;
          const width =
            resizeState.eje === 'y'
              ? m.width
              : Math.min(maxW, Math.max(MIN_ANCHO, resizeState.startW + dx));
          const height =
            resizeState.eje === 'x'
              ? m.height
              : Math.min(maxH, Math.max(MIN_ALTO, resizeState.startH + dy));
          return { ...m, width: Math.round(width), height: Math.round(height) };
        })
      );
      return;
    }

    if (!draggedMesaId) return;

    const newX = Math.max(0, e.clientX - dragOffset.x);
    const newY = Math.max(0, e.clientY - dragOffset.y);

    setMesas((prev) =>
      prev.map((m) =>
        m.id === draggedMesaId
          ? { ...m, posX: Math.round(newX), posY: Math.round(newY) }
          : m
      )
    );
  };

  const handleMouseUp = () => {
    setDraggedMesaId(null);
    setResizeState(null);
  };

  // Iniciar redimensionado desde un tirador (esquina = ambos ejes)
  const handleResizeStart = (
    e: React.MouseEvent,
    mesa: IMesa,
    eje: 'ambos' | 'x' | 'y'
  ) => {
    e.stopPropagation();
    setSelectedMesaId(mesa.id);
    setResizeState({
      id: mesa.id,
      eje,
      originX: e.clientX,
      originY: e.clientY,
      startW: mesa.width,
      startH: mesa.height,
    });
  };

  // Doble clic: restaurar el tamaño compacto estándar del tipo de elemento
  const resetTamaño = (mesa: IMesa) => {
    const t = TAMAÑO_POR_TIPO[mesa.tipo] ?? TAMAÑO_POR_TIPO.MESA;
    setMesas((prev) =>
      prev.map((m) => (m.id === mesa.id ? { ...m, width: t.w, height: t.h } : m))
    );
  };

  // Compactar todo (una sola vez): guarda los tamaños actuales y reduce a 70%.
  // Mientras está compactado, el botón cambia a "Tamaño normal" y no se puede
  // volver a reducir, así la escala nunca se acumula.
  const compactarTodo = () => {
    if (compactado) return;
    if (
      !confirm(
        '¿Reducir el tamaño de TODOS los elementos a 70%? Podrás volver al tamaño original con el mismo botón.'
      )
    )
      return;

    const originales: Record<string, { w: number; h: number }> = {};
    mesas.forEach((m) => {
      originales[m.id] = { w: m.width, h: m.height };
    });

    setMesas((prev) =>
      prev.map((m) => ({
        ...m,
        width: Math.max(MIN_ANCHO, Math.round(m.width * 0.7)),
        height: Math.max(MIN_ALTO, Math.round(m.height * 0.7)),
      }))
    );
    setTamanosOriginales(originales);
    setCompactado(true);
  };

  // Expandir todo: restaura exactamente los tamaños que había antes de compactar
  const expandirTodo = () => {
    setMesas((prev) =>
      prev.map((m) => {
        const orig = tamanosOriginales[m.id];
        return orig ? { ...m, width: orig.w, height: orig.h } : m;
      })
    );
    setCompactado(false);
    setTamanosOriginales({});
  };

  // 3. Guardar todo el layout modificado (PUT /mesas/layout)
  const guardarLayout = async () => {
    try {
      setSaving(true);
      const itemsToUpdate = mesas.map((m) => ({
        id: m.id,
        posX: m.posX,
        posY: m.posY,
        width: m.width,
        height: m.height,
      }));

      const res = await fetch(`${API_URL}/mesas/layout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemsToUpdate),
      });

      if (res.ok) {
        alert('¡Layout del plano guardado con éxito!');
      } else {
        alert('Error al guardar el layout');
      }
    } catch (error) {
      console.error('Error guardando layout:', error);
      alert('Error de conexión al guardar');
    } finally {
      setSaving(false);
    }
  };

  // Zona de una posición del lienzo (según el plano: Z3·Z1 arriba, Z4·Z2 abajo)
  const getZonaDe = (x: number, y: number): ZonaId => {
    if (canvasSize.w === 0 || canvasSize.h === 0) return 'Z1';
    const arriba = y < canvasSize.h / 2;
    const derecha = x >= canvasSize.w / 2;
    if (arriba && derecha) return 'Z1';
    if (!arriba && derecha) return 'Z2';
    if (arriba && !derecha) return 'Z3';
    return 'Z4';
  };

  // Centro de cada zona para ubicar los elementos nuevos
  const centroDeZona = (zona: ZonaId) => ({
    x: zona === 'Z3' || zona === 'Z4' ? canvasSize.w * 0.25 : canvasSize.w * 0.75,
    y: zona === 'Z3' || zona === 'Z1' ? canvasSize.h * 0.25 : canvasSize.h * 0.75,
  });

  // 4. Crear nueva mesa/elemento (POST /mesas)
  const crearMesa = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nuevaMesa.numero.trim()) {
      alert('Ingresa un número o nombre para el elemento (Ej: Pista Principal, Mesa 5)');
      return;
    }

    // Dimensiones iniciales compactas según el tipo de elemento
    const { w: initialWidth, h: initialHeight } =
      TAMAÑO_POR_TIPO[nuevaMesa.tipo] ?? TAMAÑO_POR_TIPO.MESA;

    // Spawn en el centro de la zona elegida, escalonado para no apilar
    const offset = (mesas.length % 8) * 16;
    const centro = centroDeZona(nuevaMesa.zona);
    const spawnX = Math.max(0, Math.round(centro.x - initialWidth / 2 + offset));
    const spawnY = Math.max(0, Math.round(centro.y - initialHeight / 2 + offset));

    try {
      const res = await fetch(`${API_URL}/mesas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero: nuevaMesa.numero,
          tipo: nuevaMesa.tipo,
          capacidad: Number(nuevaMesa.capacidad),
          posX: spawnX,
          posY: spawnY,
          width: initialWidth,
          height: initialHeight,
        }),
      });

      if (res.ok) {
        const creada = await res.json();
        const mesaFormateada = {
          ...creada,
          id: creada.id || creada._id,
        };

        setMesas((prev) => [...prev, mesaFormateada]);
        // Si el plano está compactado, recordar el tamaño de esta mesa para "Tamaño normal"
        if (compactado) {
          setTamanosOriginales((prev) => ({
            ...prev,
            [mesaFormateada.id]: { w: mesaFormateada.width, h: mesaFormateada.height },
          }));
        }
        setNuevaMesa({ numero: '', tipo: 'MESA', capacidad: 4, zona: nuevaMesa.zona });
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('❌ Error del backend:', err);
        alert(`Error al crear elemento: ${err.error || err.message || JSON.stringify(err) || 'Respuesta no válida'}`);
      }
    } catch (error) {
      console.error('Error creando mesa/elemento:', error);
      alert('Ocurrió un error de conexión al crear el elemento');
    }
  };

  // 5. Eliminar elemento del plano (DELETE /mesas/:id)
  const eliminarMesa = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este elemento del plano?')) return;

    try {
      const res = await fetch(`${API_URL}/mesas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMesas((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (error) {
      console.error('Error eliminando mesa:', error);
    }
  };

  // Helper para los estilos según el tipo de elemento
  const getTipoEstilo = (tipo: string) => {
    switch (tipo) {
      case 'VIP':
        return 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-amber-500/10';
      case 'BARRA':
        return 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-cyan-500/20';
      case 'ESCENARIO':
        return 'bg-purple-950/60 border-purple-500 text-purple-200 font-bold uppercase tracking-widest';
      case 'PISTA_BAILE':
        return 'bg-pink-950/40 border-pink-500/80 text-pink-300 font-bold uppercase tracking-wider border-dashed shadow-pink-500/20';
      case 'BANO':
        return 'bg-slate-800/60 border-slate-400 text-slate-200 shadow-slate-400/20';
      default:
        return 'bg-zinc-800 border-zinc-600 text-zinc-100';
    }
  };

  return (
    <div
      className={
        pantallaCompleta
          ? 'fixed inset-0 z-50 bg-zinc-950 text-white p-4 flex flex-col gap-4 overflow-hidden'
          : 'p-6 max-w-7xl mx-auto space-y-6 text-white min-h-screen'
      }
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layout className="text-amber-500" /> Editor del Plano de Mesas
          </h1>
          <p className={`text-zinc-400 text-sm ${pantallaCompleta ? 'hidden' : ''}`}>
            Clic selecciona · arrastra mueve · tiradores ámbar redimensionan · doble clic restaura
            el tamaño compacto. Guarda los cambios al terminar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botón para mostrar/ocultar la división por zonas */}
          <button
            onClick={() => setVerZonas((v) => !v)}
            title={verZonas ? 'Ocultar división por zonas' : 'Mostrar división por zonas'}
            className={`flex items-center gap-2 border font-medium px-4 py-2.5 rounded-lg transition cursor-pointer ${
              verZonas
                ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-300'
                : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            <Layers size={18} />
            <span className="hidden sm:inline">{verZonas ? 'Ocultar zonas' : 'Ver zonas'}</span>
          </button>

          {/* Botón de pantalla completa: oculta el sidebar y expande el lienzo */}
          <button
            onClick={() => setPantallaCompleta((v) => !v)}
            title={pantallaCompleta ? 'Salir de pantalla completa (Esc)' : 'Pantalla completa'}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium px-4 py-2.5 rounded-lg transition cursor-pointer"
          >
            {pantallaCompleta ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            <span className="hidden sm:inline">
              {pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
            </span>
          </button>

          {/* Compactar ↔ Tamaño normal: interruptor, la reducción nunca se acumula */}
          {compactado ? (
            <button
              onClick={expandirTodo}
              title="Restaura el tamaño original que tenían todos los elementos antes de compactar"
              className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/60 text-emerald-300 font-medium px-4 py-2.5 rounded-lg transition cursor-pointer"
            >
              <Expand size={18} />
              <span className="hidden sm:inline">Tamaño normal</span>
            </button>
          ) : (
            <button
              onClick={compactarTodo}
              title="Reduce todos los elementos a 70% de su tamaño actual (una sola vez)"
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium px-4 py-2.5 rounded-lg transition cursor-pointer"
            >
              <Shrink size={18} />
              <span className="hidden sm:inline">Compactar todo</span>
            </button>
          )}

          <button
            onClick={guardarLayout}
            disabled={saving}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
          >
            <Save size={18} />
            {saving ? 'Guardando...' : 'Guardar Plano'}
          </button>
        </div>
      </div>

      <div className={pantallaCompleta ? 'flex-1 min-h-0 flex flex-col' : 'grid grid-cols-1 lg:grid-cols-4 gap-6'}>
        {/* PANEL LATERAL: FORMULARIO (se oculta en pantalla completa) */}
        {!pantallaCompleta && (
          <div className="lg:col-span-1 bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Plus size={18} className="text-amber-500" /> Agregar Elemento
            </h2>

            <form onSubmit={crearMesa} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400">Identificador / Número</label>
                <input
                  type="text"
                  placeholder="Ej: Mesa 1, Pista Principal, VIP 2"
                  value={nuevaMesa.numero}
                  onChange={(e) => setNuevaMesa({ ...nuevaMesa, numero: e.target.value })}
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400">Tipo de Elemento</label>
                <select
                  value={nuevaMesa.tipo}
                  onChange={(e) =>
                    setNuevaMesa({
                      ...nuevaMesa,
                      tipo: e.target.value as any,
                    })
                  }
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
                >
                  <option value="MESA">Mesa Standard</option>
                  <option value="VIP">Mesa VIP</option>
                  <option value="BARRA">Barra</option>
                  <option value="ESCENARIO">Escenario / DJ</option>
                  <option value="PISTA_BAILE">Pista de Baile 💃</option>
                  <option value="BANO">Baño 🚻</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400">Zona del lienzo</label>
                <select
                  value={nuevaMesa.zona}
                  onChange={(e) =>
                    setNuevaMesa({ ...nuevaMesa, zona: e.target.value as ZonaId })
                  }
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
                >
                  <option value="Z1">Z1 · Arriba derecha (Mesas 1-12)</option>
                  <option value="Z2">Z2 · Abajo derecha (Mesas 30-34)</option>
                  <option value="Z3">Z3 · Arriba izquierda (Mesas 13-24)</option>
                  <option value="Z4">Z4 · Abajo izquierda (Mesas 25-29)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400">Capacidad / Aforo Estimado</label>
                <input
                  type="number"
                  value={nuevaMesa.capacidad}
                  onChange={(e) =>
                    setNuevaMesa({
                      ...nuevaMesa,
                      capacidad: Number(e.target.value),
                    })
                  }
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-medium py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} /> Crear Elemento
              </button>
            </form>
          </div>
        )}

        {/* LIENZO / CANVAS INTERACTIVO */}
        <div
          className={`bg-zinc-950 p-4 rounded-xl border border-zinc-800 overflow-hidden ${
            pantallaCompleta ? 'flex-1 min-h-0 flex flex-col' : 'lg:col-span-3'
          }`}
        >
          {/* LEYENDA DE ZONAS con conteo de elementos */}
          {!loading && verZonas && (
            <div className="flex flex-wrap items-center gap-2 mb-3 shrink-0">
              {ZONAS.map((z) => (
                <span
                  key={z}
                  className={`text-[11px] font-semibold px-2 py-1 rounded border bg-zinc-900/60 ${
                    COLORES_ZONA[z]
                  }`}
                >
                  {z}: {mesas.filter((m) => getZonaDe(m.posX, m.posY) === z).length} elem.
                </span>
              ))}
            </div>
          )}

          {loading ? (
            <div
              className={`flex items-center justify-center text-zinc-500 ${
                pantallaCompleta ? 'h-full' : 'h-[550px]'
              }`}
            >
              Cargando plano...
            </div>
          ) : (
            <div
              ref={canvasRef}
              className={`relative w-full bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800 overflow-auto select-none ${
                pantallaCompleta ? 'flex-1 min-h-0' : 'h-[550px]'
              }`}
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
              onMouseDown={() => setSelectedMesaId(null)}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {/* DIVISIÓN POR ZONAS según el plano (decorativa, no intercepta el mouse) */}
              {verZonas && canvasSize.w > 0 && (
                <>
                  {ZONAS.map((z) => (
                    <div
                      key={z}
                      className="absolute pointer-events-none border border-dashed z-0"
                      style={{
                        left: POSICION_ZONA[z].left,
                        top: POSICION_ZONA[z].top,
                        width: '50%',
                        height: '50%',
                      }}
                    >
                      <span
                        className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded border bg-zinc-950/80 ${
                          COLORES_ZONA[z]
                        }`}
                      >
                        {z}
                      </span>
                    </div>
                  ))}
                </>
              )}

              {mesas.map((mesa) => (
                <div
                  key={mesa.id}
                  onMouseDown={(e) => handleMouseDown(e, mesa)}
                  onDoubleClick={() => resetTamaño(mesa)}
                  style={{
                    position: 'absolute',
                    left: `${mesa.posX}px`,
                    top: `${mesa.posY}px`,
                    width: `${mesa.width}px`,
                    height: `${mesa.height}px`,
                  }}
                  className={`cursor-grab active:cursor-grabbing border-2 rounded-lg p-1.5 flex flex-col justify-between shadow-lg transition-shadow hover:shadow-amber-500/10 ${
                    selectedMesaId === mesa.id ? 'ring-2 ring-amber-400 z-10' : ''
                  } ${getTipoEstilo(mesa.tipo)}`}
                >
                  {/* Tamaño en vivo mientras se redimensiona */}
                  {resizeState?.id === mesa.id && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                      {mesa.width}×{mesa.height} px
                    </span>
                  )}

                  {/* Tiradores de redimensionado (solo en el elemento seleccionado) */}
                  {selectedMesaId === mesa.id && (
                    <>
                      <div
                        onMouseDown={(e) => handleResizeStart(e, mesa, 'ambos')}
                        className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-amber-400 border border-amber-600 rounded-tl-md cursor-nwse-resize z-20"
                        title="Arrastra para redimensionar ancho y alto"
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, mesa, 'x')}
                        className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-6 bg-amber-400/90 rounded cursor-ew-resize z-20"
                        title="Redimensionar ancho"
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, mesa, 'y')}
                        className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-6 h-2 bg-amber-400/90 rounded cursor-ns-resize z-20"
                        title="Redimensionar alto"
                      />
                    </>
                  )}
                  <div className="flex justify-between items-center gap-1">
                    <span
                      className="font-bold text-sm truncate flex items-center gap-1"
                      title={mesa.numero}
                    >
                      {mesa.tipo === 'PISTA_BAILE' && <Disc size={12} className="animate-spin" />}
                      {mesa.tipo === 'BANO' && '🚻 '}
                      {mesa.numero}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarMesa(mesa.id);
                      }}
                      className="text-zinc-400 hover:text-red-400 transition shrink-0 cursor-pointer"
                      title="Eliminar elemento"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="flex justify-between items-end text-[10px] opacity-80">
                    <span className="flex items-center gap-1">
                      <Users size={10} /> {mesa.capacidad}
                    </span>
                    <Move size={10} className="opacity-50" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}