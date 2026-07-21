// lib/types/juegos.ts
import { 
  FerrisWheel, 
  HandMetal, 
  Box, 
  Zap, 
  Activity, 
  HelpCircle, 
  type LucideIcon 
} from 'lucide-react';

export type JuegoId = 'ruleta' | 'cajas' | 'barra_clicks' | 'sismografo' | 'trivia' | 'mesa-que-mas-aplauda';
export type TipoJuego = 'global' | 'por_mesa';

export interface ConfigJuego {
  id: JuegoId;
  nombre: string;
  tipo: TipoJuego;
  icono: LucideIcon;
}

export const JUEGOS_CONFIG: ConfigJuego[] = [
  { id: 'ruleta', nombre: 'La Ruleta Global', tipo: 'global', icono: FerrisWheel },
  { id: 'mesa-que-mas-aplauda', nombre: 'Mesa que mas aplauda', tipo: 'global', icono: HandMetal },
  { id: 'cajas', nombre: 'Los 5 Cajones', tipo: 'por_mesa', icono: Box },
  { id: 'barra_clicks', nombre: 'Reto de los 100 Clicks', tipo: 'por_mesa', icono: Zap },
  { id: 'sismografo', nombre: 'Sismógrafo del Perreo', tipo: 'global', icono: Activity },
  { id: 'trivia', nombre: 'Trivia Flash', tipo: 'global', icono: HelpCircle },
];

export interface EstadoJuego {
  juegoActivo: JuegoId | null;
  tipo: TipoJuego | null;
  mesaObjetivo: number | null;
  datos: Record<string, unknown>;
}

export const ESTADO_INICIAL: EstadoJuego = {
  juegoActivo: null,
  tipo: null,
  mesaObjetivo: null,
  datos: {},
};