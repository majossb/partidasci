import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { toast } from '@/components/ui/Toast';

export default function DefuncionEditarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchDefuncionById, update, loading } = useDefunciones();
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  const [dataActual, setDataActual] = useState<any>(null);

  const { register, handleSubmit, formState: { errors, isDirty }, reset, watch } = useForm<DefuncionFormData>({
    resolver: zodResolver(defuncionSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const { isBlocked, proceed, reset: cancelarNavegacion } = useCambiosNoGuardados(isDirty);

  useEffect(() => {
    const init = async () => {
      if (!id) return;
      try {
        const data = await fetchDefuncionById(id);
        if (data.estado === 'anulado') {
          setErrorCarga('No se puede editar una partida anulada.');
          return;
        }
        setDataActual(data);
        
        // Formatear fechas para input type="date" y prevenir fallos silenciosos de validación
        const formData = { ...data };
        if (formData.fecha_defuncion) {
          formData.fecha_defuncion = formData.fecha_defuncion.split('T')[0];
        }
        
        reset(formData);
      } catch (err) {
        setErrorCarga('No se pudo cargar la información.');
      }
    };
    init();
  }, [id, fetchDefuncionById, reset]);

  const onSubmit = async (data: DefuncionFormData) => {
    if (!id) return;
    setErrorGuardar(null);
    try {
      await update(id, data);
      reset(data);
      toast('Partida de defunción actualizada exitosamente');
      navigate('/defunciones');
    } catch (err: any) {
      if (err.code === '23505') {
        setErrorGuardar('El Libro, Folio y Número ingresados ya existen en el libro de Defunciones. Por favor, verifica e intenta con otros.');
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
        titulo="Editar Defunción" 
        libro={dataActual.libro}
        folio={dataActual.folio} 
        numero={dataActual.numero} 
        estado={dataActual.estado}
        volverUrl={`/defunciones/${id}`} 
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

        <SeccionAnotaciones register={register} errors={errors} watch={watch} defaultExpanded={true} />

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
          <Button type="button" variant="ghost" onClick={() => navigate(`/defunciones/${id}`)}>Cancelar</Button>
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
