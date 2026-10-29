import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

import { sanitizeText } from '@/utils/sanitize';
import { toast } from '@/components/ui/Toast';
import { PARROQUIA_CONFIG } from '@/utils/constantes';

export default function BautismoNuevoPage() {
  const navigate = useNavigate();
  const { fetchNextFolioNumero, create, loading } = useBautismos();
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isDirty }, reset, getValues, watch } = useForm<BautismoFormData>({
    resolver: zodResolver(bautismoSchema),
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

  const onSubmit = async (data: BautismoFormData) => {
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
      toast('Partida de bautismo registrada exitosamente');
      navigate('/bautismos');
    } catch (err: any) {
      if (err.code === '23505') {
        setErrorGuardar('El Libro, Folio y Número ingresados ya existen en el libro de Bautismos. Por favor, verifica e intenta con otros.');
      } else {
        setErrorGuardar('Ocurrió un error al guardar la partida. Intenta nuevamente.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <PartidaHeader titulo="Nuevo Bautismo" volverUrl="/bautismos" />

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
              label="Libro (Ej: 2B)"
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
          <p className="text-xs text-text-secondary mt-2">
            El sistema sugiere el siguiente consecutivo. Puedes editarlo si estás registrando una partida antigua o hay un salto en el libro. <strong>Una vez guardado, no se podrá modificar.</strong>
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

        <SeccionAnotaciones register={register} errors={errors} watch={watch} defaultExpanded={false} />

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
          <Button type="button" variant="ghost" onClick={() => navigate('/bautismos')}>
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
