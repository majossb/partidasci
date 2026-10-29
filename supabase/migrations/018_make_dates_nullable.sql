-- 018_make_dates_nullable.sql
-- Hacer que las fechas principales de sacramentos sean opcionales en la base de datos

ALTER TABLE public.sacramentos_bautismo ALTER COLUMN fecha_bautismo DROP NOT NULL;
ALTER TABLE public.sacramentos_bautismo ALTER COLUMN fecha_nacimiento DROP NOT NULL;
ALTER TABLE public.sacramentos_confirmacion ALTER COLUMN fecha_confirmacion DROP NOT NULL;
ALTER TABLE public.sacramentos_matrimonio ALTER COLUMN fecha_matrimonio DROP NOT NULL;
ALTER TABLE public.sacramentos_defuncion ALTER COLUMN fecha_sepultura DROP NOT NULL;
