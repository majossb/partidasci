import { z } from 'zod';
import { parseISO, isAfter } from 'date-fns';
import {
  esNombreValido,
  esFechaReal,
  esFechaNoFutura,
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
  .refine(val => !val || esNombreValido(val), {
    message: 'Solo se permiten letras, espacios, guiones o apóstrofes',
  });

export const bautismoSchema = z.object({
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
  fecha_bautismo: z.string().min(1, 'Este campo es obligatorio.'),
  ministro: z
    .string()
    .min(1, 'Este campo es obligatorio.')
    .max(100, 'Máximo 100 caracteres')
    .refine(esNombreValido, 'Ingrese un nombre válido (solo letras, espacios, guiones o apóstrofes)'),
  nombre_bautizado: z
    .string()
    .min(1, 'Este campo es obligatorio.')
    .max(100, 'Máximo 100 caracteres')
    .refine(esNombreValido, 'Ingrese un nombre válido (solo letras, espacios, guiones o apóstrofes)'),
  apellidos_bautizado: z
    .string()
    .min(1, 'Este campo es obligatorio.')
    .max(100, 'Máximo 100 caracteres')
    .refine(esNombreValido, 'Ingrese un apellido válido (solo letras, espacios, guiones o apóstrofes)'),
  fecha_nacimiento: z.string().nullable().optional().or(z.literal('')),
  lugar_nacimiento: z.string().min(1, 'Este campo es obligatorio.').max(150, 'Máximo 150 caracteres'),
  nombre_padre: nombreOpcional,
  nombre_madre: nombreOpcional,
  abuelos_paternos: nombreOpcional,
  abuelos_maternos: nombreOpcional,
  padrino: nombreOpcional,
  madrina: nombreOpcional,
  da_fe: nombreOpcional,
  anotaciones: z.string().max(1000, 'Las observaciones no pueden exceder 1000 caracteres').optional().default(''),
  firma_base64: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
  // Validación de fecha_bautismo
  if (data.fecha_bautismo && data.fecha_bautismo.trim() !== '') {
    if (!esFechaReal(data.fecha_bautismo)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MENSAJE_FECHA_INVALIDA,
        path: ['fecha_bautismo'],
      });
    } else if (!esFechaNoFutura(data.fecha_bautismo)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MENSAJE_FECHA_FUTURA,
        path: ['fecha_bautismo'],
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

  // Validación cruzada: nacimiento vs bautismo
  if (
    data.fecha_bautismo &&
    data.fecha_nacimiento &&
    esFechaReal(data.fecha_bautismo) &&
    esFechaReal(data.fecha_nacimiento)
  ) {
    const fechaBautismo = parseISO(data.fecha_bautismo);
    const fechaNacimiento = parseISO(data.fecha_nacimiento);

    if (isAfter(fechaNacimiento, fechaBautismo)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MENSAJE_FECHA_INCONSISTENTE_NACIMIENTO,
        path: ['fecha_bautismo'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de nacimiento no puede ser posterior a la fecha de bautismo',
        path: ['fecha_nacimiento'],
      });
    }
  }
});

export type BautismoFormData = z.infer<typeof bautismoSchema>;
