CREATE TABLE IF NOT EXISTS public.historial_expediciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_sacramento TEXT NOT NULL,
  partida_id UUID NOT NULL,
  folio INTEGER NOT NULL,
  numero INTEGER NOT NULL,
  nombre_persona TEXT NOT NULL,
  formato TEXT NOT NULL, -- 'PDF', 'WORD', 'IMPRESION'
  expedido_por UUID REFERENCES auth.users(id),
  expedido_por_email TEXT,
  expedido_en TIMESTAMPTZ DEFAULT NOW(),
  firma_incluida BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.historial_expediciones ENABLE ROW LEVEL SECURITY;

-- Todos los autenticados pueden insertar
CREATE POLICY "Usuarios pueden registrar expediciones"
  ON public.historial_expediciones FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Todos los autenticados pueden leer el historial de las partidas
CREATE POLICY "Usuarios pueden leer historial"
  ON public.historial_expediciones FOR SELECT
  USING (auth.uid() IS NOT NULL);
