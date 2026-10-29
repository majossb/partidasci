-- 008_ajuste_esquemas.sql

-- 1. Agregar columna 'libro' a TODAS las tablas
ALTER TABLE public.sacramentos_bautismo ADD COLUMN IF NOT EXISTS libro TEXT;
ALTER TABLE public.sacramentos_confirmacion ADD COLUMN IF NOT EXISTS libro TEXT;
ALTER TABLE public.sacramentos_matrimonio ADD COLUMN IF NOT EXISTS libro TEXT;
ALTER TABLE public.sacramentos_defuncion ADD COLUMN IF NOT EXISTS libro TEXT;

-- 2. Ajustes Confirmaciones (según foto)
ALTER TABLE public.sacramentos_confirmacion ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE public.sacramentos_confirmacion ADD COLUMN IF NOT EXISTS lugar_nacimiento TEXT;
ALTER TABLE public.sacramentos_confirmacion ADD COLUMN IF NOT EXISTS folio_bautismo TEXT;

-- 3. Ajustes Matrimonios (según foto)
ALTER TABLE public.sacramentos_matrimonio ADD COLUMN IF NOT EXISTS fecha_bautismo_esposo DATE;
ALTER TABLE public.sacramentos_matrimonio ADD COLUMN IF NOT EXISTS numero_bautismo_esposo TEXT;
ALTER TABLE public.sacramentos_matrimonio ADD COLUMN IF NOT EXISTS fecha_bautismo_esposa DATE;
ALTER TABLE public.sacramentos_matrimonio ADD COLUMN IF NOT EXISTS numero_bautismo_esposa TEXT;
