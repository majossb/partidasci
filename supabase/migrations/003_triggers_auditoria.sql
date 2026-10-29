-- 003_triggers_auditoria.sql

-- Función principal que captura el cambio y lo inserta en audit_log
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
    v_usuario_rol := auth.jwt() -> 'app_metadata' ->> 'role';

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

-- Aplicar triggers a las tablas
CREATE TRIGGER audit_bautismo_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.sacramentos_bautismo
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_confirmacion_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.sacramentos_confirmacion
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_matrimonio_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.sacramentos_matrimonio
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_defuncion_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.sacramentos_defuncion
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
