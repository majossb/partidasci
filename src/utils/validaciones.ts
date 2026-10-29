import { parseISO, isAfter, isValid, startOfDay } from 'date-fns';

/**
 * Expresión regular para nombres y apellidos de personas.
 * Acepta letras en español (incluyendo acentos, diéresis y la eñe), espacios, apóstrofes, guiones y puntos abreviativos.
 * Rechaza números y caracteres especiales no válidos para nombres.
 */
export const REGEX_NOMBRE_PERSONA = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'\-.]+$/;

/**
 * Valida si un texto cumple con las normas de un nombre de persona canónico.
 */
export function esNombreValido(texto?: string | null): boolean {
  if (!texto) return true; // Para campos opcionales; si es requerido se maneja con .min(1)
  const limpio = texto.trim();
  if (limpio.length === 0) return true;
  return REGEX_NOMBRE_PERSONA.test(limpio);
}

export const ANIO_MINIMO_SISTEMA = 1900;

export const MENSAJE_FECHA_INVALIDA = 'La fecha ingresada no es válida.';
export const MENSAJE_FECHA_FUTURA = 'La fecha no puede ser posterior a la fecha actual.';
export const MENSAJE_FECHA_INCONSISTENTE_NACIMIENTO = 'La fecha ingresada no es consistente con la fecha de nacimiento.';

/**
 * Comprueba si una cadena de fecha es una fecha real en el calendario (no desbordamientos).
 */
export function esFechaReal(fechaStr?: string | null): boolean {
  if (!fechaStr || fechaStr.trim() === '') return true;
  
  // Debe coincidir con formato YYYY-MM-DD
  const partes = fechaStr.split('-');
  if (partes.length !== 3) return false;
  
  const y = parseInt(partes[0], 10);
  const m = parseInt(partes[1], 10);
  const d = parseInt(partes[2], 10);
  
  if (isNaN(y) || isNaN(m) || isNaN(d)) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  if (y < ANIO_MINIMO_SISTEMA) return false;

  const date = parseISO(fechaStr);
  if (!isValid(date)) return false;

  // Verificar que día y mes no hayan sido auto-corregidos (ej. 31 feb -> 3 marzo)
  return date.getFullYear() === y && (date.getMonth() + 1) === m && date.getDate() === d;
}

/**
 * Comprueba que una fecha no sea posterior al día actual.
 */
export function esFechaNoFutura(fechaStr?: string | null): boolean {
  if (!fechaStr || fechaStr.trim() === '') return true;
  if (!esFechaReal(fechaStr)) return false;
  
  const fecha = startOfDay(parseISO(fechaStr));
  const hoy = startOfDay(new Date());
  
  return !isAfter(fecha, hoy);
}

/**
 * Valida si un año es válido para el sistema parroquial (1900 hasta el año actual).
 */
export function esAnioValido(anio?: string | number | null): boolean {
  if (anio === undefined || anio === null || anio === '') return true;
  const num = typeof anio === 'string' ? parseInt(anio.trim(), 10) : anio;
  if (isNaN(num)) return false;
  const maxAnio = new Date().getFullYear() + 1;
  return num >= ANIO_MINIMO_SISTEMA && num <= maxAnio;
}

/**
 * Valida si un texto de año tiene exactamente 4 dígitos y es igual o mayor a 1900.
 */
export function esAnioCuatroDigitos(anio?: string | null): boolean {
  if (!anio || anio.trim() === '') return false;
  const limpio = anio.trim();
  if (!/^\d{4}$/.test(limpio)) return false;
  return esAnioValido(limpio);
}

/**
 * Retorna el mensaje de error correspondiente al valor ingresado para un año.
 * Si el año es válido o está vacío, retorna null.
 */
export function obtenerErrorAnio(anio?: string | null): string | null {
  if (!anio || anio.trim() === '') return null;
  const limpio = anio.trim();

  // 1. Solo valores numéricos
  if (!/^\d+$/.test(limpio)) {
    return 'Solo se permiten valores numéricos para el año.';
  }

  // 2. Exactamente 4 dígitos
  if (limpio.length < 4) {
    return 'El año debe tener 4 dígitos y ser igual o mayor a 1900.';
  }

  if (limpio.length > 4) {
    return 'El año debe tener exactamente 4 dígitos.';
  }

  // 3. Rango mínimo 1900
  const num = parseInt(limpio, 10);
  if (num < ANIO_MINIMO_SISTEMA) {
    return 'El año debe ser igual o mayor a 1900.';
  }

  // 4. Límite máximo actual
  const maxAnio = new Date().getFullYear() + 1;
  if (num > maxAnio) {
    return `El año no puede ser superior a ${maxAnio}.`;
  }

  return null;
}

