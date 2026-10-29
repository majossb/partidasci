import { RouterProvider } from 'react-router-dom'
import { router } from './lib/router'
import { useAuth } from './hooks/useAuth'
import { Toaster } from './components/ui/Toast'
import './styles/globals.css'
import './styles/print.css'

function AppContent() {
  // Inicializa la escucha de auth en toda la app
  useAuth();
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default function App() {
  return <AppContent />
}
