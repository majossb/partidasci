-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS public.configuracion_parroquia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave TEXT UNIQUE NOT NULL,
  valor TEXT,
  valor_archivo TEXT, -- URL de Supabase Storage
  actualizado_por UUID REFERENCES auth.users(id),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas RLS
ALTER TABLE public.configuracion_parroquia ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer la configuración
CREATE POLICY "Lectura de configuración pública"
  ON public.configuracion_parroquia FOR SELECT
  USING (true);

-- Solo el padre puede modificar
CREATE POLICY "Padre puede modificar configuración"
  ON public.configuracion_parroquia FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = id AND raw_user_meta_data->>'rol' = 'padre'
    )
  );

-- Insertar valores por defecto
INSERT INTO public.configuracion_parroquia (clave, valor)
VALUES ('sesion_timeout_minutos', '20')
ON CONFLICT (clave) DO NOTHING;
