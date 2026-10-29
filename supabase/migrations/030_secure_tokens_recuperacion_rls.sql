-- Migration 030: Blindaje estricto de Row Level Security (RLS) en tokens_recuperacion
-- Corrige las políticas abiertas (USING true) eliminando la posibilidad de que
-- usuarios anónimos o no autorizados puedan listar, leer correos o modificar tokens.

-- 1. Asegurar que RLS esté activo
ALTER TABLE public.tokens_recuperacion ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar todas las políticas permisivas anteriores
DROP POLICY IF EXISTS "Permitir insercion de tokens" ON public.tokens_recuperacion;
DROP POLICY IF EXISTS "Permitir lectura de tokens" ON public.tokens_recuperacion;
DROP POLICY IF EXISTS "Permitir actualizacion de tokens" ON public.tokens_recuperacion;
DROP POLICY IF EXISTS "Padre puede consultar auditoria de tokens" ON public.tokens_recuperacion;
DROP POLICY IF EXISTS "Solo Padre puede consultar auditoria de tokens" ON public.tokens_recuperacion;

-- 3. Denegar por defecto SELECT a usuarios anónimos y secretaría.
-- Solo el rol 'padre' (administrador) puede consultar el registro con fines de auditoría.
CREATE POLICY "Solo Padre puede consultar auditoria de tokens" 
ON public.tokens_recuperacion FOR SELECT 
USING (public.get_user_role() = 'padre');

-- 4. Impedir INSERT, UPDATE y DELETE directo a clientes.
-- No se crean políticas de INSERT, UPDATE ni DELETE para 'anon' ni 'authenticated'.
-- Por estándar de PostgreSQL RLS (deny-by-default), nadie puede escribir directamente en la tabla.

-- 5. Funciones RPC seguras con SECURITY DEFINER para validación y consumo
-- Estas funciones ejecutan la lógica internamente con permisos controlados sin exponer la tabla.

CREATE OR REPLACE FUNCTION public.verificar_token_recuperacion(p_token_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.tokens_recuperacion
    WHERE token_hash = p_token_hash
      AND usado = FALSE
      AND expira_en > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.consumir_token_recuperacion(p_token_hash TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE public.tokens_recuperacion
  SET usado = TRUE
  WHERE token_hash = p_token_hash
    AND usado = FALSE
    AND expira_en > NOW();
    
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN (v_updated > 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
