import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { supabase } from '@/lib/supabase';
import { Shield, KeyRound, User as UserIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { PARROQUIA_CONFIG } from '@/utils/constantes';

export default function PerfilPage() {
  const { usuario } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMessage({ type: 'success', text: '¡Contraseña actualizada con éxito!' });
      setPassword('');
      setConfirmPassword('');
      
    } catch (error: any) {
      console.error('Error actualizando contraseña:', error);
      setMessage({ type: 'error', text: error.message || 'Error al actualizar la contraseña.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-[calc(100vh-4rem)] p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <UserIcon className="w-7 h-7 text-[#6B1E2E]" />
          Configuración de Perfil
        </h1>
        <p className="text-gray-500 text-sm mt-1">Gestiona tu información personal y credenciales de acceso.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Información del Usuario */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#6B1E2E] text-[#D4AF37] flex items-center justify-center font-serif text-2xl font-bold border-2 border-[#D4AF37]/30 shadow-inner">
                {usuario?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-lg break-all">{usuario?.email}</h3>
                <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 capitalize">
                  <Shield className="w-3 h-3" />
                  Rol: {usuario?.rol || 'Usuario'}
                </span>
              </div>
            </div>
            
            <hr className="border-gray-100 mb-6" />
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Parroquia</p>
                <p className="text-gray-800 font-medium mt-1">{PARROQUIA_CONFIG.nombre}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Diócesis</p>
                <p className="text-gray-800 font-medium mt-1">{PARROQUIA_CONFIG.diocesis}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado de cuenta</p>
                <p className="text-green-600 font-medium mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Activa y verificada
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cambio de Contraseña */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-gray-500" />
                Seguridad y Acceso
              </h3>
              <p className="text-sm text-gray-500 mt-1">Actualiza tu contraseña de ingreso al sistema.</p>
            </div>
            
            <div className="p-6">
              {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                  message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#C9973A] focus:border-[#C9973A] sm:text-sm transition-colors"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#C9973A] focus:border-[#C9973A] sm:text-sm transition-colors"
                    placeholder="Repite tu contraseña"
                    required
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={loading || !password || !confirmPassword}
                    className="flex items-center justify-center w-full sm:w-auto px-6 py-2.5 bg-[#6B1E2E] text-white font-medium rounded-lg hover:bg-[#8B293F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6B1E2E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      'Actualizar Contraseña'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
