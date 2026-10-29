import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import RequireAuth from '@/components/auth/RequireAuth';
import RequireRole from '@/components/auth/RequireRole';
import LoginPage from '@/pages/LoginPage';
import RestablecerPasswordPage from '@/pages/RestablecerPasswordPage';
import DashboardPage from '@/pages/DashboardPage';

// Bautismos Pages
import BautismosListaPage from '@/pages/bautismos/BautismosListaPage';
import BautismoNuevoPage from '@/pages/bautismos/BautismoNuevoPage';
import BautismoDetallePage from '@/pages/bautismos/BautismoDetallePage';
import BautismoEditarPage from '@/pages/bautismos/BautismoEditarPage';

// Confirmaciones Pages
import ConfirmacionesListaPage from '@/pages/confirmaciones/ConfirmacionesListaPage';
import ConfirmacionNuevoPage from '@/pages/confirmaciones/ConfirmacionNuevoPage';
import ConfirmacionDetallePage from '@/pages/confirmaciones/ConfirmacionDetallePage';
import ConfirmacionEditarPage from '@/pages/confirmaciones/ConfirmacionEditarPage';

// Matrimonios Pages
import MatrimoniosListaPage from '@/pages/matrimonios/MatrimoniosListaPage';
import MatrimonioNuevoPage from '@/pages/matrimonios/MatrimonioNuevoPage';
import MatrimonioDetallePage from '@/pages/matrimonios/MatrimonioDetallePage';
import MatrimonioEditarPage from '@/pages/matrimonios/MatrimonioEditarPage';

// Defunciones Pages
import DefuncionesListaPage from '@/pages/defunciones/DefuncionesListaPage';
import DefuncionNuevoPage from '@/pages/defunciones/DefuncionNuevoPage';
import DefuncionDetallePage from '@/pages/defunciones/DefuncionDetallePage';
import DefuncionEditarPage from '@/pages/defunciones/DefuncionEditarPage';

// Admin & Settings Pages
import AuditoriaPage from '@/pages/auditoria/AuditoriaPage';
import PerfilPage from '@/pages/perfil/PerfilPage';
import ConfiguracionPage from '@/pages/configuracion/ConfiguracionPage';
import ImportacionPage from '@/pages/configuracion/ImportacionPage';

// Error Pages
import SinPermisosPage from '@/pages/errores/SinPermisosPage';
import NoEncontradoPage from '@/pages/errores/NoEncontradoPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/restablecer-password',
    element: <RestablecerPasswordPage />
  },
  {
    path: '/403',
    element: <SinPermisosPage />
  },
  {
    path: '/404',
    element: <NoEncontradoPage />
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      // Rutas de Bautismos
      { path: 'bautismos', element: <BautismosListaPage /> },
      { path: 'bautismos/nuevo', element: <RequireRole roles={['secretaria']}><BautismoNuevoPage /></RequireRole> },
      { path: 'bautismos/:id', element: <BautismoDetallePage /> },
      { path: 'bautismos/:id/editar', element: <RequireRole roles={['secretaria']}><BautismoEditarPage /></RequireRole> },
      
      // Rutas de Confirmaciones
      { path: 'confirmaciones', element: <ConfirmacionesListaPage /> },
      { path: 'confirmaciones/nuevo', element: <RequireRole roles={['secretaria']}><ConfirmacionNuevoPage /></RequireRole> },
      { path: 'confirmaciones/:id', element: <ConfirmacionDetallePage /> },
      { path: 'confirmaciones/:id/editar', element: <RequireRole roles={['secretaria']}><ConfirmacionEditarPage /></RequireRole> },
      
      // Rutas de Matrimonios
      { path: 'matrimonios', element: <MatrimoniosListaPage /> },
      { path: 'matrimonios/nuevo', element: <RequireRole roles={['secretaria']}><MatrimonioNuevoPage /></RequireRole> },
      { path: 'matrimonios/:id', element: <MatrimonioDetallePage /> },
      { path: 'matrimonios/:id/editar', element: <RequireRole roles={['secretaria']}><MatrimonioEditarPage /></RequireRole> },
      
      // Rutas de Defunciones
      { path: 'defunciones', element: <DefuncionesListaPage /> },
      { path: 'defunciones/nuevo', element: <RequireRole roles={['secretaria']}><DefuncionNuevoPage /></RequireRole> },
      { path: 'defunciones/:id', element: <DefuncionDetallePage /> },
      { path: 'defunciones/:id/editar', element: <RequireRole roles={['secretaria']}><DefuncionEditarPage /></RequireRole> },

      // Rutas Administrativas
      { path: 'auditoria', element: <RequireRole roles={['padre']}><AuditoriaPage /></RequireRole> },
      { path: 'perfil', element: <PerfilPage /> },
      { path: 'configuracion', element: <ConfiguracionPage /> },
      { path: 'configuracion/importar', element: <RequireRole roles={['secretaria', 'padre']}><ImportacionPage /></RequireRole> }
    ]
  },
  {
    path: '*',
    element: <NoEncontradoPage />
  }
]);
