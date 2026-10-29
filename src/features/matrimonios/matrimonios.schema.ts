import { z } from 'zod';
import { parseISO, isAfter } from 'date-fns';
import {
  esNombreValido,
  esFechaReal,
  esFechaNoFutura,
  MENSAJE_FECHA_INVALIDA,
  MENSAJE_FECHA_FUTURA
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

export const matrimonioSchema = z.object({
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
  fecha_matrimonio: z.string().min(1, 'Este campo es obligatorio.'),
  nombre_esposo: z
    .string()
    .min(1, 'Este campo es obligatorio.')
    .max(100, 'Máximo 100 caracteres')
    .refine(esNombreValido, 'Ingrese un nombre válido para el esposo'),
  apellidos_esposo: z
    .string()
    .min(1, 'Este campo es obligatorio.')
    .max(100, 'Máximo 100 caracteres')
    .refine(esNombreValido, 'Ingrese apellidos válidos para el esposo'),
  nombre_esposa: z
    .string()
    .min(1, 'Este campo es obligatorio.')
    .max(100, 'Máximo 100 caracteres')
    .refine(esNombreValido, 'Ingrese un nombre válido para la esposa'),
  apellidos_esposa: z
    .string()
    .min(1, 'Este campo es obligatorio.')
    .max(100, 'Máximo 100 caracteres')
    .refine(esNombreValido, 'Ingrese apellidos válidos para la esposa'),
  padre_esposo: nombreOpcional,
  madre_esposo: nombreOpcional,
  padre_esposa: nombreOpcional,
  madre_esposa: nombreOpcional,
  parroquia_bautismo_esposo: z.string().max(150, 'Máximo 150 caracteres').nullable().optional(),
  fecha_bautismo_esposo: z.string().nullable().optional().or(z.literal('')),
  libro_bautismo_esposo: z.string().max(20, 'Máximo 20 caracteres').nullable().optional(),
  folio_bautismo_esposo: z.string().max(20, 'Máximo 20 caracteres').nullable().optional(),
  numero_bautismo_esposo: z.string().max(20, 'Máximo 20 caracteres').nullable().optional(),
  parroquia_bautismo_esposa: z.string().max(150, 'Máximo 150 caracteres').nullable().optional(),
  fecha_bautismo_esposa: z.string().nullable().optional().or(z.literal('')),
  libro_bautismo_esposa: z.string().max(20, 'Máximo 20 caracteres').nullable().optional(),
  folio_bautismo_esposa: z.string().max(20, 'Máximo 20 caracteres').nullable().optional(),
  numero_bautismo_esposa: z.string().max(20, 'Máximo 20 caracteres').nullable().optional(),
  testigo1: nombreOpcional,
  testigo2: nombreOpcional,
  presencio: nombreOpcional,
  firma_base64: z.string().nullable().optional(),
  da_fe: nombreOpcional,
  anotaciones: z.string().max(1000, 'Las observaciones no pueden exceder 1000 caracteres').optional().default(''),
}).superRefine((data, ctx) => {
  // Validación de fecha_matrimonio
  if (data.fecha_matrimonio && data.fecha_matrimonio.trim() !== '') {
    if (!esFechaReal(data.fecha_matrimonio)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MENSAJE_FECHA_INVALIDA,
        path: ['fecha_matrimonio'],
      });
    } else if (!esFechaNoFutura(data.fecha_matrimonio)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MENSAJE_FECHA_FUTURA,
        path: ['fecha_matrimonio'],
      });
    }
  }

  // Validación de fecha_bautismo_esposo
  if (data.fecha_bautismo_esposo && data.fecha_bautismo_esposo.trim() !== '') {
    if (!esFechaReal(data.fecha_bautismo_esposo)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MENSAJE_FECHA_INVALIDA,
        path: ['fecha_bautismo_esposo'],
      });
    } else if (!esFechaNoFutura(data.fecha_bautismo_esposo)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MENSAJE_FECHA_FUTURA,
        path: ['fecha_bautismo_esposo'],
      });
    }
  }

  // Validación de fecha_bautismo_esposa
  if (data.fecha_bautismo_esposa && data.fecha_bautismo_esposa.trim() !== '') {
    if (!esFechaReal(data.fecha_bautismo_esposa)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MENSAJE_FECHA_INVALIDA,
        path: ['fecha_bautismo_esposa'],
      });
    } else if (!esFechaNoFutura(data.fecha_bautismo_esposa)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MENSAJE_FECHA_FUTURA,
        path: ['fecha_bautismo_esposa'],
      });
    }
  }

  // Coherencia bautismo esposo vs matrimonio
  if (
    data.fecha_matrimonio &&
    data.fecha_bautismo_esposo &&
    esFechaReal(data.fecha_matrimonio) &&
    esFechaReal(data.fecha_bautismo_esposo)
  ) {
    const fMatrimonio = parseISO(data.fecha_matrimonio);
    const fBautEsposo = parseISO(data.fecha_bautismo_esposo);
    if (isAfter(fBautEsposo, fMatrimonio)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de bautismo del esposo no puede ser posterior al matrimonio',
        path: ['fecha_bautismo_esposo'],
      });
    }
  }

  // Coherencia bautismo esposa vs matrimonio
  if (
    data.fecha_matrimonio &&
    data.fecha_bautismo_esposa &&
    esFechaReal(data.fecha_matrimonio) &&
    esFechaReal(data.fecha_bautismo_esposa)
  ) {
    const fMatrimonio = parseISO(data.fecha_matrimonio);
    const fBautEsposa = parseISO(data.fecha_bautismo_esposa);
    if (isAfter(fBautEsposa, fMatrimonio)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de bautismo de la esposa no puede ser posterior al matrimonio',
        path: ['fecha_bautismo_esposa'],
      });
    }
  }
});

export type MatrimonioFormData = z.infer<typeof matrimonioSchema>;
