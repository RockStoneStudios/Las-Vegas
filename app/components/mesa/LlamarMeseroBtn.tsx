'use client';

interface Props {
  onClick: () => void;
  disabled: boolean;
  enCamino: boolean;
}

export default function LlamarMeseroBtn({ onClick, disabled, enCamino }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3.5 px-5 rounded-2xl font-orbitron font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-3 ${
        enCamino
          ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
          : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95'
      }`}
    >
      {enCamino ? (
        <>
          <span className="animate-bounce">🏃‍♂️</span>
          <span>Mesero en camino</span>
        </>
      ) : (
        <>
          <span>🍸</span>
          <span>Llamar Mesero</span>
        </>
      )}
    </button>
  );
}