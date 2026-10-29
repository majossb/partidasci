-- 014_indices_unicos_sacramentos.sql
-- Este script reemplaza las restricciones UNIQUE globales (folio, numero) por índices únicos parciales.
-- Esto permite:
-- 1. Tener el mismo folio y número en LIBROS DIFERENTES (ej. Libro 1 Folio 10 Núm 5 y Libro 2 Folio 10 Núm 5).
-- 2. Anular una partida vieja y registrar una nueva con el mismo libro, folio y número (ya que el índice excluye las partidas 'anulado').
-- 3. Evitar partidas duplicadas activas para un mismo (libro, folio, numero).

-- ==========================================
-- 1. BAUTISMOS
-- ==========================================
ALTER TABLE public.sacramentos_bautismo DROP CONSTRAINT IF EXISTS sacramentos_bautismo_folio_numero_key;
DROP INDEX IF EXISTS idx_bautismo_libro_folio_numero_activo;
CREATE UNIQUE INDEX idx_bautismo_libro_folio_numero_activo 
ON public.sacramentos_bautismo (libro, folio, numero) 
WHERE (estado != 'anulado');

-- ==========================================
-- 2. CONFIRMACIONES
-- ==========================================
ALTER TABLE public.sacramentos_confirmacion DROP CONSTRAINT IF EXISTS sacramentos_confirmacion_folio_numero_key;
DROP INDEX IF EXISTS idx_confirmacion_libro_folio_numero_activo;
CREATE UNIQUE INDEX idx_confirmacion_libro_folio_numero_activo 
ON public.sacramentos_confirmacion (libro, folio, numero) 
WHERE (estado != 'anulado');

-- ==========================================
-- 3. MATRIMONIOS
-- ==========================================
ALTER TABLE public.sacramentos_matrimonio DROP CONSTRAINT IF EXISTS sacramentos_matrimonio_folio_numero_key;
DROP INDEX IF EXISTS idx_matrimonio_libro_folio_numero_activo;
CREATE UNIQUE INDEX idx_matrimonio_libro_folio_numero_activo 
ON public.sacramentos_matrimonio (libro, folio, numero) 
WHERE (estado != 'anulado');

-- ==========================================
-- 4. DEFUNCIONES
-- ==========================================
ALTER TABLE public.sacramentos_defuncion DROP CONSTRAINT IF EXISTS sacramentos_defuncion_folio_numero_key;
DROP INDEX IF EXISTS idx_defuncion_libro_folio_numero_activo;
CREATE UNIQUE INDEX idx_defuncion_libro_folio_numero_activo 
ON public.sacramentos_defuncion (libro, folio, numero) 
WHERE (estado != 'anulado');
