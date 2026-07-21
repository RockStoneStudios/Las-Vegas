// @/lib/types/ruleta.ts
import { 
  Gift,          // Para el 20% de descuento
  Wine,          // Para Un litro gratis (o Wine / Botella)
  Beer,          // Para Ronda de cerveza
  Skull,         // Para No ganaste
  type LucideIcon 
} from 'lucide-react';

export interface SegmentoRuleta {
  id: string;
  texto: string;
  icono: LucideIcon; // 👈 Reemplazamos emoji: string por icono: LucideIcon
  esGanador: boolean;
  color: string;
}

export const SEGMENTOS_BASE: Omit<SegmentoRuleta, 'id'>[] = [
  { texto: '20% de descuento', icono: Gift, esGanador: true, color: '#00f3ff' },
  { texto: 'Un litro gratis', icono: Wine, esGanador: true, color: '#ff007f' },
  { texto: 'Ronda de cerveza', icono: Beer, esGanador: true, color: '#ffee00' },
  { texto: 'No ganaste', icono: Skull, esGanador: false, color: '#2a1b4e' },
  { texto: 'No ganaste', icono: Skull, esGanador: false, color: '#130d24' },
];