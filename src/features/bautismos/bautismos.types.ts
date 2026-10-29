import { BasePartida } from '@/types/sacramento.types';

export interface Bautismo extends BasePartida {
  fecha_bautismo: string;
  ministro: string;
  nombre_bautizado: string;
  apellidos_bautizado: string;
  fecha_nacimiento: string;
  lugar_nacimiento: string;
  nombre_padre: string | null;
  nombre_madre: string | null;
  abuelos_paternos: string | null;
  abuelos_maternos: string | null;
  padrino: string | null;
  madrina: string | null;
  firma_base64?: string;
}
