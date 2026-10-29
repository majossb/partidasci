-- 019_alter_edad_to_text.sql
-- Cambiar el tipo de la columna 'edad' de INTEGER a TEXT en la tabla sacramentos_defuncion
-- para permitir registrar edades textuales (ej: '90 años', '3 meses', 'No registra').

ALTER TABLE public.sacramentos_defuncion ALTER COLUMN edad TYPE TEXT;
