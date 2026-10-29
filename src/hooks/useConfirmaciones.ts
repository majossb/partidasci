import { useState, useCallback } from 'react';
import * as api from '@/features/confirmaciones/confirmaciones.queries';
import { ConfirmacionFormData } from '@/features/confirmaciones/confirmaciones.schema';

export function useConfirmaciones() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfirmaciones = useCallback(async (page: number, limit: number, filtros?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      return await api.getConfirmaciones(page, limit, filtros);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConfirmacionById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      return await api.getConfirmacionById(id);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNextFolioNumero = useCallback(async () => {
    try {
      return await api.getNextFolioNumeroConfirmacion();
    } catch (err) {
      console.error(err);
      return { folio: 1, numero: 1 };
    }
  }, []);

  const create = useCallback(async (data: ConfirmacionFormData) => {
    setLoading(true);
    setError(null);
    try {
      return await api.createConfirmacion(data);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<ConfirmacionFormData>) => {
    setLoading(true);
    setError(null);
    try {
      return await api.updateConfirmacion(id, data);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const anular = useCallback(async (id: string, motivo: string) => {
    setLoading(true);
    setError(null);
    try {
      return await api.anularConfirmacion(id, motivo);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchConfirmaciones,
    fetchConfirmacionById,
    fetchNextFolioNumero,
    create,
    update,
    anular
  };
}
