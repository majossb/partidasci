import React from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/Input';

interface FormularioConfirmacionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  activeIndex: number;
}

const FormularioConfirmacion: React.FC<FormularioConfirmacionProps> = React.memo(({ register, errors, activeIndex }) => {
  return (
    <>
      {/* Main data */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
        <h2 className="text-sm font-serif font-semibold text-text-primary mb-3 border-b border-border pb-2">Datos de la Confirmación</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input id={`nombre_${activeIndex}`} label="Nombres del Confirmado" {...register('nombre_confirmado')} error={errors.nombre_confirmado?.message as string} />
          <Input id={`apellidos_${activeIndex}`} label="Apellidos del Confirmado" {...register('apellidos_confirmado')} error={errors.apellidos_confirmado?.message as string} />
          <Input id={`fecha_confirmacion_${activeIndex}`} type="date" label="Fecha de Confirmación (Opcional)" {...register('fecha_confirmacion')} error={errors.fecha_confirmacion?.message as string} />
          <Input id={`anio_confirmacion_${activeIndex}`} type="number" label="Año de la Confirmación (Opcional)" {...register('anio_confirmacion')} error={errors.anio_confirmacion?.message as string} />
          <Input id={`ministro_${activeIndex}`} label="Ministro que Confirma (Opcional)" {...register('ministro')} error={errors.ministro?.message as string} />
          <Input id={`obispo_${activeIndex}`} label="Obispo (Opcional)" {...register('obispo')} error={errors.obispo?.message as string} />
          <Input id={`fecha_nacimiento_${activeIndex}`} type="date" label="Fecha de Nacimiento (Opcional)" {...register('fecha_nacimiento')} error={errors.fecha_nacimiento?.message as string} />
          <Input id={`lugar_nacimiento_${activeIndex}`} label="Lugar de Nacimiento (Opcional)" {...register('lugar_nacimiento')} error={errors.lugar_nacimiento?.message as string} />
          <Input id={`lugar_confirmacion_${activeIndex}`} label="Lugar de Confirmación (Opcional)" className="md:col-span-2" {...register('lugar_confirmacion')} error={errors.lugar_confirmacion?.message as string} />
        </div>
      </div>

      {/* Parents and Sponsors */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
        <h2 className="text-sm font-serif font-semibold text-text-primary mb-3 border-b border-border pb-2">Padres y Padrinos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input id={`padre_${activeIndex}`} label="Nombre del Padre (Opcional)" {...register('nombre_padre')} error={errors.nombre_padre?.message as string} />
          <Input id={`madre_${activeIndex}`} label="Nombre de la Madre (Opcional)" {...register('nombre_madre')} error={errors.nombre_madre?.message as string} />
          <Input id={`padrino_madrina_${activeIndex}`} label="Padrino o Madrina (Opcional)" className="md:col-span-2" {...register('padrino_madrina')} error={errors.padrino_madrina?.message as string} />
        </div>
      </div>

      {/* Baptism reference */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
        <h2 className="text-sm font-serif font-semibold text-text-primary mb-3 border-b border-border pb-2">Datos de Bautismo de Referencia</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input id={`parroquia_bautismo_${activeIndex}`} label="Parroquia de Bautismo (Opcional)" {...register('parroquia_bautismo')} error={errors.parroquia_bautismo?.message as string} />
          <Input id={`diocesis_${activeIndex}`} label="Diócesis (Opcional)" {...register('diocesis')} error={errors.diocesis?.message as string} />
          <Input id={`numero_libro_bautismo_${activeIndex}`} label="Libro de Bautismo (Opcional)" {...register('numero_libro_bautismo')} error={errors.numero_libro_bautismo?.message as string} />
          <Input id={`folio_bautismo_${activeIndex}`} label="Folio de Bautismo (Opcional)" {...register('folio_bautismo')} error={errors.folio_bautismo?.message as string} />
          <Input id={`numero_bautismo_${activeIndex}`} label="Número de Bautismo (Opcional)" {...register('numero_bautismo')} error={errors.numero_bautismo?.message as string} />
          <Input id={`dia_semana_${activeIndex}`} label="Día de la semana (Opcional)" {...register('dia_semana')} error={errors.dia_semana?.message as string} />
          <Input id={`da_fe_${activeIndex}`} label="Da Fe (Quien firma) (Opcional)" className="md:col-span-2" {...register('da_fe')} error={errors.da_fe?.message as string} />
        </div>
      </div>
    </>
  );
});

FormularioConfirmacion.displayName = 'FormularioConfirmacion';

export default FormularioConfirmacion;
