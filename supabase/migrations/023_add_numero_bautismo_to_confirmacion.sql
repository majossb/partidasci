-- 023_add_numero_bautismo_to_confirmacion.sql
-- Agregar columna numero_bautismo (opcional) a la tabla de confirmaciones
ALTER TABLE public.sacramentos_confirmacion 
  ADD COLUMN IF NOT EXISTS numero_bautismo TEXT;
