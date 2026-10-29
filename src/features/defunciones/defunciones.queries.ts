import { supabase } from '@/lib/supabase';
import { Defuncion } from './defunciones.types';
import { DefuncionFormData } from './defunciones.schema';
import { esAnioCuatroDigitos } from '@/utils/validaciones';

export async function getDefunciones(page = 1, limit = 20, filtros?: Record<string, any>) {
  let query = supabase
    .from('sacramentos_defuncion')
    .select('*', { count: 'exact' });

  // Aplicar filtros
  if (filtros?.busqueda) {
    const term = filtros.busqueda.trim();
    query = query.or(`nombre_difunto.ilike.%${term}%,apellidos_difunto.ilike.%${term}%`);
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
        .gte('fecha_sepultura', `${anio}-01-01`)
        .lte('fecha_sepultura', `${anio}-12-31`);
    }
  }

  // Paginación
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  query = query.order('libro', { ascending: true }).order('folio', { ascending: true }).order('numero', { ascending: true });
  query = query.range(from, to);

  const { data, error, count } = await query;
  
  if (error) throw error;
  
  const mappedData = (data || []).map(item => {
    const { fecha_sepultura, ...rest } = item;
    return {
      ...rest,
      fecha_defuncion: fecha_sepultura
    } as unknown as Defuncion;
  });
  
  return {
    data: mappedData,
    count: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0
  };
}

export async function getDefuncionById(id: string) {
  const { data, error } = await supabase
    .from('sacramentos_defuncion')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (data) {
    const { fecha_sepultura, ...rest } = data;
    return {
      ...rest,
      fecha_defuncion: fecha_sepultura
    } as unknown as Defuncion;
  }
  return null as any;
}

export async function createDefuncion(defuncion: DefuncionFormData) {
  const { fecha_defuncion, ...rest } = defuncion;
  
  // Sanitizar campos: convertir strings vacíos a null
  const sanitized: Record<string, any> = { ...rest };
  const nullableFields = ['lugar_origen', 'estado_civil', 'padre_difunto', 'madre_difunto', 'causa_muerte', 'da_fe', 'libro', 'edad'];
  for (const field of nullableFields) {
    if (sanitized[field] === '' || sanitized[field] === undefined) {
      sanitized[field] = null;
    }
  }
  
  const dbData = {
    ...sanitized,
    fecha_sepultura: fecha_defuncion || null
  };
  const { data, error } = await supabase
    .from('sacramentos_defuncion')
    .insert([{...dbData, estado: 'activo'}])
    .select()
    .single();

  if (error) throw error;
  if (data) {
    const { fecha_sepultura, ...restOut } = data;
    return {
      ...restOut,
      fecha_defuncion: fecha_sepultura
    } as unknown as Defuncion;
  }
  return data as unknown as Defuncion;
}

export async function updateDefuncion(id: string, defuncion: Partial<DefuncionFormData>) {
  const cleanDefuncion = { ...defuncion };
  const dbData: Record<string, any> = { ...cleanDefuncion };
  if ('fecha_defuncion' in cleanDefuncion) {
    dbData.fecha_sepultura = cleanDefuncion.fecha_defuncion || null;
    delete dbData.fecha_defuncion;
  }

  // Sanitizar campos: convertir strings vacíos a null
  const nullableFields = ['lugar_origen', 'estado_civil', 'padre_difunto', 'madre_difunto', 'causa_muerte', 'da_fe', 'libro', 'edad'];
  for (const field of nullableFields) {
    if (field in dbData && (dbData[field] === '' || dbData[field] === undefined)) {
      dbData[field] = null;
    }
  }

  const { data, error } = await supabase
    .from('sacramentos_defuncion')
    .update({ ...dbData, actualizado_en: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (data) {
    const { fecha_sepultura, ...restOut } = data;
    return {
      ...restOut,
      fecha_defuncion: fecha_sepultura
    } as unknown as Defuncion;
  }
  return data as unknown as Defuncion;
}

export async function anularDefuncion(id: string, motivo: string) {
  const { data, error } = await supabase
    .from('sacramentos_defuncion')
    .update({ 
      estado: 'anulado', 
      motivo_anulacion: motivo,
      actualizado_en: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (data) {
    const { fecha_sepultura, ...restOut } = data;
    return {
      ...restOut,
      fecha_defuncion: fecha_sepultura
    } as unknown as Defuncion;
  }
  return data as unknown as Defuncion;
}

export async function getNextFolioNumeroDefuncion() {
  const { data, error } = await supabase.rpc('obtener_siguiente_folio_numero', { p_tabla: 'sacramentos_defuncion' });
  if (error) throw error;
  return data as { folio: number; numero: number };
}
