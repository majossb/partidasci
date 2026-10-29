import { z } from 'zod';
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
  .transform(val => (val === '' ? null : val))
  .refine(val => !val || esNombreValido(val), {
    message: 'Solo se permiten letras, espacios, guiones o apóstrofes',
  });

const textoOpcional = z
  .string()
  .max(150, 'Máximo 150 caracteres')
  .nullable()
  .optional()
  .transform(val => (val === '' ? null : val));

export const defuncionSchema = z.object({
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
  fecha_defuncion: z.string().min(1, 'Este campo es obligatorio.'),
  nombre_difunto: z
    .string()
    .min(1, 'Este campo es obligatorio.')
    .max(100, 'Máximo 100 caracteres')
    .refine(esNombreValido, 'Ingrese un nombre válido (solo letras, espacios, guiones o apóstrofes)'),
  apellidos_difunto: z
    .string()
    .min(1, 'Este campo es obligatorio.')
    .max(100, 'Máximo 100 caracteres')
    .refine(esNombreValido, 'Ingrese apellidos válidos (solo letras, espacios, guiones o apóstrofes)'),
  edad: z
    .string()
    .max(50, 'Máximo 50 caracteres en edad')
    .nullable()
    .optional()
    .transform(val => (val === '' ? null : val))
    .refine(
      val => {
        if (!val) return true;
        // Si es puramente numérico, validar rango 0-130 años
        const trimmed = val.trim();
        if (/^\d+$/.test(trimmed)) {
          const num = parseInt(trimmed, 10);
          return num >= 0 && num <= 130;
        }
        return true;
      },
      { message: 'La edad en años debe ser un número entre 0 y 130' }
    ),
  lugar_origen: textoOpcional,
  estado_civil: textoOpcional,
  padre_difunto: nombreOpcional,
  madre_difunto: nombreOpcional,
  causa_muerte: textoOpcional,
  da_fe: nombreOpcional,
  anotaciones: z.string().max(1000, 'Las observaciones no pueden exceder 1000 caracteres').optional().default(''),
}).superRefine((data, ctx) => {
  if (data.fecha_defuncion && data.fecha_defuncion.trim() !== '') {
    if (!esFechaReal(data.fecha_defuncion)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MENSAJE_FECHA_INVALIDA,
        path: ['fecha_defuncion'],
      });
    } else if (!esFechaNoFutura(data.fecha_defuncion)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MENSAJE_FECHA_FUTURA,
        path: ['fecha_defuncion'],
      });
    }
  }
});

export type DefuncionFormData = z.infer<typeof defuncionSchema>;
