-- 006_estado_anulado.sql

-- Agregar 'anulado' al ENUM estado_partida
ALTER TYPE estado_partida ADD VALUE IF NOT EXISTS 'anulado';

-- Agregar columna 'motivo_anulacion' a las 4 tablas
ALTER TABLE public.sacramentos_bautismo ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT;
ALTER TABLE public.sacramentos_confirmacion ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT;
ALTER TABLE public.sacramentos_matrimonio ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT;
ALTER TABLE public.sacramentos_defuncion ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT;
