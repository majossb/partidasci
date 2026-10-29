-- supabase/seed/usuarios_iniciales.sql
-- NOTA: Este script no puede crear usuarios de Auth (auth.users) de forma 100% directa sin el API de Supabase, 
-- pero provee una referencia de los roles que deben existir.

-- Instrucciones para crear usuarios:
-- 1. Ve a Authentication -> Users en tu panel de Supabase y crea los usuarios:
--    - padre@parroquia.com
--    - secretaria@parroquia.com
-- 2. Corre el siguiente bloque en el SQL Editor para asignarles los roles manualmente, 
--    reemplazando los emails por los correctos.

/*
UPDATE auth.users 
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "padre"}'::jsonb
WHERE email = 'padre@parroquia.com';

UPDATE auth.users 
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "secretaria"}'::jsonb
WHERE email = 'secretaria@parroquia.com';
*/
