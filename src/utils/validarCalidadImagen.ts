/**
 * Utilidades para validar la calidad, formato y legibilidad de imágenes
 * en el módulo de digitalización con Inteligencia Artificial (OCR).
 */

export const MENSAJE_IMAGEN_NO_LEGIBLE = 'No se pudo leer el documento. Adjunte una imagen nítida en JPG o PNG';

export const DIMENSION_MINIMA_IMAGEN = 300; // En píxeles (ancho y alto mínimo para caligrafía eclesiástica)

export interface ResultadoValidacionCalidad {
  esLegible: boolean;
  error?: string;
}

/**
 * Valida si el archivo subido tiene un formato admitido (JPG o PNG).
 */
export function validarFormatoArchivo(file: File): ResultadoValidacionCalidad {
  const mimeTypesValidos = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!mimeTypesValidos.includes(file.type.toLowerCase())) {
    return {
      esLegible: false,
      error: MENSAJE_IMAGEN_NO_LEGIBLE,
    };
  }
  return { esLegible: true };
}

/**
 * Valida que las dimensiones del elemento de imagen sean suficientes
 * para contener texto eclesiástico legible.
 */
export function validarDimensionesImagen(width: number, height: number): ResultadoValidacionCalidad {
  if (width < DIMENSION_MINIMA_IMAGEN || height < DIMENSION_MINIMA_IMAGEN) {
    return {
      esLegible: false,
      error: MENSAJE_IMAGEN_NO_LEGIBLE,
    };
  }
  return { esLegible: true };
}

/**
 * Analiza una muestra de píxeles del canvas para comprobar si la imagen
 * tiene contraste suficiente o si es un lienzo completamente uniforme (negro, blanco o gris).
 */
export function validarContrasteCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): ResultadoValidacionCalidad {
  try {
    // Tomar una muestra central o reducida para no saturar memoria
    const sampleWidth = Math.min(width, 100);
    const sampleHeight = Math.min(height, 100);
    const startX = Math.max(0, Math.floor((width - sampleWidth) / 2));
    const startY = Math.max(0, Math.floor((height - sampleHeight) / 2));

    const imageData = ctx.getImageData(startX, startY, sampleWidth, sampleHeight);
    const data = imageData.data;

    let sumaBrillo = 0;
    const totalPixeles = sampleWidth * sampleHeight;

    // Calcular brillo medio (luminancia aproximada)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brillo = 0.299 * r + 0.587 * g + 0.114 * b;
      sumaBrillo += brillo;
    }

    const mediaBrillo = sumaBrillo / totalPixeles;

    // Si la imagen es casi completamente negra (< 12) o completamente blanca/quemada (> 248)
    if (mediaBrillo < 12 || mediaBrillo > 248) {
      return {
        esLegible: false,
        error: MENSAJE_IMAGEN_NO_LEGIBLE,
      };
    }

    // Calcular varianza/desviación para medir contraste
    let sumaDiferenciasCuadradas = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brillo = 0.299 * r + 0.587 * g + 0.114 * b;
      const diff = brillo - mediaBrillo;
      sumaDiferenciasCuadradas += diff * diff;
    }

    const desviacion = Math.sqrt(sumaDiferenciasCuadradas / totalPixeles);

    // Si la desviación estándar es extremadamente baja (< 6), la imagen es plana (sin texto visible)
    if (desviacion < 6) {
      return {
        esLegible: false,
        error: MENSAJE_IMAGEN_NO_LEGIBLE,
      };
    }

    return { esLegible: true };
  } catch {
    // Si falla el acceso al canvas (por CORS o restricciones), no bloquear la imagen
    return { esLegible: true };
  }
}

/**
 * Valida los datos devueltos por la IA para confirmar que corresponden
 * a un documento legible con información sacramental identificable.
 */
export function validarDatosExtraidosLegibles(
  tipo: 'bautismo' | 'confirmacion' | 'defuncion' | 'matrimonio',
  parsed: any
): ResultadoValidacionCalidad {
  if (!parsed) {
    return { esLegible: false, error: MENSAJE_IMAGEN_NO_LEGIBLE };
  }

  // 1. Si la IA explicitó que el documento no es legible
  if (parsed.es_legible === false) {
    return {
      esLegible: false,
      error: parsed.error || parsed.mensaje_error || MENSAJE_IMAGEN_NO_LEGIBLE,
    };
  }

  const registros = Array.isArray(parsed.registros) ? parsed.registros : [parsed];

  if (registros.length === 0) {
    return { esLegible: false, error: MENSAJE_IMAGEN_NO_LEGIBLE };
  }

  // 2. Verificar que al menos un registro tenga campos esenciales legibles
  const tieneAlMenosUnRegistroValido = registros.some((reg: any) => {
    if (!reg || typeof reg !== 'object') return false;

    if (tipo === 'bautismo') {
      const tieneNombre = Boolean(reg.nombre_bautizado && String(reg.nombre_bautizado).trim().length > 1);
      const tieneApellidos = Boolean(reg.apellidos_bautizado && String(reg.apellidos_bautizado).trim().length > 1);
      const tieneFecha = Boolean(reg.fecha_bautismo && String(reg.fecha_bautismo).trim().length > 0);
      const tienePadres = Boolean(
        (reg.nombre_padre && !reg.nombre_padre.includes('No registra')) ||
        (reg.nombre_madre && !reg.nombre_madre.includes('No registra'))
      );
      return tieneNombre || tieneApellidos || (tieneFecha && tienePadres);
    }

    if (tipo === 'confirmacion') {
      const tieneNombre = Boolean(reg.nombre_confirmado && String(reg.nombre_confirmado).trim().length > 1);
      const tieneApellidos = Boolean(reg.apellidos_confirmado && String(reg.apellidos_confirmado).trim().length > 1);
      const tieneFecha = Boolean(
        (reg.fecha_confirmacion && String(reg.fecha_confirmacion).trim().length > 0) ||
        (reg.anio_confirmacion && String(reg.anio_confirmacion).trim().length > 0)
      );
      return tieneNombre || tieneApellidos || tieneFecha;
    }

    if (tipo === 'defuncion') {
      const tieneNombre = Boolean(reg.nombre_difunto && String(reg.nombre_difunto).trim().length > 1);
      const tieneApellidos = Boolean(reg.apellidos_difunto && String(reg.apellidos_difunto).trim().length > 1);
      const tieneFecha = Boolean(reg.fecha_defuncion && String(reg.fecha_defuncion).trim().length > 0);
      return tieneNombre || tieneApellidos || tieneFecha;
    }

    if (tipo === 'matrimonio') {
      const tieneEsposo = Boolean(reg.nombre_esposo && String(reg.nombre_esposo).trim().length > 1);
      const tieneEsposa = Boolean(reg.nombre_esposa && String(reg.nombre_esposa).trim().length > 1);
      const tieneFecha = Boolean(reg.fecha_matrimonio && String(reg.fecha_matrimonio).trim().length > 0);
      return (tieneEsposo && tieneEsposa) || ((tieneEsposo || tieneEsposa) && tieneFecha);
    }

    return true;
  });

  if (!tieneAlMenosUnRegistroValido) {
    return {
      esLegible: false,
      error: MENSAJE_IMAGEN_NO_LEGIBLE,
    };
  }

  return { esLegible: true };
}
