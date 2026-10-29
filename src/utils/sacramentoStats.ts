import { supabase } from '@/lib/supabase';

export interface SacramentoStats {
  total: number;
  activos: number;
  anulados: number;
  ultimoRef: string;
  esteMes: number;
}

export async function fetchSacramentoStats(tableName: string, fechaField: string): Promise<SacramentoStats> {
  try {
    const ahora = new Date();
    const anioActual = ahora.getFullYear();
    const mesActual = String(ahora.getMonth() + 1).padStart(2, '0');
    const inicioMes = `${anioActual}-${mesActual}-01`;

    const [resTotal, resActivos, resAnulados, resUltimo, resEsteMes] = await Promise.all([
      supabase.from(tableName).select('id', { count: 'exact', head: true }),
      supabase.from(tableName).select('id', { count: 'exact', head: true }).eq('estado', 'activo'),
      supabase.from(tableName).select('id', { count: 'exact', head: true }).eq('estado', 'anulado'),
      supabase.from(tableName).select('libro, folio, numero').order('folio', { ascending: false }).order('numero', { ascending: false }).limit(1),
      supabase.from(tableName).select('id', { count: 'exact', head: true }).gte(fechaField, inicioMes),
    ]);

    const total = resTotal.count || 0;
    const activos = resActivos.count || 0;
    const anulados = resAnulados.count || 0;
    const esteMes = resEsteMes.count || 0;
    const ultimo = resUltimo.data?.[0];
    const ultimoRef = ultimo ? (ultimo.libro ? `L:${ultimo.libro} F:${ultimo.folio}` : `F:${ultimo.folio}`) : 'N/A';

    return { total, activos, anulados, ultimoRef, esteMes };
  } catch (err) {
    console.error('Error fetching sacramento stats:', err);
    return { total: 0, activos: 0, anulados: 0, ultimoRef: 'N/A', esteMes: 0 };
  }
}

export function formatTiempoRelativo(fechaStr: string | null | undefined): string {
  if (!fechaStr) return '';
  try {
    const dateParts = fechaStr.slice(0, 10).split('-');
    if (dateParts.length !== 3) return '';
    const fecha = new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10));
    if (isNaN(fecha.getTime())) return '';
    
    const ahora = new Date();
    let aos = ahora.getFullYear() - fecha.getFullYear();
    const m = ahora.getMonth() - fecha.getMonth();
    if (m < 0 || (m === 0 && ahora.getDate() < fecha.getDate())) {
      aos--;
    }
    
    if (aos < 1) return 'este año';
    return `hace ${aos} año${aos > 1 ? 's' : ''}`;
  } catch {
    return '';
  }
}
