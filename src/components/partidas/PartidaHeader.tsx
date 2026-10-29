import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EstadoBadge from './EstadoBadge';
import { EstadoPartida } from '@/types/sacramento.types';

interface Props {
  titulo: string;
  libro?: string;
  folio?: number;
  numero?: number;
  estado?: EstadoPartida;
  volverUrl?: string;
  acciones?: React.ReactNode;
}

export default function PartidaHeader({ titulo, libro, folio, numero, estado, volverUrl = '..', acciones }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Link 
          to={volverUrl}
          className="p-2 -ml-2 text-text-secondary hover:bg-surface hover:text-text-primary rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-text-primary">{titulo}</h1>
            {estado && <EstadoBadge estado={estado} />}
          </div>
          {(libro !== undefined || folio !== undefined || numero !== undefined) && (
            <p className="text-text-secondary font-sans text-sm mt-1">
              {libro && <span className="mr-4">Libro: <strong className="text-text-primary">{libro}</strong></span>}
              {folio !== undefined && <span className="mr-4">Folio: <strong className="text-text-primary">{folio}</strong></span>}
              {numero !== undefined && <span>Número: <strong className="text-text-primary">{numero}</strong></span>}
            </p>
          )}
        </div>
      </div>
      
      {acciones && (
        <div className="flex items-center gap-2 flex-wrap">
          {acciones}
        </div>
      )}
    </div>
  );
}
