export type RolUsuario = 'secretaria' | 'padre' | null;

export interface UsuarioActual {
  id: string;
  email: string;
  rol: RolUsuario;
}
