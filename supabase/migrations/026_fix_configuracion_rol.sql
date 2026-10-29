-- 026_fix_configuracion_rol.sql
-- Elimina la política que usaba raw_user_meta_data y la reemplaza por la función segura get_user_role().
DROP POLICY IF EXISTS "Padre puede modificar configuración" ON public.configuracion_parroquia;

CREATE POLICY "Padre puede modificar configuración"
  ON public.configuracion_parroquia FOR ALL
  USING (public.get_user_role() = 'padre');
