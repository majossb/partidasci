import { BasePartida } from '@/types/sacramento.types';

export interface Defuncion extends BasePartida {
  fecha_defuncion: string;
  nombre_difunto: string;
  apellidos_difunto: string;
  edad: string | null;
  lugar_origen: string | null;
  estado_civil: string | null;
  padre_difunto: string | null;
  madre_difunto: string | null;
  causa_muerte: string | null;
}
