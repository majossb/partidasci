import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNames: Record<string, string> = {
  'bautismos': 'Bautismos',
  'confirmaciones': 'Confirmaciones',
  'matrimonios': 'Matrimonios',
  'defunciones': 'Defunciones',
  'auditoria': 'Auditoría',
  'perfil': 'Mi Perfil',
  'nuevo': 'Nuevo Registro',
  'editar': 'Editar',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="breadcrumbs flex text-sm text-text-secondary font-sans mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link to="/" className="inline-flex items-center hover:text-primary transition-colors">
            <Home className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          // Tratar hashes UUID largos (ej: detalle de registro)
          const displayName = routeNames[name] || (name.length > 20 ? 'Detalle' : name);

          return (
            <li key={name}>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 mx-1" />
                {isLast ? (
                  <span className="text-text-primary font-medium">{displayName}</span>
                ) : (
                  <Link to={routeTo} className="hover:text-primary transition-colors">
                    {displayName}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
