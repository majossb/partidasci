import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface AuditLog {
  id: string;
  tabla: string;
  operacion: 'INSERT' | 'UPDATE' | 'DELETE';
  registro_id: string;
  datos_anteriores: any;
  datos_nuevos: any;
  usuario_email: string;
  usuario_rol: string;
  ip_address: string;
  timestamp: string;
}

interface FiltrosAuditoria {
  fechaInicio: string;
  fechaFin: string;
  usuario: string;
  operacion: string;
  tabla: string;
}

export function useAuditoria(filtros: FiltrosAuditoria) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('audit_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (filtros.fechaInicio) {
        query = query.gte('timestamp', filtros.fechaInicio);
      }
      if (filtros.fechaFin) {
        query = query.lte('timestamp', `${filtros.fechaFin}T23:59:59.999Z`);
      }
      if (filtros.usuario) {
        query = query.ilike('usuario_email', `%${filtros.usuario}%`);
      }
      if (filtros.operacion) {
        query = query.eq('operacion', filtros.operacion);
      }
      if (filtros.tabla) {
        query = query.eq('tabla', filtros.tabla);
      }

      const { data, error: sbError } = await query;

      if (sbError) throw sbError;
      setLogs(data as AuditLog[]);
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, loading, error, refetch: fetchLogs };
}
