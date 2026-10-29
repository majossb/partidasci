-- 004_indices_busqueda.sql
-- Para búsqueda full-text y consultas rápidas

-- Bautismos
CREATE INDEX idx_bautismo_nombre ON public.sacramentos_bautismo 
  USING gin(to_tsvector('spanish', nombre_bautizado || ' ' || apellidos_bautizado));
CREATE INDEX idx_bautismo_fecha ON public.sacramentos_bautismo(fecha_bautismo);
CREATE INDEX idx_bautismo_folio ON public.sacramentos_bautismo(folio, numero);

-- Confirmaciones
CREATE INDEX idx_confirmacion_nombre ON public.sacramentos_confirmacion 
  USING gin(to_tsvector('spanish', nombre_confirmado || ' ' || apellidos_confirmado));
CREATE INDEX idx_confirmacion_fecha ON public.sacramentos_confirmacion(fecha_confirmacion);
CREATE INDEX idx_confirmacion_folio ON public.sacramentos_confirmacion(folio, numero);

-- Matrimonios
CREATE INDEX idx_matrimonio_esposos ON public.sacramentos_matrimonio 
  USING gin(to_tsvector('spanish', nombre_esposo || ' ' || apellidos_esposo || ' ' || nombre_esposa || ' ' || apellidos_esposa));
CREATE INDEX idx_matrimonio_fecha ON public.sacramentos_matrimonio(fecha_matrimonio);
CREATE INDEX idx_matrimonio_folio ON public.sacramentos_matrimonio(folio, numero);

-- Defunciones
CREATE INDEX idx_defuncion_nombre ON public.sacramentos_defuncion 
  USING gin(to_tsvector('spanish', nombre_difunto || ' ' || apellidos_difunto));
CREATE INDEX idx_defuncion_fecha ON public.sacramentos_defuncion(fecha_sepultura);
CREATE INDEX idx_defuncion_folio ON public.sacramentos_defuncion(folio, numero);

-- Auditoria
CREATE INDEX idx_audit_log_fecha ON public.audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_registro ON public.audit_log(registro_id);
