import { useState, useCallback } from 'react';
import * as api from '@/features/matrimonios/matrimonios.queries';
import { MatrimonioFormData } from '@/features/matrimonios/matrimonios.schema';

export function useMatrimonios() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMatrimonios = useCallback(async (page: number, limit: number, filtros?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      return await api.getMatrimonios(page, limit, filtros);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMatrimonioById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      return await api.getMatrimonioById(id);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNextFolioNumero = useCallback(async () => {
    try {
      return await api.getNextFolioNumeroMatrimonio();
    } catch (err) {
      console.error(err);
      return { folio: 1, numero: 1 };
    }
  }, []);

  const create = useCallback(async (data: MatrimonioFormData) => {
    setLoading(true);
    setError(null);
    try {
      return await api.createMatrimonio(data);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<MatrimonioFormData>) => {
    setLoading(true);
    setError(null);
    try {
      return await api.updateMatrimonio(id, data);
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
      return await api.anularMatrimonio(id, motivo);
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
    fetchMatrimonios,
    fetchMatrimonioById,
    fetchNextFolioNumero,
    create,
    update,
    anular
  };
}
