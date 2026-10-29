import { create } from 'zustand'

interface UiState {
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  sidebarMobileOpen: boolean;
  setSidebarMobileOpen: (isOpen: boolean) => void;
  toggleSidebarMobile: () => void;
  buscadorOpen: boolean;
  setBuscadorOpen: (isOpen: boolean) => void;
  toggleBuscador: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  sidebarMobileOpen: false,
  setSidebarMobileOpen: (isOpen) => set({ sidebarMobileOpen: isOpen }),
  toggleSidebarMobile: () => set((state) => ({ sidebarMobileOpen: !state.sidebarMobileOpen })),
  buscadorOpen: false,
  setBuscadorOpen: (isOpen) => set({ buscadorOpen: isOpen }),
  toggleBuscador: () => set((state) => ({ buscadorOpen: !state.buscadorOpen })),
}));
