import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface SearchResult {
  id: string;
  libro?: string;
  folio: number;
  numero: number;
  tipo: 'bautismo' | 'confirmacion' | 'matrimonio' | 'defuncion';
  titulo: string;
  fecha: string;
  estado: string;
}

export function useBuscadorGlobal(searchTerm: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 3) {
      setResults([]);
      return;
    }

    const search = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const term = `%${searchTerm}%`;

        const [b, c, m, d] = await Promise.all([
          supabase.from('sacramentos_bautismo')
            .select('id, libro, folio, numero, nombre_bautizado, apellidos_bautizado, fecha_bautismo, estado')
            .or(`nombre_bautizado.ilike.${term},apellidos_bautizado.ilike.${term}`)
            .limit(5),
          supabase.from('sacramentos_confirmacion')
            .select('id, libro, folio, numero, nombre_confirmado, apellidos_confirmado, fecha_confirmacion, estado')
            .or(`nombre_confirmado.ilike.${term},apellidos_confirmado.ilike.${term}`)
            .limit(5),
          supabase.from('sacramentos_matrimonio')
            .select('id, libro, folio, numero, nombre_esposo, apellidos_esposo, nombre_esposa, apellidos_esposa, fecha_matrimonio, estado')
            .or(`nombre_esposo.ilike.${term},apellidos_esposo.ilike.${term},nombre_esposa.ilike.${term},apellidos_esposa.ilike.${term}`)
            .limit(5),
          supabase.from('sacramentos_defuncion')
            .select('id, libro, folio, numero, nombre_difunto, apellidos_difunto, fecha_sepultura, estado')
            .or(`nombre_difunto.ilike.${term},apellidos_difunto.ilike.${term}`)
            .limit(5),
        ]);

        const merged: SearchResult[] = [];

        if (b.data) {
          merged.push(...b.data.map(x => ({
            id: x.id,
            libro: x.libro,
            folio: x.folio,
            numero: x.numero,
            tipo: 'bautismo' as const,
            titulo: `${x.nombre_bautizado} ${x.apellidos_bautizado}`,
            fecha: x.fecha_bautismo,
            estado: x.estado
          })));
        }
        
        if (c.data) {
          merged.push(...c.data.map(x => ({
            id: x.id,
            libro: x.libro,
            folio: x.folio,
            numero: x.numero,
            tipo: 'confirmacion' as const,
            titulo: `${x.nombre_confirmado} ${x.apellidos_confirmado}`,
            fecha: x.fecha_confirmacion,
            estado: x.estado
          })));
        }

        if (m.data) {
          merged.push(...m.data.map(x => ({
            id: x.id,
            libro: x.libro,
            folio: x.folio,
            numero: x.numero,
            tipo: 'matrimonio' as const,
            titulo: `${x.nombre_esposo} ${x.apellidos_esposo} y ${x.nombre_esposa} ${x.apellidos_esposa}`,
            fecha: x.fecha_matrimonio,
            estado: x.estado
          })));
        }

        if (d.data) {
          merged.push(...d.data.map(x => ({
            id: x.id,
            libro: x.libro,
            folio: x.folio,
            numero: x.numero,
            tipo: 'defuncion' as const,
            titulo: `${x.nombre_difunto} ${x.apellidos_difunto}`,
            fecha: x.fecha_sepultura,
            estado: x.estado
          })));
        }

        // Ordenar por fecha más reciente
        merged.sort((x, y) => new Date(y.fecha).getTime() - new Date(x.fecha).getTime());

        setResults(merged);

      } catch (err: any) {
        console.error('Error buscando', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [searchTerm]);

  return { results, loading, error };
}
