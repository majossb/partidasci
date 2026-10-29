-- 009_ajustes_fase4.sql

-- Añadir campos extra a Defunciones según la foto del acta
ALTER TABLE public.sacramentos_defuncion ADD COLUMN IF NOT EXISTS edad TEXT;
ALTER TABLE public.sacramentos_defuncion ADD COLUMN IF NOT EXISTS lugar_origen TEXT;
