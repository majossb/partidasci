-- 015_fix_autonumeracion_excluir_anulados.sql
-- La función obtener_siguiente_folio_numero debe ignorar las partidas anuladas
-- para que la autonumeración sea consistente con los registros vigentes.

CREATE OR REPLACE FUNCTION public.obtener_siguiente_folio_numero(p_tabla TEXT)
RETURNS json AS $$
DECLARE
    v_ultimo_folio INTEGER;
    v_ultimo_numero INTEGER;
    v_resultado json;
BEGIN
    EXECUTE format(
      'SELECT folio, numero FROM public.%I WHERE estado != ''anulado'' ORDER BY folio DESC, numero DESC LIMIT 1',
      p_tabla
    )
    INTO v_ultimo_folio, v_ultimo_numero;

    IF v_ultimo_folio IS NULL THEN
        v_ultimo_folio := 1;
        v_ultimo_numero := 1;
    ELSE
        v_ultimo_numero := v_ultimo_numero + 1;
    END IF;

    v_resultado := json_build_object('folio', v_ultimo_folio, 'numero', v_ultimo_numero);
    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
