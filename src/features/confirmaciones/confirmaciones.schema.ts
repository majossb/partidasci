import { z } from 'zod';
import { parseISO, isAfter } from 'date-fns';
import {
  esNombreValido,
  esFechaReal,
  esFechaNoFutura,
  esAnioValido,
  MENSAJE_FECHA_INVALIDA,
  MENSAJE_FECHA_FUTURA,
  MENSAJE_FECHA_INCONSISTENTE_NACIMIENTO
} from '@/utils/validaciones';
import { PARROQUIA_CONFIG } from '@/utils/constantes';

const nombreOpcional = z
  .string()
  .max(100, 'Máximo 100 caracteres')
  .nullable()
  .optional()
  .or(z.literal(''))
  .refine(val => !val || esNombreValido(val), {
    message: 'Solo se permiten letras, espacios, guiones o apóstrofes',
  });

export const confirmacionSchema = z.object({
  libro: z
    .string()
    .min(1, 'Este campo es obligatorio.')
    .max(20, 'El libro no puede tener más de 20 caracteres'),
  folio: z.coerce
    .number({ invalid_type_error: 'El número de folio debe ser numérico.' })
    .int('El número de folio debe ser un número entero')
    .min(1, 'El folio debe ser mayor a 0')
    .max(999999, 'El folio no puede exceder 999.999'),
  numero: z.coerce
    .number({ invalid_type_error: 'El número de partida debe ser numérico.' })
    .int('El número de partida debe ser un número entero')
    .min(1, 'El número debe ser mayor a 0')
    .max(999999, 'El número no puede exceder 999.999'),
  parroquia: z.string().min(1, 'Este campo es obligatorio.').default(PARROQUIA_CONFIG.nombre),
  fecha_confirmacion: z.string().nullable().optional().or(z.literal('')),
  anio_confirmacion: z.preprocess(
    val => (val === '' || val === null || val === undefined ? null : Number(val)),
    z
      .number({ invalid_type_error: 'Solo se permiten valores numéricos para el año.' })
      .int('El año debe ser un número entero')
      .min(1900, 'El año debe tener 4 dígitos y ser igual o mayor a 1900.')
      .nullable()
      .optional()
  ),
  ministro: nombreOpcional,
  obispo: nombreOpcional,
  nombre_confirmado: z
    .string()
    .min(1, 'Este campo es obligatorio.')
    .max(100, 'Máximo 100 caracteres')
    .refine(esNombreValido, 'Ingrese un nombre válido (solo letras, espacios, guiones o apóstrofes)'),
  apellidos_confirmado: z
    .string()
    .min(1, 'Este campo es obligatorio.')
    .max(100, 'Máximo 100 caracteres')
    .refine(esNombreValido, 'Ingrese un apellido válido (solo letras, espacios, guiones o apóstrofes)'),
  lugar_confirmacion: z.string().max(150, 'Máximo 150 caracteres').nullable().optional().or(z.literal('')),
  fecha_nacimiento: z.string().nullable().optional().or(z.literal('')),
  lugar_nacimiento: z.string().max(150, 'Máximo 150 caracteres').nullable().optional().or(z.literal('')),
  nombre_padre: nombreOpcional,
  nombre_madre: nombreOpcional,
  padrino_madrina: nombreOpcional,
  parroquia_bautismo: z.string().max(150, 'Máximo 150 caracteres').nullable().optional(),
  diocesis: z.string().max(150, 'Máximo 150 caracteres').nullable().optional(),
  dia_semana: z.string().max(30, 'Máximo 30 caracteres').nullable().optional(),
  numero_libro_bautismo: z.string().max(20, 'Máximo 20 caracteres').nullable().optional(),
  folio_bautismo: z.string().max(20, 'Máximo 20 caracteres').nullable().optional(),
  numero_bautismo: z.string().max(20, 'Máximo 20 caracteres').nullable().optional(),
  da_fe: nombreOpcional,
  anotaciones: z.preprocess((val) => val ?? '', z.string().max(1000, 'Las observaciones no pueden exceder 1000 caracteres').optional().default('')),
}).superRefine((data, ctx) => {
  const anioActual = new Date().getFullYear();

  // Validación de anio_confirmacion
  if (data.anio_confirmacion !== null && data.anio_confirmacion !== undefined) {
    if (data.anio_confirmacion < 1900) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El año debe tener 4 dígitos y ser igual o mayor a 1900.',
        path: ['anio_confirmacion'],
      });
    } else if (data.anio_confirmacion > anioActual) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El año no puede ser superior al actual.',
        path: ['anio_confirmacion'],
      });
    }
  }

  // Validación de fecha_confirmacion
  if (data.fecha_confirmacion && data.fecha_confirmacion.trim() !== '') {
    if (!esFechaReal(data.fecha_confirmacion)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MENSAJE_FECHA_INVALIDA,
        path: ['fecha_confirmacion'],
      });
    } else if (!esFechaNoFutura(data.fecha_confirmacion)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MENSAJE_FECHA_FUTURA,
        path: ['fecha_confirmacion'],
      });
    }
  }

  // Validación de fecha_nacimiento
  if (data.fecha_nacimiento && data.fecha_nacimiento.trim() !== '') {
    if (!esFechaReal(data.fecha_nacimiento)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MENSAJE_FECHA_INVALIDA,
        path: ['fecha_nacimiento'],
      });
    } else if (!esFechaNoFutura(data.fecha_nacimiento)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MENSAJE_FECHA_FUTURA,
        path: ['fecha_nacimiento'],
      });
    }
  }

  // Validación cruzada fecha nacimiento vs fecha confirmacion
  if (
    data.fecha_confirmacion &&
    data.fecha_nacimiento &&
    esFechaReal(data.fecha_confirmacion) &&
    esFechaReal(data.fecha_nacimiento)
  ) {
    const fechaConfirmacion = parseISO(data.fecha_confirmacion);
    const fechaNacimiento = parseISO(data.fecha_nacimiento);

    if (isAfter(fechaNacimiento, fechaConfirmacion)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MENSAJE_FECHA_INCONSISTENTE_NACIMIENTO,
        path: ['fecha_confirmacion'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de nacimiento no puede ser posterior a la fecha de confirmación',
        path: ['fecha_nacimiento'],
      });
    }
  }

  // Validación cruzada año nacimiento vs anio_confirmacion
  if (
    data.anio_confirmacion &&
    data.fecha_nacimiento &&
    esFechaReal(data.fecha_nacimiento)
  ) {
    const anioNac = parseISO(data.fecha_nacimiento).getFullYear();
    if (anioNac > data.anio_confirmacion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El año ingresado no es consistente con la fecha de nacimiento.',
        path: ['anio_confirmacion'],
      });
    }
  }
});

export type ConfirmacionFormData = z.infer<typeof confirmacionSchema>;