/**
 * Diccionario de nombres legibles en español para todos los campos de partidas sacramentales.
 */
export const NOMBRES_CAMPOS_ES: Record<string, string> = {
  libro: 'Libro',
  folio: 'Folio',
  numero: 'Número de Partida',
  parroquia: 'Parroquia',
  fecha_bautismo: 'Fecha de Bautismo',
  fecha_nacimiento: 'Fecha de Nacimiento',
  lugar_nacimiento: 'Lugar de Nacimiento',
  ministro: 'Ministro',
  nombre_bautizado: 'Nombres del Bautizado',
  apellidos_bautizado: 'Apellidos del Bautizado',
  nombre_padre: 'Nombre del Padre',
  nombre_madre: 'Nombre de la Madre',
  abuelos_paternos: 'Abuelos Paternos',
  abuelos_maternos: 'Abuelos Maternos',
  padrino: 'Padrino',
  madrina: 'Madrina',
  da_fe: 'Quien Da Fe (Firma)',
  anotaciones: 'Notas Marginales / Anotaciones',
  fecha_confirmacion: 'Fecha de Confirmación',
  anio_confirmacion: 'Año de la Confirmación',
  nombre_confirmado: 'Nombres del Confirmado',
  apellidos_confirmado: 'Apellidos del Confirmado',
  lugar_confirmacion: 'Lugar de Confirmación',
  obispo: 'Obispo',
  padrino_madrina: 'Padrino / Madrina',
  parroquia_bautismo: 'Parroquia de Bautismo',
  diocesis: 'Diócesis',
  dia_semana: 'Día de la Semana',
  numero_libro_bautismo: 'Libro de Bautismo',
  folio_bautismo: 'Folio de Bautismo',
  numero_bautismo: 'Número de Bautismo',
  fecha_matrimonio: 'Fecha de Matrimonio',
  nombre_esposo: 'Nombres del Esposo',
  apellidos_esposo: 'Apellidos del Esposo',
  nombre_esposa: 'Nombres de la Esposa',
  apellidos_esposa: 'Apellidos de la Esposa',
  padre_esposo: 'Padre del Esposo',
  madre_esposo: 'Madre del Esposo',
  padre_esposa: 'Padre de la Esposa',
  madre_esposa: 'Madre de la Esposa',
  parroquia_bautismo_esposo: 'Parroquia Bautismo Esposo',
  fecha_bautismo_esposo: 'Fecha Bautismo Esposo',
  libro_bautismo_esposo: 'Libro Bautismo Esposo',
  folio_bautismo_esposo: 'Folio Bautismo Esposo',
  numero_bautismo_esposo: 'Número Bautismo Esposo',
  parroquia_bautismo_esposa: 'Parroquia Bautismo Esposa',
  fecha_bautismo_esposa: 'Fecha Bautismo Esposa',
  libro_bautismo_esposa: 'Libro Bautismo Esposa',
  folio_bautismo_esposa: 'Folio Bautismo Esposa',
  numero_bautismo_esposa: 'Número Bautismo Esposa',
  testigo1: 'Testigo 1',
  testigo2: 'Testigo 2',
  presencio: 'Presenció (Ministro/Sacerdote)',
  nombre_difunto: 'Nombres del Difunto',
  apellidos_difunto: 'Apellidos del Difunto',
  fecha_defuncion: 'Fecha de Defunción',
  edad: 'Edad',
  lugar_origen: 'Lugar de Origen',
  estado_civil: 'Estado Civil',
  padre_difunto: 'Padre del Difunto',
  madre_difunto: 'Madre del Difunto',
  causa_muerte: 'Causa de Muerte',
};

/**
 * Obtiene el nombre en español legible de un campo, o una versión formateada si no está en el diccionario.
 */
export function obtenerNombreCampo(campo: string): string {
  if (NOMBRES_CAMPOS_ES[campo]) {
    return NOMBRES_CAMPOS_ES[campo];
  }
  return campo
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
