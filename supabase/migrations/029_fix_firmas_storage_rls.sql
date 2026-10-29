-- Migration 029: Seguridad y RLS estricto para el bucket privado de firmas

-- 1. Asegurar bucket privado
INSERT INTO storage.buckets (id, name, public)
VALUES ('firmas', 'firmas', false)
ON CONFLICT (id) DO UPDATE SET public = false;

UPDATE storage.buckets SET public = false WHERE id = 'firmas';

-- 2. Limpiar políticas anteriores
DROP POLICY IF EXISTS "Padre puede subir firma" ON storage.objects;
DROP POLICY IF EXISTS "Padre puede actualizar firma" ON storage.objects;
DROP POLICY IF EXISTS "Padre puede eliminar firma" ON storage.objects;
DROP POLICY IF EXISTS "Lectura publica de firmas" ON storage.objects;
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden leer firmas" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura de firmas" ON storage.objects;
DROP POLICY IF EXISTS "Permitir subida de firmas" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualizacion de firmas" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminacion de firmas" ON storage.objects;
DROP POLICY IF EXISTS "Lectura autenticados firmas" ON storage.objects;
DROP POLICY IF EXISTS "Escritura padre firmas" ON storage.objects;
DROP POLICY IF EXISTS "Actualizacion padre firmas" ON storage.objects;
DROP POLICY IF EXISTS "Eliminacion padre firmas" ON storage.objects;

-- 3. Lectura: cualquier usuario autenticado (para visualizar en certificados)
CREATE POLICY "Lectura autenticados firmas"
ON storage.objects FOR SELECT
USING (bucket_id = 'firmas' AND auth.role() = 'authenticated');

-- 4. Escritura, actualización y eliminación: únicamente el rol 'padre'
CREATE POLICY "Escritura padre firmas"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'firmas' AND public.get_user_role() = 'padre');

CREATE POLICY "Actualizacion padre firmas"
ON storage.objects FOR UPDATE
USING (bucket_id = 'firmas' AND public.get_user_role() = 'padre');

CREATE POLICY "Eliminacion padre firmas"
ON storage.objects FOR DELETE
USING (bucket_id = 'firmas' AND public.get_user_role() = 'padre');
