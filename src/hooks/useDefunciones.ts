import { useState, useCallback } from 'react';
import * as api from '@/features/defunciones/defunciones.queries';
import { DefuncionFormData } from '@/features/defunciones/defunciones.schema';

export function useDefunciones() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDefunciones = useCallback(async (page: number, limit: number, filtros?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      return await api.getDefunciones(page, limit, filtros);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDefuncionById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      return await api.getDefuncionById(id);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNextFolioNumero = useCallback(async () => {
    try {
      return await api.getNextFolioNumeroDefuncion();
    } catch (err) {
      console.error(err);
      return { folio: 1, numero: 1 };
    }
  }, []);

  const create = useCallback(async (data: DefuncionFormData) => {
    setLoading(true);
    setError(null);
    try {
      return await api.createDefuncion(data);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<DefuncionFormData>) => {
    setLoading(true);
    setError(null);
    try {
      return await api.updateDefuncion(id, data);
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
      return await api.anularDefuncion(id, motivo);
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
    fetchDefunciones,
    fetchDefuncionById,
    fetchNextFolioNumero,
    create,
    update,
    anular
  };
}
