-- 017_ultimate_rls_fix.sql
-- Solución definitiva para el error 403 Forbidden.
-- Esta migración redefine la función get_user_role() para ser 100% inmune a:
-- 1. Diferencias de mayúsculas/minúsculas (ej. 'Secretaria' vs 'secretaria').
-- 2. Ubicación del rol (app_metadata -> 'role' en inglés o user_metadata -> 'rol' en español).
-- 3. Fallbacks leyendo directamente de auth.users si no se ha propagado al JWT.
-- Se define como una función SQL pura (LANGUAGE sql) para evitar problemas de parsing de PL/pgSQL y bloques BEGIN/END en editores SQL.

-- 1. REDEFINIR FUNCIÓN DE ROL EN PURE SQL (SIN BLOQUES PL/PGSQL PARA EVITAR ERRORES DE PARSING)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT LOWER(
    COALESCE(
      auth.jwt() -> 'app_metadata' ->> 'role',
      auth.jwt() -> 'user_metadata' ->> 'rol',
      (
        SELECT COALESCE(raw_app_meta_data ->> 'role', raw_user_meta_data ->> 'rol')
        FROM auth.users
        WHERE id = auth.uid()
      )
    )
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. ASEGURAR QUE LA FUNCIÓN DE AUDITORÍA TENGA SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    v_old_data JSONB;
    v_new_data JSONB;
    v_usuario_id UUID;
    v_usuario_email TEXT;
    v_usuario_rol TEXT;
BEGIN
    v_usuario_id := auth.uid();
    v_usuario_email := auth.jwt() ->> 'email';
    v_usuario_rol := public.get_user_role(); -- Usar la nueva función robusta

    IF (TG_OP = 'UPDATE') THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        INSERT INTO public.audit_log (tabla, operacion, registro_id, datos_anteriores, datos_nuevos, usuario_id, usuario_email, usuario_rol)
        VALUES (TG_TABLE_NAME::TEXT, 'UPDATE', NEW.id, v_old_data, v_new_data, v_usuario_id, v_usuario_email, v_usuario_rol);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        v_new_data := to_jsonb(NEW);
        INSERT INTO public.audit_log (tabla, operacion, registro_id, datos_anteriores, datos_nuevos, usuario_id, usuario_email, usuario_rol)
        VALUES (TG_TABLE_NAME::TEXT, 'INSERT', NEW.id, null, v_new_data, v_usuario_id, v_usuario_email, v_usuario_rol);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        v_old_data := to_jsonb(OLD);
        INSERT INTO public.audit_log (tabla, operacion, registro_id, datos_anteriores, datos_nuevos, usuario_id, usuario_email, usuario_rol)
        VALUES (TG_TABLE_NAME::TEXT, 'DELETE', OLD.id, v_old_data, null, v_usuario_id, v_usuario_email, v_usuario_rol);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. REAPLICAR POLÍTICAS DE INSERCIÓN PARA AMBOS ROLES (Asegurando el lowercase)
-- Bautismos
DROP POLICY IF EXISTS "Solo Secretaria puede crear bautismos" ON public.sacramentos_bautismo;
DROP POLICY IF EXISTS "Secretaria y Padre pueden crear bautismos" ON public.sacramentos_bautismo;
CREATE POLICY "Secretaria y Padre pueden crear bautismos" 
ON public.sacramentos_bautismo FOR INSERT 
WITH CHECK (public.get_user_role() IN ('secretaria', 'padre'));

-- Confirmaciones
DROP POLICY IF EXISTS "Solo Secretaria puede crear confirmaciones" ON public.sacramentos_confirmacion;
DROP POLICY IF EXISTS "Secretaria y Padre pueden crear confirmaciones" ON public.sacramentos_confirmacion;
CREATE POLICY "Secretaria y Padre pueden crear confirmaciones" 
ON public.sacramentos_confirmacion FOR INSERT 
WITH CHECK (public.get_user_role() IN ('secretaria', 'padre'));

-- Matrimonios
DROP POLICY IF EXISTS "Solo Secretaria puede crear matrimonios" ON public.sacramentos_matrimonio;
DROP POLICY IF EXISTS "Secretaria y Padre pueden crear matrimonios" ON public.sacramentos_matrimonio;
CREATE POLICY "Secretaria y Padre pueden crear matrimonios" 
ON public.sacramentos_matrimonio FOR INSERT 
WITH CHECK (public.get_user_role() IN ('secretaria', 'padre'));

-- Defunciones
DROP POLICY IF EXISTS "Solo Secretaria puede crear defunciones" ON public.sacramentos_defuncion;
DROP POLICY IF EXISTS "Secretaria y Padre pueden crear defunciones" ON public.sacramentos_defuncion;
CREATE POLICY "Secretaria y Padre pueden crear defunciones" 
ON public.sacramentos_defuncion FOR INSERT 
WITH CHECK (public.get_user_role() IN ('secretaria', 'padre'));
