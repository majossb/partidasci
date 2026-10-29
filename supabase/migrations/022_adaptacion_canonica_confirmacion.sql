-- 022_adaptacion_canonica_confirmacion.sql
-- Agregar columnas necesarias para la adaptación canónica de confirmaciones y relajar restricciones NOT NULL

-- Agregar obispo (opcional)
ALTER TABLE public.sacramentos_confirmacion 
  ADD COLUMN IF NOT EXISTS obispo TEXT;

-- Agregar da_fe (opcional, corrige inconsistencia con Zod/UI)
ALTER TABLE public.sacramentos_confirmacion 
  ADD COLUMN IF NOT EXISTS da_fe TEXT;

-- Agregar anio_confirmacion (opcional, para cuando no hay fecha completa)
ALTER TABLE public.sacramentos_confirmacion 
  ADD COLUMN IF NOT EXISTS anio_confirmacion INTEGER;

-- Hacer opcionales los campos en sacramentos_confirmacion
ALTER TABLE public.sacramentos_confirmacion ALTER COLUMN ministro DROP NOT NULL;
ALTER TABLE public.sacramentos_confirmacion ALTER COLUMN lugar_confirmacion DROP NOT NULL;

-- Hacer opcional el ministro en Bautismos (evita errores cuando no se registra)
ALTER TABLE public.sacramentos_bautismo ALTER COLUMN ministro DROP NOT NULL;
