import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, FileSpreadsheet, Shield, Download, Image as ImageIcon, Loader2, BarChart2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { supabase } from '@/lib/supabase';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import GestorFirma from '@/components/configuracion/GestorFirma';
import ModalInformeAnual from '@/components/configuracion/ModalInformeAnual';

export default function ConfiguracionPage() {
    const navigate = useNavigate();
    const { usuario } = useAuthStore();
    const esPadre = usuario?.rol === 'padre';
    const [exportando, setExportando] = useState(false);
    const [modalFirmaOpen, setModalFirmaOpen] = useState(false);
    const [modalInformeOpen, setModalInformeOpen] = useState(false);

    const exportarRespaldoCompleto = async () => {
        try {
            setExportando(true);
            const tablas = [
                { nombre: 'Bautismos', tabla: 'sacramentos_bautismo' },
                { nombre: 'Confirmaciones', tabla: 'sacramentos_confirmacion' },
                { nombre: 'Matrimonios', tabla: 'sacramentos_matrimonio' },
                { nombre: 'Defunciones', tabla: 'sacramentos_defuncion' }
            ];

            const workbook = new ExcelJS.Workbook();

            for (const t of tablas) {
                const PAGE_SIZE = 1000;
                let allData: any[] = [];
                let from = 0;
                let hasMore = true;

                while (hasMore) {
                    const { data, error } = await supabase
                        .from(t.tabla)
                        .select('*')
                        .range(from, from + PAGE_SIZE - 1);
                    if (error) throw error;
                    if (!data || data.length === 0) break;
                    allData = allData.concat(data);
                    hasMore = data.length === PAGE_SIZE;
                    from += PAGE_SIZE;
                }

                const worksheet = workbook.addWorksheet(t.nombre);
                if (allData.length > 0) {
                    const keys = Object.keys(allData[0]);
                    worksheet.columns = keys.map(k => ({ header: k, key: k }));
                    allData.forEach(item => worksheet.addRow(item));
                }
            }

            // Registro en auditoría
            await supabase.from('audit_log').insert({
                tabla: 'todas',
                operacion: 'INSERT',
                registro_id: '00000000-0000-0000-0000-000000000000',
                datos_nuevos: { operacion_real: 'EXPORTACION_RESPALDO' }
            });

            const fechaStr = format(new Date(), 'yyyyMMdd_HHmmss');
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `respaldo_parroquia_${fechaStr}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);

            alert('Respaldo descargado exitosamente.');
        } catch (error: any) {
            console.error('Error exportando:', error);
            alert('Hubo un error al exportar el respaldo: ' + error.message);
        } finally {
            setExportando(false);
        }
    };

    return (
        <div className="bg-[#F8F9FA] min-h-[calc(100vh-4rem)] p-6 relative">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Settings className="w-7 h-7 text-[#6B1E2E]" />
                    Configuración del Sistema
                </h1>
                <p className="text-gray-500 text-sm mt-1">Administra los parámetros, herramientas y copias de seguridad de la parroquia.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Herramienta de Importación */}
                <div 
                    onClick={() => navigate('/configuracion/importar')}
                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#C9973A] transition-all cursor-pointer group"
                >
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-2">Importación Masiva</h3>
                    <p className="text-gray-500 text-sm">Sube plantillas de Excel con registros históricos para insertarlos rápidamente en la base de datos sin digitar uno a uno.</p>
                </div>

                {/* Solo para PADRE */}
                {esPadre && (
                    <>
                        <div 
                            onClick={() => setModalInformeOpen(true)}
                            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#C9973A] transition-all cursor-pointer group"
                        >
                            <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <BarChart2 className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg mb-2">Informe Parroquial Anual</h3>
                            <p className="text-gray-500 text-sm">
                                Genera un Excel con estilos, resumen estadístico, distribución mensual y tablas completas de todos los sacramentos del año seleccionado.
                            </p>
                        </div>

                        <div 
                            onClick={() => setModalFirmaOpen(true)}
                            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#C9973A] transition-all cursor-pointer group"
                        >
                            <div className="w-12 h-12 bg-rose-50 text-[#6B1E2E] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <ImageIcon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg mb-2">Firma Digital del Párroco</h3>
                            <p className="text-gray-500 text-sm">Sube o actualiza la imagen de tu firma manuscrita para que se adjunte automáticamente en los PDF y Word expedidos.</p>
                        </div>

                        <div 
                            onClick={exportando ? undefined : exportarRespaldoCompleto}
                            className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all ${exportando ? 'opacity-70 cursor-wait' : 'cursor-pointer hover:border-[#C9973A] group'}`}
                        >
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                {exportando ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg mb-2">Exportar Respaldo Global</h3>
                            <p className="text-gray-500 text-sm">Descarga un archivo Excel seguro con la copia exacta de todas las partidas de la parroquia como mecanismo de backup manual.</p>
                        </div>

                        <div 
                            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#C9973A] transition-all cursor-pointer group"
                        >
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg mb-2">Inactividad y Seguridad</h3>
                            <p className="text-gray-500 text-sm">Ajusta los minutos permitidos antes de cerrar automáticamente la sesión de los usuarios del sistema por falta de actividad.</p>
                        </div>
                    </>
                )}
            </div>

            {modalFirmaOpen && <GestorFirma onClose={() => setModalFirmaOpen(false)} />}
            {modalInformeOpen && <ModalInformeAnual onClose={() => setModalInformeOpen(false)} />}
        </div>
    );
}
