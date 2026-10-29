-- 005_funciones_utilidad.sql

-- Función para obtener el siguiente folio y número disponible (Autonumeración)
CREATE OR REPLACE FUNCTION public.obtener_siguiente_folio_numero(p_tabla TEXT)
RETURNS json AS $$
DECLARE
    v_ultimo_folio INTEGER;
    v_ultimo_numero INTEGER;
    v_resultado json;
BEGIN
    EXECUTE format('SELECT folio, numero FROM public.%I ORDER BY folio DESC, numero DESC LIMIT 1', p_tabla)
    INTO v_ultimo_folio, v_ultimo_numero;

    IF v_ultimo_folio IS NULL THEN
        -- Valores iniciales si la tabla está vacía
        v_ultimo_folio := 1;
        v_ultimo_numero := 1;
    ELSE
        -- Incrementar lógicamente
        v_ultimo_numero := v_ultimo_numero + 1;
        -- Regla de negocio: Por ejemplo si cada folio tiene máximo 50 partidas, 
        -- aquí se podría incrementar el folio y reiniciar el número.
        -- Dejaremos incremento infinito del número por defecto.
    END IF;

    v_resultado := json_build_object('folio', v_ultimo_folio, 'numero', v_ultimo_numero);
    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
