import { clsx } from 'clsx';
import { EstadoPartida } from '@/types/sacramento.types';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function EstadoBadge({ estado }: { estado: EstadoPartida }) {
  const config = {
    activo: {
      color: 'bg-[#FDF4F5] text-[#6B1E2E] border-[#F3D2D7]',
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#6B1E2E]" />,
      label: 'Activo'
    },
    requiere_revision: {
      color: 'bg-[#FDF8EE] text-[#9E721D] border-[#F5E5C7]',
      icon: <AlertTriangle className="w-3.5 h-3.5 mr-1 text-[#9E721D]" />,
      label: 'Requiere Revisión'
    },
    anulado: {
      color: 'bg-[#F4F1F2] text-[#544648] border-[#DCD3D5]',
      icon: <XCircle className="w-3.5 h-3.5 mr-1 text-[#544648]" />,
      label: 'Anulado'
    },
  };

  const { color, icon, label } = config[estado] || config.activo;

  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border font-sans shadow-2xs transition-colors", color)}>
      {icon}
      {label}
    </span>
  );
}
