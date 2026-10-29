import React from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/Input';

interface FormularioDefuncionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  activeIndex: number;
}

const FormularioDefuncion: React.FC<FormularioDefuncionProps> = React.memo(({ register, errors, activeIndex }) => {
  return (
    <>
      {/* Main data */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
        <h2 className="text-sm font-serif font-semibold text-text-primary mb-3 border-b border-border pb-2">Datos del Fallecimiento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input id={`nombre_${activeIndex}`} label="Nombres del Difunto" {...register('nombre_difunto')} error={errors.nombre_difunto?.message as string} />
          <Input id={`apellidos_${activeIndex}`} label="Apellidos del Difunto" {...register('apellidos_difunto')} error={errors.apellidos_difunto?.message as string} />
          <Input id={`fecha_defuncion_${activeIndex}`} type="date" label="Fecha de Defunción" {...register('fecha_defuncion')} error={errors.fecha_defuncion?.message as string} />
          <Input id={`edad_${activeIndex}`} label="Edad" {...register('edad')} error={errors.edad?.message as string} />
          <Input id={`lugar_origen_${activeIndex}`} label="Natural de (Lugar de origen)" {...register('lugar_origen')} error={errors.lugar_origen?.message as string} />
          <Input id={`estado_civil_${activeIndex}`} label="Estado Civil" {...register('estado_civil')} error={errors.estado_civil?.message as string} />
        </div>
      </div>

      {/* Family and cause */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
        <h2 className="text-sm font-serif font-semibold text-text-primary mb-3 border-b border-border pb-2">Padres y Causa de Muerte</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input id={`padre_difunto_${activeIndex}`} label="Padre del Difunto" {...register('padre_difunto')} error={errors.padre_difunto?.message as string} />
          <Input id={`madre_difunto_${activeIndex}`} label="Madre del Difunto" {...register('madre_difunto')} error={errors.madre_difunto?.message as string} />
          <Input id={`causa_muerte_${activeIndex}`} label="Murió de (Causa de Muerte)" className="md:col-span-2" {...register('causa_muerte')} error={errors.causa_muerte?.message as string} />
          <Input id={`da_fe_${activeIndex}`} label="Da Fe (Quien firma)" className="md:col-span-2" {...register('da_fe')} error={errors.da_fe?.message as string} />
        </div>
      </div>
    </>
  );
});

FormularioDefuncion.displayName = 'FormularioDefuncion';

export default FormularioDefuncion;
