-- Crear el bucket de storage para firmas (marcado como público para que el frontend pueda leer las imágenes al exportar a PDF/Word)
INSERT INTO storage.buckets (id, name, public)
VALUES ('firmas', 'firmas', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de RLS para los objetos en storage
-- Permitir lectura pública (o a usuarios autenticados) de la firma
CREATE POLICY "Lectura publica de firmas"
ON storage.objects FOR SELECT
USING (bucket_id = 'firmas');

-- Permitir al padre insertar
CREATE POLICY "Padre puede subir firma"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'firmas' AND 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id AND raw_user_meta_data->>'rol' = 'padre'
  )
);

-- Permitir al padre actualizar
CREATE POLICY "Padre puede actualizar firma"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'firmas' AND 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id AND raw_user_meta_data->>'rol' = 'padre'
  )
);

-- Permitir al padre eliminar
CREATE POLICY "Padre puede eliminar firma"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'firmas' AND 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id AND raw_user_meta_data->>'rol' = 'padre'
  )
);
