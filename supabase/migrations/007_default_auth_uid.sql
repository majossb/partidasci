-- 007_default_auth_uid.sql

ALTER TABLE public.sacramentos_bautismo ALTER COLUMN creado_por SET DEFAULT auth.uid();
ALTER TABLE public.sacramentos_confirmacion ALTER COLUMN creado_por SET DEFAULT auth.uid();
ALTER TABLE public.sacramentos_matrimonio ALTER COLUMN creado_por SET DEFAULT auth.uid();
ALTER TABLE public.sacramentos_defuncion ALTER COLUMN creado_por SET DEFAULT auth.uid();
