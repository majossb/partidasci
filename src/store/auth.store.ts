import { create } from 'zustand'
import { UsuarioActual } from '@/types/roles.types'

interface AuthState {
  usuario: UsuarioActual | null;
  cargando: boolean;
  setUsuario: (usuario: UsuarioActual | null) => void;
  setCargando: (estado: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  cargando: true,
  setUsuario: (usuario) => set({ usuario }),
  setCargando: (estado) => set({ cargando: estado }),
  logout: () => set({ usuario: null }),
}));
