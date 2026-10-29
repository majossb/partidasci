import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { matrimonioSchema, MatrimonioFormData } from '@/features/matrimonios/matrimonios.schema';
import { useMatrimonios } from '@/hooks/useMatrimonios';
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

export default function MatrimonioNuevoPage() {
  const navigate = useNavigate();
  const { fetchNextFolioNumero, create, loading } = useMatrimonios();
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isDirty }, reset, getValues, watch } = useForm<MatrimonioFormData>({
    resolver: zodResolver(matrimonioSchema),
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

  const onSubmit = async (data: MatrimonioFormData) => {
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
      toast('Partida de matrimonio registrada exitosamente');
      navigate('/matrimonios');
    } catch (err: any) {
      if (err.code === '23505') {
        setErrorGuardar('El Libro, Folio y Número ingresados ya existen en el libro de Matrimonios. Por favor, verifica e intenta con otros.');
      } else {
        setErrorGuardar('Ocurrió un error al guardar la partida. Intenta nuevamente.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <PartidaHeader titulo="Nuevo Matrimonio" volverUrl="/matrimonios" />

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
            <Input id="libro" type="text" label="Libro" {...register('libro')} error={errors.libro?.message} />
            <Input id="folio" type="number" label="Folio" {...register('folio')} error={errors.folio?.message} />
            <Input id="numero" type="number" label="Número" {...register('numero')} error={errors.numero?.message} />
          </div>
        </div>

        {/* Datos Principales */}
        <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-text-primary mb-4 border-b border-border pb-2">Fecha y Lugar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="parroquia"
              type="text"
              label="En la Parroquia de"
              {...register('parroquia')}
              error={errors.parroquia?.message}
            />
            <Input
              id="fecha_matrimonio"
              type="date"
              label="Fecha de Matrimonio"
              {...register('fecha_matrimonio')}
              error={errors.fecha_matrimonio?.message}
            />
            <Input
              id="presencio"
              type="text"
              label="Presenció"
              {...register('presencio')}
              error={errors.presencio?.message}
            />
            <Input
              id="da_fe"
              type="text"
              label="Doy Fe"
              {...register('da_fe')}
              error={errors.da_fe?.message}
            />
          </div>
        </div>

        {/* Esposo */}
        <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-text-primary mb-4 border-b border-border pb-2">Datos del Esposo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="nombre_esposo" type="text" label="Nombres" {...register('nombre_esposo')} error={errors.nombre_esposo?.message} />
            <Input id="apellidos_esposo" type="text" label="Apellidos" {...register('apellidos_esposo')} error={errors.apellidos_esposo?.message} />
            <Input id="padre_esposo" type="text" label="Padre del Esposo" {...register('padre_esposo')} error={errors.padre_esposo?.message} />
            <Input id="madre_esposo" type="text" label="Madre del Esposo" {...register('madre_esposo')} error={errors.madre_esposo?.message} />
            <Input id="parroquia_bautismo_esposo" type="text" label="Bautizado en (Parroquia)" {...register('parroquia_bautismo_esposo')} error={errors.parroquia_bautismo_esposo?.message} />
            <Input id="fecha_bautismo_esposo" type="date" label="Fecha Bautismo" {...register('fecha_bautismo_esposo')} error={errors.fecha_bautismo_esposo?.message} />
            <div className="grid grid-cols-3 gap-2 col-span-2">
              <Input id="libro_bautismo_esposo" type="text" label="Libro (Baut.)" {...register('libro_bautismo_esposo')} error={errors.libro_bautismo_esposo?.message} />
              <Input id="folio_bautismo_esposo" type="text" label="Folio (Baut.)" {...register('folio_bautismo_esposo')} error={errors.folio_bautismo_esposo?.message} />
              <Input id="numero_bautismo_esposo" type="text" label="N° (Baut.)" {...register('numero_bautismo_esposo')} error={errors.numero_bautismo_esposo?.message} />
            </div>
          </div>
        </div>

        {/* Esposa */}
        <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-text-primary mb-4 border-b border-border pb-2">Datos de la Esposa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="nombre_esposa" type="text" label="Nombres" {...register('nombre_esposa')} error={errors.nombre_esposa?.message} />
            <Input id="apellidos_esposa" type="text" label="Apellidos" {...register('apellidos_esposa')} error={errors.apellidos_esposa?.message} />
            <Input id="padre_esposa" type="text" label="Padre de la Esposa" {...register('padre_esposa')} error={errors.padre_esposa?.message} />
            <Input id="madre_esposa" type="text" label="Madre de la Esposa" {...register('madre_esposa')} error={errors.madre_esposa?.message} />
            <Input id="parroquia_bautismo_esposa" type="text" label="Bautizada en (Parroquia)" {...register('parroquia_bautismo_esposa')} error={errors.parroquia_bautismo_esposa?.message} />
            <Input id="fecha_bautismo_esposa" type="date" label="Fecha Bautismo" {...register('fecha_bautismo_esposa')} error={errors.fecha_bautismo_esposa?.message} />
            <div className="grid grid-cols-3 gap-2 col-span-2">
              <Input id="libro_bautismo_esposa" type="text" label="Libro (Baut.)" {...register('libro_bautismo_esposa')} error={errors.libro_bautismo_esposa?.message} />
              <Input id="folio_bautismo_esposa" type="text" label="Folio (Baut.)" {...register('folio_bautismo_esposa')} error={errors.folio_bautismo_esposa?.message} />
              <Input id="numero_bautismo_esposa" type="text" label="N° (Baut.)" {...register('numero_bautismo_esposa')} error={errors.numero_bautismo_esposa?.message} />
            </div>
          </div>
        </div>

        {/* Testigos */}
        <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-text-primary mb-4 border-b border-border pb-2">Testigos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="testigo1" type="text" label="Testigo 1" {...register('testigo1')} error={errors.testigo1?.message} />
            <Input id="testigo2" type="text" label="Testigo 2" {...register('testigo2')} error={errors.testigo2?.message} />
          </div>
        </div>

        <SeccionAnotaciones register={register} errors={errors} watch={watch} defaultExpanded={false} />



        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
          <Button type="button" variant="ghost" onClick={() => navigate('/matrimonios')}>Cancelar</Button>
          <Button type="submit" isLoading={loading}>Guardar Partida</Button>
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
