import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

import { sanitizeText } from '@/utils/sanitize';
import { toast } from '@/components/ui/Toast';
import { PARROQUIA_CONFIG } from '@/utils/constantes';

export default function ConfirmacionNuevoPage() {
  const navigate = useNavigate();
  const { fetchNextFolioNumero, create, loading } = useConfirmaciones();
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isDirty }, reset, getValues, watch } = useForm<ConfirmacionFormData>({
    resolver: zodResolver(confirmacionSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      parroquia: PARROQUIA_CONFIG.nombre,
      anotaciones: ''
    }
  });

  const { isBlocked, proceed, reset: cancelarNavegacion } = useCambiosNoGuardados(isDirty);

  useEffect(() => {
    const init = async () => {
      const nextIds = await fetchNextFolioNumero();
      reset({
        ...getValues(),
        folio: nextIds.folio,
        numero: nextIds.numero
      });
    };
    init();
  }, [fetchNextFolioNumero, reset, getValues]);

  const onSubmit = async (data: ConfirmacionFormData) => {
    if (loading) return;
    setErrorGuardar(null);
    try {
      const sanitizedData = {
        ...data,
        anotaciones: sanitizeText(data.anotaciones),
        da_fe: sanitizeText(data.da_fe),
      };
      await create(sanitizedData);
      reset(sanitizedData);
      toast('Partida de confirmación registrada exitosamente');
      navigate('/confirmaciones');
    } catch (err: any) {
      if (err.code === '23505') {
        setErrorGuardar('El Libro, Folio y Número ingresados ya existen en el libro de Confirmaciones. Por favor, verifica e intenta con otros.');
      } else {
        setErrorGuardar('Ocurrió un error al guardar la partida. Intenta nuevamente.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <PartidaHeader titulo="Nueva Confirmación" volverUrl="/confirmaciones" />

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
              label="Folio"
              {...register('folio')}
              error={errors.folio?.message}
            />
            <Input
              id="numero"
              type="number"
              label="Número"
              {...register('numero')}
              error={errors.numero?.message}
            />
          </div>
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

        <SeccionAnotaciones register={register} errors={errors} watch={watch} defaultExpanded={false} />



        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
          <Button type="button" variant="ghost" onClick={() => navigate('/confirmaciones')}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={loading}>
            Guardar Partida
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
