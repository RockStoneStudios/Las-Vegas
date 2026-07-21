export interface Premio {
  id: string;
  texto: string;
  esGanador: boolean;
  emoji: string;
}

export interface CartaRuleta {
  index: number;
  premio: Premio | null; // null hasta que se revela (simula que "no lo sabes" antes de tocar)
  revelada: boolean;
}

export const PREMIOS_BASE: Omit<Premio, 'id'>[] = [
  { texto: '20% de descuento', esGanador: true, emoji: '🎁' },
  { texto: 'Un litro gratis', esGanador: true, emoji: '🍾' },
  { texto: 'Una ronda de cerveza', esGanador: true, emoji: '🍺' },
  { texto: 'No ganaste', esGanador: false, emoji: '💀' },
  { texto: 'No ganaste', esGanador: false, emoji: '💀' },
  { texto: 'Una ronda de cerveza', esGanador: true, emoji: '🍺' },
];