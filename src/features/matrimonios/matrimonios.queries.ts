import { supabase } from '@/lib/supabase';
import { Matrimonio } from './matrimonios.types';
import { MatrimonioFormData } from './matrimonios.schema';
import { esAnioCuatroDigitos } from '@/utils/validaciones';

export async function getMatrimonios(page = 1, limit = 20, filtros?: Record<string, any>) {
  let query = supabase
    .from('sacramentos_matrimonio')
    .select('*', { count: 'exact' });

  // Aplicar filtros
  if (filtros?.busqueda) {
    const term = filtros.busqueda.trim();
    query = query.or(`nombre_esposo.ilike.%${term}%,apellidos_esposo.ilike.%${term}%,nombre_esposa.ilike.%${term}%,apellidos_esposa.ilike.%${term}%`);
  }
  if (filtros?.estado) {
    query = query.eq('estado', filtros.estado);
  } else {
    query = query.neq('estado', 'anulado');
  }

  if (filtros?.libro && filtros.libro.trim() !== '') {
    query = query.eq('libro', filtros.libro.trim());
  }
  if (filtros?.folio) {
    const folioNum = parseInt(filtros.folio, 10);
    if (!isNaN(folioNum) && folioNum > 0) {
      query = query.eq('folio', folioNum);
    }
  }
  if (filtros?.numero) {
    const numeroNum = parseInt(filtros.numero, 10);
    if (!isNaN(numeroNum) && numeroNum > 0) {
      query = query.eq('numero', numeroNum);
    }
  }
  if (filtros?.anio) {
    const anioStr = filtros.anio.toString().trim();
    if (esAnioCuatroDigitos(anioStr)) {
      const anio = parseInt(anioStr, 10);
      query = query
        .gte('fecha_matrimonio', `${anio}-01-01`)
        .lte('fecha_matrimonio', `${anio}-12-31`);
    }
  }

  // Paginación
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  query = query.order('libro', { ascending: true }).order('folio', { ascending: true }).order('numero', { ascending: true });
  query = query.range(from, to);

  const { data, error, count } = await query;
  
  if (error) throw error;
  
  return {
    data: data as Matrimonio[],
    count: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0
  };
}

export async function getMatrimonioById(id: string) {
  const { data, error } = await supabase
    .from('sacramentos_matrimonio')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Matrimonio;
}

export async function createMatrimonio(matrimonio: MatrimonioFormData) {
  const cleanMatrimonio = {
    ...matrimonio,
    fecha_matrimonio: matrimonio.fecha_matrimonio || null,
    fecha_bautismo_esposo: matrimonio.fecha_bautismo_esposo || null,
    fecha_bautismo_esposa: matrimonio.fecha_bautismo_esposa || null,
  };
  const { data, error } = await supabase
    .from('sacramentos_matrimonio')
    .insert([{...cleanMatrimonio, estado: 'activo'}])
    .select()
    .single();

  if (error) throw error;
  return data as Matrimonio;
}

export async function updateMatrimonio(id: string, matrimonio: Partial<MatrimonioFormData>) {
  const cleanMatrimonio = { ...matrimonio };
  if ('fecha_matrimonio' in cleanMatrimonio) {
    cleanMatrimonio.fecha_matrimonio = cleanMatrimonio.fecha_matrimonio || null;
  }
  if ('fecha_bautismo_esposo' in cleanMatrimonio) {
    cleanMatrimonio.fecha_bautismo_esposo = cleanMatrimonio.fecha_bautismo_esposo || null;
  }
  if ('fecha_bautismo_esposa' in cleanMatrimonio) {
    cleanMatrimonio.fecha_bautismo_esposa = cleanMatrimonio.fecha_bautismo_esposa || null;
  }

  const { data, error } = await supabase
    .from('sacramentos_matrimonio')
    .update({ ...cleanMatrimonio, actualizado_en: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Matrimonio;
}

export async function anularMatrimonio(id: string, motivo: string) {
  const { data, error } = await supabase
    .from('sacramentos_matrimonio')
    .update({ 
      estado: 'anulado', 
      motivo_anulacion: motivo,
      actualizado_en: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Matrimonio;
}

export async function getNextFolioNumeroMatrimonio() {
  const { data, error } = await supabase.rpc('obtener_siguiente_folio_numero', { p_tabla: 'sacramentos_matrimonio' });
  if (error) throw error;
  return data as { folio: number; numero: number };
}
