-- 025_bucket_firmas_privado.sql
-- Hace privado el bucket de firmas. Las URLs se generarán mediante signed URLs.
UPDATE storage.buckets SET public = false WHERE id = 'firmas';

-- Elimina la política de lectura pública anterior
DROP POLICY IF EXISTS "Lectura publica de firmas" ON storage.objects;

-- Nueva política: solo usuarios autenticados con rol válido pueden leer
CREATE POLICY "Solo usuarios autenticados pueden leer firmas"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'firmas' AND
  public.get_user_role() IN ('secretaria', 'padre')
);
