import { BasePartida } from '@/types/sacramento.types';

export interface Confirmacion extends BasePartida {
  fecha_confirmacion: string | null;
  anio_confirmacion: number | null;
  ministro: string | null;
  obispo: string | null;
  nombre_confirmado: string;
  apellidos_confirmado: string;
  lugar_confirmacion: string | null;
  fecha_nacimiento: string | null;
  lugar_nacimiento: string | null;
  nombre_padre: string | null;
  nombre_madre: string | null;
  padrino_madrina: string | null;
  parroquia_bautismo: string | null;
  diocesis: string | null;
  dia_semana: string | null;
  numero_libro_bautismo: string | null;
  folio_bautismo: string | null;
  numero_bautismo: string | null;
}
