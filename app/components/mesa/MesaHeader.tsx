'use client';
import { useSocketStore } from '@/lib/store/useSocketStore';

export default function MesaHeader({ numeroMesa, sessionId }: { numeroMesa: number; sessionId: string | null }) {
  const { conectado } = useSocketStore();
  return (
    <div className="relative z-10 w-full max-w-md flex items-center justify-between border-b border-[#1f1645] pb-3">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Las Vegas Discobar</p>
        <h1 className="text-lg font-orbitron font-black text-[#2ee6d6]">MESA #{numeroMesa}</h1>
      </div>
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${conectado ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 animate-pulse'}`} />
        <span className="text-[10px] font-mono text-gray-300">{conectado ? 'ONLINE' : 'OFFLINE'}</span>
      </div>
    </div>
  );
}