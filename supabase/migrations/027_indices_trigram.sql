-- 027_indices_trigram.sql
-- Habilita pg_trgm y crea índices GIN para acelerar las búsquedas ilike de wildcards (%nombre%)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_bautismo_nombre_trgm
  ON public.sacramentos_bautismo
  USING gin(nombre_bautizado gin_trgm_ops, apellidos_bautizado gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_confirmacion_nombre_trgm
  ON public.sacramentos_confirmacion
  USING gin(nombre_confirmado gin_trgm_ops, apellidos_confirmado gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_matrimonio_esposos_trgm
  ON public.sacramentos_matrimonio
  USING gin(nombre_esposo gin_trgm_ops, apellidos_esposo gin_trgm_ops,
            nombre_esposa gin_trgm_ops, apellidos_esposa gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_defuncion_nombre_trgm
  ON public.sacramentos_defuncion
  USING gin(nombre_difunto gin_trgm_ops, apellidos_difunto gin_trgm_ops);
