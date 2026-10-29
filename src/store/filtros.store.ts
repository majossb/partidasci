import { create } from 'zustand'

interface FiltrosState {
  busqueda: string;
  estado: string;
  folio: string;
  numero: string;
  anio: string;
  libro: string;
  setFiltro: (key: keyof Omit<FiltrosState, 'setFiltro' | 'resetFiltros'>, value: string) => void;
  resetFiltros: () => void;
}

export const useFiltrosStore = create<FiltrosState>((set) => ({
  busqueda: '',
  estado: '',
  folio: '',
  numero: '',
  anio: '',
  libro: '',
  setFiltro: (key, value) => set({ [key]: value }),
  resetFiltros: () => set({ busqueda: '', estado: '', folio: '', numero: '', anio: '', libro: '' }),
}));

