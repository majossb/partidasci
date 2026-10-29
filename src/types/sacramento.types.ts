export type EstadoPartida = 'activo' | 'requiere_revision' | 'anulado';

export interface BasePartida {
  id: string;
  libro?: string;
  folio: number;
  numero: number;
  parroquia: string;
  estado: EstadoPartida;
  da_fe: string | null;
  anotaciones: string | null;
  motivo_anulacion?: string | null;
  creado_por: string;
  creado_en: string;
  actualizado_por?: string | null;
  actualizado_en?: string | null;
}
