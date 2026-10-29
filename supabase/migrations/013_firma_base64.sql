-- 013_firma_base64.sql
-- Añadir columna para almacenar una firma específica de la partida en base64

ALTER TABLE public.sacramentos_bautismo
ADD COLUMN IF NOT EXISTS firma_base64 TEXT;
