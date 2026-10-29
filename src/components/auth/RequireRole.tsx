import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { RolUsuario } from '@/types/roles.types';

interface Props {
  children: React.ReactNode;
  roles: RolUsuario[];
}

export default function RequireRole({ children, roles }: Props) {
  const { usuario, cargando } = useAuthStore();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-text-secondary font-serif text-lg animate-pulse">Verificando permisos...</p>
      </div>
    );
  }

  // Si no hay usuario o si el usuario tiene un rol que no está en la lista permitida
  if (!usuario || !roles.includes(usuario.rol)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
