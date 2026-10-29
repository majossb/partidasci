-- 016_allow_padre_insert.sql
-- Habilitar la creación (INSERT) de partidas tanto para el rol de 'secretaria' como de 'padre'.
-- Anteriormente solo se permitía a 'secretaria', lo cual causaba errores de RLS (Row Level Security)
-- si el usuario con rol de 'padre' intentaba registrar una nueva partida desde el sistema.

-- 1. Bautismos
DROP POLICY IF EXISTS "Solo Secretaria puede crear bautismos" ON public.sacramentos_bautismo;
CREATE POLICY "Secretaria y Padre pueden crear bautismos" 
ON public.sacramentos_bautismo FOR INSERT 
WITH CHECK (public.get_user_role() IN ('secretaria', 'padre'));

-- 2. Confirmaciones
DROP POLICY IF EXISTS "Solo Secretaria puede crear confirmaciones" ON public.sacramentos_confirmacion;
CREATE POLICY "Secretaria y Padre pueden crear confirmaciones" 
ON public.sacramentos_confirmacion FOR INSERT 
WITH CHECK (public.get_user_role() IN ('secretaria', 'padre'));

-- 3. Matrimonios
DROP POLICY IF EXISTS "Solo Secretaria puede crear matrimonios" ON public.sacramentos_matrimonio;
CREATE POLICY "Secretaria y Padre pueden crear matrimonios" 
ON public.sacramentos_matrimonio FOR INSERT 
WITH CHECK (public.get_user_role() IN ('secretaria', 'padre'));

-- 4. Defunciones
DROP POLICY IF EXISTS "Solo Secretaria puede crear defunciones" ON public.sacramentos_defuncion;
CREATE POLICY "Secretaria y Padre pueden crear defunciones" 
ON public.sacramentos_defuncion FOR INSERT 
WITH CHECK (public.get_user_role() IN ('secretaria', 'padre'));
