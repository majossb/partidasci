import { supabase } from '@/lib/supabase';
import { Confirmacion } from './confirmaciones.types';
import { ConfirmacionFormData } from './confirmaciones.schema';
import { esAnioCuatroDigitos } from '@/utils/validaciones';

export async function getConfirmaciones(page = 1, limit = 20, filtros?: Record<string, any>) {
  let query = supabase
    .from('sacramentos_confirmacion')
    .select('*', { count: 'exact' });

  // Aplicar filtros
  if (filtros?.busqueda) {
    const term = filtros.busqueda.trim();
    query = query.or(`nombre_confirmado.ilike.%${term}%,apellidos_confirmado.ilike.%${term}%,nombre_padre.ilike.%${term}%,nombre_madre.ilike.%${term}%`);
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
      query = query.or(`and(fecha_confirmacion.gte.${anio}-01-01,fecha_confirmacion.lte.${anio}-12-31),anio_confirmacion.eq.${anio}`);
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
    data: data as Confirmacion[],
    count: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0
  };
}

export async function getConfirmacionById(id: string) {
  const { data, error } = await supabase
    .from('sacramentos_confirmacion')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Confirmacion;
}

export async function createConfirmacion(confirmacion: ConfirmacionFormData) {
  const cleanConfirmacion = {
    ...confirmacion,
    fecha_confirmacion: confirmacion.fecha_confirmacion || null,
    fecha_nacimiento: confirmacion.fecha_nacimiento || null,
    anio_confirmacion: confirmacion.anio_confirmacion || null,
    ministro: confirmacion.ministro || null,
    obispo: confirmacion.obispo || null,
    lugar_confirmacion: confirmacion.lugar_confirmacion || null,
    lugar_nacimiento: confirmacion.lugar_nacimiento || null,
    numero_bautismo: confirmacion.numero_bautismo || null,
    da_fe: confirmacion.da_fe || null,
  };
  const { data, error } = await supabase
    .from('sacramentos_confirmacion')
    .insert([{...cleanConfirmacion, estado: 'activo'}])
    .select()
    .single();

  if (error) throw error;
  return data as Confirmacion;
}

export async function updateConfirmacion(id: string, confirmacion: Partial<ConfirmacionFormData>) {
  const cleanConfirmacion = { ...confirmacion };
  if ('fecha_confirmacion' in cleanConfirmacion) {
    cleanConfirmacion.fecha_confirmacion = cleanConfirmacion.fecha_confirmacion || null;
  }
  if ('fecha_nacimiento' in cleanConfirmacion) {
    cleanConfirmacion.fecha_nacimiento = cleanConfirmacion.fecha_nacimiento || null;
  }
  if ('anio_confirmacion' in cleanConfirmacion) {
    cleanConfirmacion.anio_confirmacion = cleanConfirmacion.anio_confirmacion || null;
  }
  if ('ministro' in cleanConfirmacion) {
    cleanConfirmacion.ministro = cleanConfirmacion.ministro || null;
  }
  if ('obispo' in cleanConfirmacion) {
    cleanConfirmacion.obispo = cleanConfirmacion.obispo || null;
  }
  if ('lugar_confirmacion' in cleanConfirmacion) {
    cleanConfirmacion.lugar_confirmacion = cleanConfirmacion.lugar_confirmacion || null;
  }
  if ('lugar_nacimiento' in cleanConfirmacion) {
    cleanConfirmacion.lugar_nacimiento = cleanConfirmacion.lugar_nacimiento || null;
  }
  if ('numero_bautismo' in cleanConfirmacion) {
    cleanConfirmacion.numero_bautismo = cleanConfirmacion.numero_bautismo || null;
  }
  if ('da_fe' in cleanConfirmacion) {
    cleanConfirmacion.da_fe = cleanConfirmacion.da_fe || null;
  }

  const { data, error } = await supabase
    .from('sacramentos_confirmacion')
    .update({ ...cleanConfirmacion, actualizado_en: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Confirmacion;
}

export async function anularConfirmacion(id: string, motivo: string) {
  const { data, error } = await supabase
    .from('sacramentos_confirmacion')
    .update({ 
      estado: 'anulado', 
      motivo_anulacion: motivo,
      actualizado_en: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Confirmacion;
}

export async function getNextFolioNumeroConfirmacion() {
  const { data, error } = await supabase.rpc('obtener_siguiente_folio_numero', { p_tabla: 'sacramentos_confirmacion' });
  if (error) throw error;
  return data as { folio: number; numero: number };
}
