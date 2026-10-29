-- supabase/migrations/020_add_presencio_to_matrimonio.sql
-- Agregar columna 'presencio' a la tabla de matrimonios

ALTER TABLE public.sacramentos_matrimonio ADD COLUMN IF NOT EXISTS presencio TEXT;
