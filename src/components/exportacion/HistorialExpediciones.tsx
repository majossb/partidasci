import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Printer, Download, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistorialExpedicionesProps {
    partidaId: string;
    tipoSacramento: string;
}

export default function HistorialExpediciones({ partidaId, tipoSacramento }: HistorialExpedicionesProps) {
    const [historial, setHistorial] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                const { data, error } = await supabase
                    .from('historial_expediciones')
                    .select('*, expedido_por:auth.users(email)')
                    .eq('partida_id', partidaId)
                    .eq('tipo_sacramento', tipoSacramento)
                    .order('expedido_en', { ascending: false });
                
                if (error) throw error;
                setHistorial(data || []);
            } catch (err) {
                console.error('Error cargando historial de expediciones:', err);
            } finally {
                setCargando(false);
            }
        };

        fetchHistorial();
    }, [partidaId, tipoSacramento]);

    if (cargando) {
        return <div className="text-sm text-gray-500 animate-pulse">Cargando historial de copias...</div>;
    }

    if (historial.length === 0) {
        return (
            <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" /> No se han expedido copias de esta partida aún.
            </div>
        );
    }

    const getIcon = (formato: string) => {
        if (formato === 'PDF') return <FileText className="w-4 h-4 text-red-500" />;
        if (formato === 'WORD') return <Download className="w-4 h-4 text-blue-500" />;
        return <Printer className="w-4 h-4 text-gray-600" />;
    };

    return (
        <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-gray-700 text-sm">Registro de Copias Expedidas</h3>
                <span className="bg-gray-200 text-gray-600 text-xs py-0.5 px-2 rounded-full ml-auto">
                    {historial.length} expediciones
                </span>
            </div>
            <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {historial.map((h) => (
                    <li key={h.id} className="p-3 hover:bg-gray-50 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded shadow-sm border border-gray-100">
                                {getIcon(h.formato)}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                                    Exportado como {h.formato}
                                    {h.firma_incluida && (
                                        <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                                            Firmado
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Por: {h.expedido_por_email || h.expedido_por?.email || 'Usuario'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                            {format(new Date(h.expedido_en), "dd 'de' MMM, yyyy", { locale: es })}<br/>
                            {format(new Date(h.expedido_en), "hh:mm a")}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
