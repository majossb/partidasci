/**
 * Constantes y configuración global de la entidad parroquial.
 * Lee las variables de entorno si están disponibles, con valores genéricos de respaldo.
 */
export const PARROQUIA_CONFIG = {
  nombre: import.meta.env.VITE_PARROQUIA_NOMBRE || 'Parroquia de Prueba',
  diocesis: import.meta.env.VITE_PARROQUIA_DIOCESIS || 'Diócesis de Prueba',
  direccion: import.meta.env.VITE_PARROQUIA_DIRECCION || 'Calle 1 # 2 - 3',
  telefono: import.meta.env.VITE_PARROQUIA_TELEFONO || '6000000000',
  ciudad: 'Ciudad de Prueba',
  departamento: 'Departamento de Prueba',
  logoUrl: '/parroquia_logo.svg',
};
