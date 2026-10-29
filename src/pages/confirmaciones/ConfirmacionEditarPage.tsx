import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { confirmacionSchema, ConfirmacionFormData } from '@/features/confirmaciones/confirmaciones.schema';
import { useConfirmaciones } from '@/hooks/useConfirmaciones';
import PartidaHeader from '@/components/partidas/PartidaHeader';
import SeccionAnotaciones from '@/components/partidas/SeccionAnotaciones';
import BannerErroresFormulario from '@/components/partidas/BannerErroresFormulario';
import ModalCambiosNoGuardados from '@/components/partidas/ModalCambiosNoGuardados';
import { useCambiosNoGuardados } from '@/hooks/useCambiosNoGuardados';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

export default function ConfirmacionEditarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchConfirmacionById, update, loading } = useConfirmaciones();
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  const [dataActual, setDataActual] = useState<any>(null);

  const { register, handleSubmit, formState: { errors, isDirty }, reset, watch } = useForm<ConfirmacionFormData>({
    resolver: zodResolver(confirmacionSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const { isBlocked, proceed, reset: cancelarNavegacion } = useCambiosNoGuardados(isDirty);

  useEffect(() => {
    const init = async () => {
      if (!id) return;
      try {
        const data = await fetchConfirmacionById(id);
        if (data.estado === 'anulado') {
          setErrorCarga('No se puede editar una partida anulada.');
          return;
        }
        setDataActual(data);
        
        // Formatear fechas para input type="date" y prevenir fallos silenciosos de validación
        const formData = { ...data };
        if (formData.fecha_confirmacion) {
          formData.fecha_confirmacion = formData.fecha_confirmacion.split('T')[0];
        }
        if (formData.fecha_nacimiento) {
          formData.fecha_nacimiento = formData.fecha_nacimiento.split('T')[0];
        }
        
        reset(formData);
      } catch (err) {
        setErrorCarga('No se pudo cargar la información.');
      }
    };
    init();
  }, [id, fetchConfirmacionById, reset]);

  const onSubmit = async (data: ConfirmacionFormData) => {
    if (!id) return;
    setErrorGuardar(null);
    try {
      await update(id, data);
      reset(data);
      toast('Partida de confirmación actualizada exitosamente');
      navigate('/confirmaciones');
    } catch (err: any) {
      if (err.code === '23505') {
        setErrorGuardar('El Libro, Folio y Número ingresados ya existen en el libro de Confirmaciones. Por favor, verifica e intenta con otros.');
      } else {
        setErrorGuardar('Ocurrió un error al actualizar la partida. Intenta nuevamente.');
      }
    }
  };

  if (errorCarga) return <div className="p-8 text-danger font-sans text-center bg-danger/10 rounded-md max-w-md mx-auto mt-12">{errorCarga}</div>;
  if (!dataActual) return <div className="p-8 text-text-secondary font-sans animate-pulse text-center mt-12">Cargando formulario...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <PartidaHeader 
        titulo="Editar Confirmación" 
        libro={dataActual.libro}
        folio={dataActual.folio} 
        numero={dataActual.numero} 
        estado={dataActual.estado}
        volverUrl={`/confirmaciones/${id}`} 
      />

      {errorGuardar && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/30 text-danger rounded-md text-sm font-sans">{errorGuardar}</div>
      )}

      <BannerErroresFormulario errors={errors} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-text-primary mb-4 border-b border-border pb-2">Identificadores del Libro</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input id="libro" type="text" label="Libro" {...register('libro')} error={errors.libro?.message} />
            <Input id="folio" type="number" label="Folio" {...register('folio')} error={errors.folio?.message} />
            <Input id="numero" type="number" label="Número" {...register('numero')} error={errors.numero?.message} />
          </div>
          <p className="text-xs text-text-secondary mt-2">
            Ten mucho cuidado al modificar el Folio y el Número, ya que son los identificadores principales de la partida en el libro físico.
          </p>
        </div>

        {/* Datos Principales */}
        <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-text-primary mb-4 border-b border-border pb-2">Datos de la Confirmación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="fecha_confirmacion"
              type="date"
              label="Fecha de Confirmación (Opcional)"
              {...register('fecha_confirmacion')}
              error={errors.fecha_confirmacion?.message}
            />
            <Input
              id="anio_confirmacion"
              type="number"
              label="Año de la Confirmación (Opcional)"
              {...register('anio_confirmacion')}
              error={errors.anio_confirmacion?.message}
            />
            <Input
              id="ministro"
              type="text"
              label="Ministro que Confirma (Opcional)"
              {...register('ministro')}
              error={errors.ministro?.message}
            />
            <Input
              id="obispo"
              type="text"
              label="Obispo (Opcional)"
              {...register('obispo')}
              error={errors.obispo?.message}
            />
            <Input
              id="nombre_confirmado"
              type="text"
              label="Nombres del Confirmado"
              {...register('nombre_confirmado')}
              error={errors.nombre_confirmado?.message}
            />
            <Input
              id="apellidos_confirmado"
              type="text"
              label="Apellidos del Confirmado"
              {...register('apellidos_confirmado')}
              error={errors.apellidos_confirmado?.message}
            />
            <Input
              id="lugar_confirmacion"
              type="text"
              label="Lugar de Confirmación (Opcional)"
              className="md:col-span-2"
              {...register('lugar_confirmacion')}
              error={errors.lugar_confirmacion?.message}
            />
          </div>
        </div>

        {/* Nacimiento y Bautismo */}
        <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-text-primary mb-4 border-b border-border pb-2">Datos de Nacimiento y Bautismo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="fecha_nacimiento"
              type="date"
              label="Fecha de Nacimiento (Opcional)"
              {...register('fecha_nacimiento')}
              error={errors.fecha_nacimiento?.message}
            />
            <Input
              id="lugar_nacimiento"
              type="text"
              label="Lugar de Nacimiento (Opcional)"
              {...register('lugar_nacimiento')}
              error={errors.lugar_nacimiento?.message}
            />
            <Input
              id="parroquia_bautismo"
              type="text"
              label="Bautizado en (Parroquia) (Opcional)"
              {...register('parroquia_bautismo')}
              error={errors.parroquia_bautismo?.message}
            />
            <Input
              id="diocesis"
              type="text"
              label="Diócesis de Bautismo (Opcional)"
              {...register('diocesis')}
              error={errors.diocesis?.message}
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                id="numero_libro_bautismo"
                type="text"
                label="Libro (Baut.) (Opcional)"
                {...register('numero_libro_bautismo')}
                error={errors.numero_libro_bautismo?.message}
              />
              <Input
                id="folio_bautismo"
                type="text"
                label="Folio (Baut.) (Opcional)"
                {...register('folio_bautismo')}
                error={errors.folio_bautismo?.message}
              />
              <Input
                id="numero_bautismo"
                type="text"
                label="Número (Baut.) (Opcional)"
                {...register('numero_bautismo')}
                error={errors.numero_bautismo?.message}
              />
            </div>
          </div>
        </div>

        {/* Padres y Padrinos */}
        <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-text-primary mb-4 border-b border-border pb-2">Padres y Padrinos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="nombre_padre"
              type="text"
              label="Padre (Opcional)"
              {...register('nombre_padre')}
              error={errors.nombre_padre?.message}
            />
            <Input
              id="nombre_madre"
              type="text"
              label="Madre (Opcional)"
              {...register('nombre_madre')}
              error={errors.nombre_madre?.message}
            />
            <Input
              id="padrino_madrina"
              type="text"
              label="Padrino o Madrina (Opcional)"
              className="md:col-span-2"
              {...register('padrino_madrina')}
              error={errors.padrino_madrina?.message}
            />
          </div>
        </div>

        <SeccionAnotaciones register={register} errors={errors} watch={watch} defaultExpanded={true} />



        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
          <Button type="button" variant="ghost" onClick={() => navigate(`/confirmaciones/${id}`)}>Cancelar</Button>
          <Button type="submit" isLoading={loading}>Guardar Cambios</Button>
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
