import React from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/Input';

interface FormularioBautismoProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  activeIndex: number;
}

const FormularioBautismo: React.FC<FormularioBautismoProps> = React.memo(({ register, errors, activeIndex }) => {
  return (
    <>
      {/* Main data */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
        <h2 className="text-sm font-serif font-semibold text-text-primary mb-3 border-b border-border pb-2">Datos Principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input id={`nombre_${activeIndex}`} label="Nombres" {...register('nombre_bautizado')} error={errors.nombre_bautizado?.message as string} />
          <Input id={`apellidos_${activeIndex}`} label="Apellidos" {...register('apellidos_bautizado')} error={errors.apellidos_bautizado?.message as string} />
          <Input id={`fecha_bautismo_${activeIndex}`} type="date" label="Fecha de Bautismo" {...register('fecha_bautismo')} error={errors.fecha_bautismo?.message as string} />
          <Input id={`ministro_${activeIndex}`} label="Ministro" {...register('ministro')} error={errors.ministro?.message as string} />
          <Input id={`fecha_nacimiento_${activeIndex}`} type="date" label="Fecha de Nacimiento" {...register('fecha_nacimiento')} error={errors.fecha_nacimiento?.message as string} />
          <Input id={`lugar_${activeIndex}`} label="Lugar de Nacimiento" {...register('lugar_nacimiento')} error={errors.lugar_nacimiento?.message as string} />
        </div>
      </div>

      {/* Parents and godparents */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
        <h2 className="text-sm font-serif font-semibold text-text-primary mb-3 border-b border-border pb-2">Padres, Abuelos y Padrinos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input id={`padre_${activeIndex}`} label="Nombre del Padre" {...register('nombre_padre')} error={errors.nombre_padre?.message as string} />
          <Input id={`madre_${activeIndex}`} label="Nombre de la Madre" {...register('nombre_madre')} error={errors.nombre_madre?.message as string} />
          <Input id={`abuelos_p_${activeIndex}`} label="Abuelos Paternos" {...register('abuelos_paternos')} error={errors.abuelos_paternos?.message as string} />
          <Input id={`abuelos_m_${activeIndex}`} label="Abuelos Maternos" {...register('abuelos_maternos')} error={errors.abuelos_maternos?.message as string} />
          <Input id={`padrino_${activeIndex}`} label="Padrino" {...register('padrino')} error={errors.padrino?.message as string} />
          <Input id={`madrina_${activeIndex}`} label="Madrina" {...register('madrina')} error={errors.madrina?.message as string} />
          <Input id={`da_fe_${activeIndex}`} label="Da Fe (Quien firma)" className="md:col-span-2" {...register('da_fe')} error={errors.da_fe?.message as string} />
        </div>
      </div>
    </>
  );
});

FormularioBautismo.displayName = 'FormularioBautismo';

export default FormularioBautismo;
