// app/components/Loader.tsx
export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative w-16 h-16">
        {/* Aro exterior girando */}
        <div className="absolute inset-0 rounded-full border-2 border-[#ff00a0]/30"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#ff00a0] animate-spin"></div>
        
        {/* Aro medio girando al revés */}
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#00e0ff] animate-spin-reverse"></div>
        
        {/* Punto central pulsante */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#ff00a0] shadow-[0_0_12px_#ff00a0] animate-pulse"></div>
        </div>
      </div>
      <p className="text-xs font-mono tracking-[0.3em] text-zinc-500 uppercase">
        Cargando
      </p>
    </div>
  );
}