import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { defuncionSchema, DefuncionFormData } from '@/features/defunciones/defunciones.schema';
import { useDefunciones } from '@/hooks/useDefunciones';
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

export default function DefuncionNuevoPage() {
  const navigate = useNavigate();
  const { fetchNextFolioNumero, create, loading } = useDefunciones();
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isDirty }, reset, getValues, watch } = useForm<DefuncionFormData>({
    resolver: zodResolver(defuncionSchema),
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

  const onSubmit = async (data: DefuncionFormData) => {
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
      toast('Partida de defunción registrada exitosamente');
      navigate('/defunciones');
    } catch (err: any) {
      if (err.code === '23505') {
        setErrorGuardar('El Libro, Folio y Número ingresados ya existen en el libro de Defunciones. Por favor, verifica e intenta con otros.');
      } else {
        setErrorGuardar('Ocurrió un error al guardar la partida. Intenta nuevamente.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <PartidaHeader titulo="Nueva Defunción" volverUrl="/defunciones" />

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
          <h2 className="text-lg font-serif font-semibold text-text-primary mb-4 border-b border-border pb-2">Datos de la Defunción</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="fecha_defuncion" type="date" label="Fecha de Defunción" {...register('fecha_defuncion')} error={errors.fecha_defuncion?.message} />
            <Input id="nombre_difunto" type="text" label="Nombres del Difunto" {...register('nombre_difunto')} error={errors.nombre_difunto?.message} />
            <Input id="apellidos_difunto" type="text" label="Apellidos del Difunto" {...register('apellidos_difunto')} error={errors.apellidos_difunto?.message} />
            <Input id="edad" type="text" label="Edad" {...register('edad')} error={errors.edad?.message} />
            <Input id="lugar_origen" type="text" label="Natural de (Lugar de origen)" {...register('lugar_origen')} error={errors.lugar_origen?.message} />
            <Input id="estado_civil" type="text" label="Estado Civil" {...register('estado_civil')} error={errors.estado_civil?.message} />
          </div>
        </div>

        {/* Padres */}
        <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-text-primary mb-4 border-b border-border pb-2">Padres del Difunto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="padre_difunto" type="text" label="Padre" {...register('padre_difunto')} error={errors.padre_difunto?.message} />
            <Input id="madre_difunto" type="text" label="Madre" {...register('madre_difunto')} error={errors.madre_difunto?.message} />
          </div>
        </div>

        {/* Causa de Muerte y Firma */}
        <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-text-primary mb-4 border-b border-border pb-2">Causa de Muerte y Firma</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="causa_muerte" type="text" label="Causa de Muerte" {...register('causa_muerte')} error={errors.causa_muerte?.message} />
            <Input id="da_fe" type="text" label="Da Fe (Quien firma)" {...register('da_fe')} error={errors.da_fe?.message} />
          </div>
        </div>

        <SeccionAnotaciones register={register} errors={errors} watch={watch} defaultExpanded={false} />

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
          <Button type="button" variant="ghost" onClick={() => navigate('/defunciones')}>Cancelar</Button>
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
