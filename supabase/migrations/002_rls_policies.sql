-- 002_rls_policies.sql

-- ============================================================================
-- 1. HABILITACIÓN DE RLS (Row Level Security)
-- ============================================================================
ALTER TABLE public.sacramentos_bautismo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sacramentos_confirmacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sacramentos_matrimonio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sacramentos_defuncion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. FUNCIONES DE UTILIDAD
-- ============================================================================
-- Función auxiliar para obtener el rol del usuario desde los metadatos del JWT
-- Se crea en el esquema 'public' porque Supabase no permite crear funciones en 'auth'
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'role');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. POLÍTICAS COMUNES: LECTURA (SELECT) Y ACTUALIZACIÓN (UPDATE)
-- Ambos roles (Secretaria y Padre) pueden consultar y editar partidas
-- ============================================================================

-- Bautismos
CREATE POLICY "Secretaria y Padre pueden leer bautismos" 
ON public.sacramentos_bautismo FOR SELECT 
USING (public.get_user_role() IN ('secretaria', 'padre'));

CREATE POLICY "Secretaria y Padre pueden editar bautismos" 
ON public.sacramentos_bautismo FOR UPDATE 
USING (public.get_user_role() IN ('secretaria', 'padre'));

-- Confirmaciones
CREATE POLICY "Secretaria y Padre pueden leer confirmaciones" 
ON public.sacramentos_confirmacion FOR SELECT 
USING (public.get_user_role() IN ('secretaria', 'padre'));

CREATE POLICY "Secretaria y Padre pueden editar confirmaciones" 
ON public.sacramentos_confirmacion FOR UPDATE 
USING (public.get_user_role() IN ('secretaria', 'padre'));

-- Matrimonios
CREATE POLICY "Secretaria y Padre pueden leer matrimonios" 
ON public.sacramentos_matrimonio FOR SELECT 
USING (public.get_user_role() IN ('secretaria', 'padre'));

CREATE POLICY "Secretaria y Padre pueden editar matrimonios" 
ON public.sacramentos_matrimonio FOR UPDATE 
USING (public.get_user_role() IN ('secretaria', 'padre'));

-- Defunciones
CREATE POLICY "Secretaria y Padre pueden leer defunciones" 
ON public.sacramentos_defuncion FOR SELECT 
USING (public.get_user_role() IN ('secretaria', 'padre'));

CREATE POLICY "Secretaria y Padre pueden editar defunciones" 
ON public.sacramentos_defuncion FOR UPDATE 
USING (public.get_user_role() IN ('secretaria', 'padre'));

-- ============================================================================
-- 4. POLÍTICAS ESPECÍFICAS: CREACIÓN (INSERT)
-- Solo la Secretaria puede crear nuevos registros de partidas
-- ============================================================================

CREATE POLICY "Solo Secretaria puede crear bautismos" 
ON public.sacramentos_bautismo FOR INSERT 
WITH CHECK (public.get_user_role() = 'secretaria');

CREATE POLICY "Solo Secretaria puede crear confirmaciones" 
ON public.sacramentos_confirmacion FOR INSERT 
WITH CHECK (public.get_user_role() = 'secretaria');

CREATE POLICY "Solo Secretaria puede crear matrimonios" 
ON public.sacramentos_matrimonio FOR INSERT 
WITH CHECK (public.get_user_role() = 'secretaria');

CREATE POLICY "Solo Secretaria puede crear defunciones" 
ON public.sacramentos_defuncion FOR INSERT 
WITH CHECK (public.get_user_role() = 'secretaria');

-- ============================================================================
-- 5. POLÍTICAS DE AUDITORÍA (AUDIT LOG)
-- ============================================================================
-- NOTA: Nadie puede hacer INSERT, UPDATE o DELETE directo en audit_log 
-- ya que esto es manejado internamente por el trigger bypassando RLS.

-- Solo el Padre tiene privilegios para leer el historial de auditoría
CREATE POLICY "Solo Padre puede leer el historial de auditoría" 
ON public.audit_log FOR SELECT 
USING (public.get_user_role() = 'padre');

-- NOTA GENERAL SOBRE ELIMINACIÓN:
-- Las políticas de DELETE no han sido creadas para ninguna tabla. 
-- Gracias a que RLS está habilitado, esto garantiza implícitamente 
-- que ningún usuario puede eliminar registros (deny-by-default).
