import { BasePartida } from '@/types/sacramento.types';

export interface Matrimonio extends BasePartida {
  fecha_matrimonio: string;
  nombre_esposo: string;
  apellidos_esposo: string;
  nombre_esposa: string;
  apellidos_esposa: string;
  padre_esposo: string | null;
  madre_esposo: string | null;
  padre_esposa: string | null;
  madre_esposa: string | null;
  parroquia_bautismo_esposo: string | null;
  fecha_bautismo_esposo: string | null;
  libro_bautismo_esposo: string | null;
  folio_bautismo_esposo: string | null;
  numero_bautismo_esposo: string | null;
  parroquia_bautismo_esposa: string | null;
  fecha_bautismo_esposa: string | null;
  libro_bautismo_esposa: string | null;
  folio_bautismo_esposa: string | null;
  numero_bautismo_esposa: string | null;
  testigo1: string | null;
  testigo2: string | null;
  presencio: string | null;
  firma_base64?: string | null;
}
