import { useState, useCallback } from 'react';
import * as api from '@/features/bautismos/bautismos.queries';
import { BautismoFormData } from '@/features/bautismos/bautismos.schema';

export function useBautismos() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBautismos = useCallback(async (page: number, limit: number, filtros?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      return await api.getBautismos(page, limit, filtros);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBautismoById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      return await api.getBautismoById(id);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNextFolioNumero = useCallback(async () => {
    try {
      return await api.getNextFolioNumero();
    } catch (err) {
      console.error(err);
      return { folio: 1, numero: 1 };
    }
  }, []);

  const create = useCallback(async (data: BautismoFormData) => {
    setLoading(true);
    setError(null);
    try {
      return await api.createBautismo(data);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<BautismoFormData>) => {
    setLoading(true);
    setError(null);
    try {
      return await api.updateBautismo(id, data);
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
      return await api.anularBautismo(id, motivo);
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
    fetchBautismos,
    fetchBautismoById,
    fetchNextFolioNumero,
    create,
    update,
    anular
  };
}
