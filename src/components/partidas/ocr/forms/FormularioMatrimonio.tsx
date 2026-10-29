import React from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/Input';

interface FormularioMatrimonioProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  activeIndex: number;
}

const FormularioMatrimonio: React.FC<FormularioMatrimonioProps> = React.memo(({ register, errors, activeIndex }) => {
  return (
    <>
      {/* General and husband data */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
        <h2 className="text-sm font-serif font-semibold text-text-primary mb-3 border-b border-border pb-2">Datos del Matrimonio y Esposo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input id={`parroquia_${activeIndex}`} label="En la Parroquia de" className="md:col-span-2" {...register('parroquia')} error={errors.parroquia?.message as string} />
          <Input id={`fecha_matrimonio_${activeIndex}`} type="date" label="Fecha de Matrimonio" className="md:col-span-2" {...register('fecha_matrimonio')} error={errors.fecha_matrimonio?.message as string} />
          <Input id={`presencio_${activeIndex}`} label="Presenció" className="md:col-span-2" {...register('presencio')} error={errors.presencio?.message as string} />
          <Input id={`nombre_esposo_${activeIndex}`} label="Nombres del Esposo" {...register('nombre_esposo')} error={errors.nombre_esposo?.message as string} />
          <Input id={`apellidos_esposo_${activeIndex}`} label="Apellidos del Esposo" {...register('apellidos_esposo')} error={errors.apellidos_esposo?.message as string} />
          <Input id={`padre_esposo_${activeIndex}`} label="Padre del Esposo" {...register('padre_esposo')} error={errors.padre_esposo?.message as string} />
          <Input id={`madre_esposo_${activeIndex}`} label="Madre del Esposo" {...register('madre_esposo')} error={errors.madre_esposo?.message as string} />
        </div>
      </div>

      {/* Husband baptism */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
        <h2 className="text-sm font-serif font-semibold text-text-primary mb-3 border-b border-border pb-2">Bautismo del Esposo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input id={`parroquia_b_${activeIndex}`} label="Parroquia Bautismo" {...register('parroquia_bautismo_esposo')} error={errors.parroquia_bautismo_esposo?.message as string} />
          <Input id={`fecha_b_${activeIndex}`} type="date" label="Fecha Bautismo" {...register('fecha_bautismo_esposo')} error={errors.fecha_bautismo_esposo?.message as string} />
          <Input id={`libro_b_${activeIndex}`} label="Libro" {...register('libro_bautismo_esposo')} error={errors.libro_bautismo_esposo?.message as string} />
          <Input id={`folio_b_${activeIndex}`} label="Folio" {...register('folio_bautismo_esposo')} error={errors.folio_bautismo_esposo?.message as string} />
          <Input id={`numero_b_${activeIndex}`} label="Número" className="md:col-span-2" {...register('numero_bautismo_esposo')} error={errors.numero_bautismo_esposo?.message as string} />
        </div>
      </div>

      {/* Wife data */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
        <h2 className="text-sm font-serif font-semibold text-text-primary mb-3 border-b border-border pb-2">Datos de la Esposa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input id={`nombre_esposa_${activeIndex}`} label="Nombres de la Esposa" {...register('nombre_esposa')} error={errors.nombre_esposa?.message as string} />
          <Input id={`apellidos_esposa_${activeIndex}`} label="Apellidos de la Esposa" {...register('apellidos_esposa')} error={errors.apellidos_esposa?.message as string} />
          <Input id={`padre_esposa_${activeIndex}`} label="Padre de la Esposa" {...register('padre_esposa')} error={errors.padre_esposa?.message as string} />
          <Input id={`madre_esposa_${activeIndex}`} label="Madre de la Esposa" {...register('madre_esposa')} error={errors.madre_esposa?.message as string} />
        </div>
      </div>

      {/* Wife baptism */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
        <h2 className="text-sm font-serif font-semibold text-text-primary mb-3 border-b border-border pb-2">Bautismo de la Esposa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input id={`parroquia_b_w_${activeIndex}`} label="Parroquia Bautismo" {...register('parroquia_bautismo_esposa')} error={errors.parroquia_bautismo_esposa?.message as string} />
          <Input id={`fecha_b_w_${activeIndex}`} type="date" label="Fecha Bautismo" {...register('fecha_bautismo_esposa')} error={errors.fecha_bautismo_esposa?.message as string} />
          <Input id={`libro_b_w_${activeIndex}`} label="Libro" {...register('libro_bautismo_esposa')} error={errors.libro_bautismo_esposa?.message as string} />
          <Input id={`folio_b_w_${activeIndex}`} label="Folio" {...register('folio_bautismo_esposa')} error={errors.folio_bautismo_esposa?.message as string} />
          <Input id={`numero_b_w_${activeIndex}`} label="Número" className="md:col-span-2" {...register('numero_bautismo_esposa')} error={errors.numero_bautismo_esposa?.message as string} />
        </div>
      </div>

      {/* Witnesses and Fe */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
        <h2 className="text-sm font-serif font-semibold text-text-primary mb-3 border-b border-border pb-2">Testigos y Firma</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input id={`testigo1_${activeIndex}`} label="Testigo 1" {...register('testigo1')} error={errors.testigo1?.message as string} />
          <Input id={`testigo2_${activeIndex}`} label="Testigo 2" {...register('testigo2')} error={errors.testigo2?.message as string} />
          <Input id={`da_fe_${activeIndex}`} label="Doy Fe (Firma)" className="md:col-span-2" {...register('da_fe')} error={errors.da_fe?.message as string} />
        </div>
      </div>
    </>
  );
});

FormularioMatrimonio.displayName = 'FormularioMatrimonio';

export default FormularioMatrimonio;
