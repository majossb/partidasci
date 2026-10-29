import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bautismoSchema, BautismoFormData } from '@/features/bautismos/bautismos.schema';
import { useBautismos } from '@/hooks/useBautismos';
import PartidaHeader from '@/components/partidas/PartidaHeader';
import SeccionAnotaciones from '@/components/partidas/SeccionAnotaciones';
import BannerErroresFormulario from '@/components/partidas/BannerErroresFormulario';
import ModalCambiosNoGuardados from '@/components/partidas/ModalCambiosNoGuardados';
import { useCambiosNoGuardados } from '@/hooks/useCambiosNoGuardados';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Image as ImageIcon, X } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { PARROQUIA_CONFIG } from '@/utils/constantes';

export default function BautismoEditarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchBautismoById, update, loading } = useBautismos();
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  const [dataActual, setDataActual] = useState<any>(null);

  const { register, handleSubmit, formState: { errors, isDirty }, reset, watch } = useForm<BautismoFormData>({
    resolver: zodResolver(bautismoSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const { isBlocked, proceed, reset: cancelarNavegacion } = useCambiosNoGuardados(isDirty);

  useEffect(() => {
    const init = async () => {
      if (!id) return;
      try {
        const data = await fetchBautismoById(id);
        if (data.estado === 'anulado') {
          setErrorCarga('No se puede editar una partida anulada.');
          return;
        }
        setDataActual(data);
        
        // Formatear fechas para input type="date" y prevenir fallos silenciosos de validación
        const formData = { ...data };
        if (formData.fecha_bautismo) {
          formData.fecha_bautismo = formData.fecha_bautismo.split('T')[0];
        }
        if (formData.fecha_nacimiento) {
          formData.fecha_nacimiento = formData.fecha_nacimiento.split('T')[0];
        }
        if (!formData.parroquia) {
          formData.parroquia = PARROQUIA_CONFIG.nombre;
        }
        
        reset(formData); // Llena el formulario con los datos existentes
      } catch (err) {
        setErrorCarga('No se pudo cargar la información del bautismo.');
      }
    };
    init();
  }, [id, fetchBautismoById, reset]);

  const onSubmit = async (data: BautismoFormData) => {
    if (!id) return;
    setErrorGuardar(null);
    try {
      await update(id, data);
      reset(data);
      toast('Partida de bautismo actualizada exitosamente');
      navigate('/bautismos');
    } catch (err: any) {
      if (err.code === '23505') {
        setErrorGuardar('El Libro, Folio y Número ingresados ya existen en el libro de Bautismos. Por favor, verifica e intenta con otros.');
      } else {
        setErrorGuardar('Ocurrió un error al actualizar la partida. Intenta nuevamente.');
      }
    }
  };

  if (errorCarga) {
    return <div className="p-8 text-danger font-sans text-center bg-danger/10 rounded-md max-w-md mx-auto mt-12">{errorCarga}</div>;
  }

  if (!dataActual) {
    return <div className="p-8 text-text-secondary font-sans animate-pulse text-center mt-12">Cargando formulario...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <PartidaHeader 
        titulo="Editar Bautismo" 
        libro={dataActual.libro}
        folio={dataActual.folio} 
        numero={dataActual.numero} 
        estado={dataActual.estado}
        volverUrl={`/bautismos/${id}`} 
      />

      {errorGuardar && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/30 text-danger rounded-md text-sm font-sans">
          {errorGuardar}
        </div>
      )}

      <BannerErroresFormulario errors={errors} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Identificadores */}
        <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-text-primary mb-4 border-b border-border pb-2">Identificadores del Libro</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              id="libro"
              type="text"
              label="Libro"
              {...register('libro')}
              error={errors.libro?.message}
            />
            <Input
              id="folio"
              type="number"
              label="Folio (Identificador Canónico)"
              {...register('folio')}
              error={errors.folio?.message}
            />
            <Input
              id="numero"
              type="number"
              label="Número (Identificador Canónico)"
              {...register('numero')}
              error={errors.numero?.message}
            />
          </div>
          <p className="text-xs text-text-secondary mt-2">
            Ten mucho cuidado al modificar el Folio y el Número, ya que son los identificadores principales de la partida en el libro físico.
          </p>
        </div>

        {/* Datos Principales */}
        <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-text-primary mb-4 border-b border-border pb-2">Datos del Bautismo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="fecha_bautismo"
              type="date"
              label="Fecha de Bautismo"
              {...register('fecha_bautismo')}
              error={errors.fecha_bautismo?.message}
            />
            <Input
              id="ministro"
              type="text"
              label="Ministro que Bautiza"
              {...register('ministro')}
              error={errors.ministro?.message}
            />
            <Input
              id="nombre_bautizado"
              type="text"
              label="Nombres del Bautizado"
              {...register('nombre_bautizado')}
              error={errors.nombre_bautizado?.message}
            />
            <Input
              id="apellidos_bautizado"
              type="text"
              label="Apellidos del Bautizado"
              {...register('apellidos_bautizado')}
              error={errors.apellidos_bautizado?.message}
            />
            <Input
              id="fecha_nacimiento"
              type="date"
              label="Fecha de Nacimiento"
              {...register('fecha_nacimiento')}
              error={errors.fecha_nacimiento?.message}
            />
            <Input
              id="lugar_nacimiento"
              type="text"
              label="Lugar de Nacimiento"
              {...register('lugar_nacimiento')}
              error={errors.lugar_nacimiento?.message}
            />
          </div>
        </div>

        {/* Padres y Abuelos */}
        <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-text-primary mb-4 border-b border-border pb-2">Padres y Abuelos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="nombre_padre"
              type="text"
              label="Nombre del Padre"
              {...register('nombre_padre')}
              error={errors.nombre_padre?.message}
            />
            <Input
              id="nombre_madre"
              type="text"
              label="Nombre de la Madre"
              {...register('nombre_madre')}
              error={errors.nombre_madre?.message}
            />
            <Input
              id="abuelos_paternos"
              type="text"
              label="Abuelos Paternos"
              {...register('abuelos_paternos')}
              error={errors.abuelos_paternos?.message}
            />
            <Input
              id="abuelos_maternos"
              type="text"
              label="Abuelos Maternos"
              {...register('abuelos_maternos')}
              error={errors.abuelos_maternos?.message}
            />
          </div>
        </div>

        {/* Padrinos y Quien da fe */}
        <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-text-primary mb-4 border-b border-border pb-2">Padrinos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="padrino"
              type="text"
              label="Padrino"
              {...register('padrino')}
              error={errors.padrino?.message}
            />
            <Input
              id="madrina"
              type="text"
              label="Madrina"
              {...register('madrina')}
              error={errors.madrina?.message}
            />
            <Input
              id="da_fe"
              type="text"
              label="Da Fe (Quien firma)"
              className="md:col-span-2"
              {...register('da_fe')}
              error={errors.da_fe?.message}
            />
          </div>
        </div>


        <SeccionAnotaciones register={register} errors={errors} watch={watch} defaultExpanded={true} />

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
          <Button type="button" variant="ghost" onClick={() => navigate(`/bautismos/${id}`)}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={loading}>
            Guardar Cambios
          </Button>
        </div>
      </form>

      <ModalCambiosNoGuardados
        isOpen={isBlocked}
        onContinuarEditando={cancelarNavegacion}
        onSalirSinGuardar={proceed}
      />
    </div>
  );
}
