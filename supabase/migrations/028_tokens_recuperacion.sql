-- Migration 028: Tabla para Tokens de Recuperación de Contraseña con Hashes y Expiración

CREATE TABLE IF NOT EXISTS public.tokens_recuperacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expira_en TIMESTAMPTZ NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_tokens_recuperacion_hash ON public.tokens_recuperacion(token_hash);
CREATE INDEX IF NOT EXISTS idx_tokens_recuperacion_email ON public.tokens_recuperacion(email);

-- Habilitar RLS
ALTER TABLE public.tokens_recuperacion ENABLE ROW LEVEL SECURITY;

-- Políticas RLS estrictas: solo el rol 'padre' puede consultar registros para auditoría
DROP POLICY IF EXISTS "Permitir insercion de tokens" ON public.tokens_recuperacion;
DROP POLICY IF EXISTS "Permitir lectura de tokens" ON public.tokens_recuperacion;
DROP POLICY IF EXISTS "Permitir actualizacion de tokens" ON public.tokens_recuperacion;
DROP POLICY IF EXISTS "Solo Padre puede consultar auditoria de tokens" ON public.tokens_recuperacion;

CREATE POLICY "Solo Padre puede consultar auditoria de tokens"
ON public.tokens_recuperacion FOR SELECT
USING (public.get_user_role() = 'padre');

-- Las inserciones, actualizaciones y eliminaciones están bloqueadas por defecto (deny-by-default)
-- y se gestionan exclusivamente mediante funciones RPC SECURITY DEFINER (Migration 030).
