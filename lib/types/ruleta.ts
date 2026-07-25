import { 
  Percent,       // Para 20% y 10% de descuento
  Wine,          // Para Un Litro Gratis
  Beer,          // Para Ronda de Cerveza
  Flame,         // Para Un Shot (intenso/fuego)
  Sparkles,      // Para Una Media (botella/licor)
  Skull,         // Para No Ganaste
  Frown,         // Alternativa visual para No Ganaste
  type LucideIcon 
} from 'lucide-react';

export interface SegmentoRuleta {
  id: string;
  texto: string;
  icono: LucideIcon;
  esGanador: boolean;
  color: string;
}

// 🎡 Distribución alternada (Ganador -> No Ganador -> Ganador...)
// para evitar acumulación de premios en un solo lado de la rueda.
export const SEGMENTOS_BASE: Omit<SegmentoRuleta, 'id'>[] = [
  { 
    texto: '20% Descuento', 
    icono: Percent, 
    esGanador: true, 
    color: '#00f3ff' // Cían Neón
  },
  { 
    texto: 'Sigue Intentando', 
    icono: Skull, 
    esGanador: false, 
    color: '#1c162e' // Oscuro
  },
  { 
    texto: 'Un Litro Gratis', 
    icono: Wine, 
    esGanador: true, 
    color: '#ff007f' // Magenta Neón
  },
  { 
    texto: 'Casi... No Ganaste', 
    icono: Frown, 
    esGanador: false, 
    color: '#130d24' // Oscuro Profundo
  },
  { 
    texto: 'Ronda Cerveza', 
    icono: Beer, 
    esGanador: true, 
    color: '#ffee00' // Amarillo Neón
  },
  { 
    texto: 'Intenta de Nuevo', 
    icono: Skull, 
    esGanador: false, 
    color: '#1c162e' // Oscuro
  },
  { 
    texto: 'Un Shot Picante', 
    icono: Flame, 
    esGanador: true, 
    color: '#ff4500' // Naranja Neón
  },
  { 
    texto: '10% en la Cuenta', 
    icono: Percent, 
    esGanador: true, 
    color: '#00ff66' // Verde Neón
  },
  { 
    texto: 'Una Media Gratis', 
    icono: Sparkles, 
    esGanador: true, 
    color: '#a855f7' // Púrpura Neón
  },
];