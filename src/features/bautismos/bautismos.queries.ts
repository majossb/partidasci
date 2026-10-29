import { supabase } from '@/lib/supabase';
import { Bautismo } from './bautismos.types';
import { BautismoFormData } from './bautismos.schema';
import { esAnioCuatroDigitos } from '@/utils/validaciones';

export async function getBautismos(page = 1, limit = 20, filtros?: Record<string, any>) {
  let query = supabase
    .from('sacramentos_bautismo')
    .select('*', { count: 'exact' });

  // Aplicar filtros
  if (filtros?.busqueda) {
    const term = filtros.busqueda.trim();
    query = query.or(`nombre_bautizado.ilike.%${term}%,apellidos_bautizado.ilike.%${term}%,nombre_padre.ilike.%${term}%,nombre_madre.ilike.%${term}%`);
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
        .gte('fecha_bautismo', `${anio}-01-01`)
        .lte('fecha_bautismo', `${anio}-12-31`);
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
    data: data as Bautismo[],
    count: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0
  };
}

export async function getBautismoById(id: string) {
  const { data, error } = await supabase
    .from('sacramentos_bautismo')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Bautismo;
}

export async function createBautismo(bautismo: BautismoFormData) {
  const cleanBautismo = {
    ...bautismo,
    fecha_bautismo: bautismo.fecha_bautismo || null,
    fecha_nacimiento: bautismo.fecha_nacimiento || null,
  };
  const { data, error } = await supabase
    .from('sacramentos_bautismo')
    .insert([{...cleanBautismo, estado: 'activo'}])
    .select()
    .single();

  if (error) throw error;
  return data as Bautismo;
}

export async function updateBautismo(id: string, bautismo: Partial<BautismoFormData>) {
  const cleanBautismo = { ...bautismo };
  if ('fecha_bautismo' in cleanBautismo) {
    cleanBautismo.fecha_bautismo = cleanBautismo.fecha_bautismo || null;
  }
  if ('fecha_nacimiento' in cleanBautismo) {
    cleanBautismo.fecha_nacimiento = cleanBautismo.fecha_nacimiento || null;
  }

  const { data, error } = await supabase
    .from('sacramentos_bautismo')
    .update({ ...cleanBautismo, actualizado_en: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Bautismo;
}

export async function anularBautismo(id: string, motivo: string) {
  const { data, error } = await supabase
    .from('sacramentos_bautismo')
    .update({ 
      estado: 'anulado', 
      motivo_anulacion: motivo,
      actualizado_en: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Bautismo;
}

export async function getNextFolioNumero() {
  const { data, error } = await supabase.rpc('obtener_siguiente_folio_numero', { p_tabla: 'sacramentos_bautismo' });
  if (error) throw error;
  return data as { folio: number; numero: number };
}
