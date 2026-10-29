import { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { leerExcelMasivo, ResultadoProcesamiento } from '@/utils/procesarExcel';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';

export default function ImportacionPage() {
    const navigate = useNavigate();
    const [tipoSacramento, setTipoSacramento] = useState('bautismo');
    const [archivo, setArchivo] = useState<File | null>(null);
    const [procesando, setProcesando] = useState(false);
    const [resultado, setResultado] = useState<ResultadoProcesamiento | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDescargarPlantilla = async () => {
        const headers: Record<string, string[]> = {
            'bautismo': ['LIBRO', 'FOLIO', 'NUMERO', 'NOMBRES', 'APELLIDOS', 'FECHA BAUTISMO', 'MINISTRO', 'FECHA NACIMIENTO', 'LUGAR NACIMIENTO', 'NOMBRE PADRE', 'NOMBRE MADRE', 'ABUELOS PATERNOS', 'ABUELOS MATERNOS', 'PADRINO', 'MADRINA', 'DA FE', 'NOTAS'],
            'confirmacion': ['LIBRO', 'FOLIO', 'NUMERO', 'NOMBRES', 'APELLIDOS', 'FECHA CONFIRMACION', 'CELEBRANTE', 'PADRINO', 'MADRINA', 'NOTAS'],
            'matrimonio': ['LIBRO', 'FOLIO', 'NUMERO', 'NOMBRES ESPOSO', 'APELLIDOS ESPOSO', 'NOMBRES ESPOSA', 'APELLIDOS ESPOSA', 'FECHA MATRIMONIO', 'CELEBRANTE', 'NOTAS'],
            'defuncion': ['LIBRO', 'FOLIO', 'NUMERO', 'NOMBRES', 'APELLIDOS', 'FECHA DEFUNCION', 'CAUSA DEFUNCION', 'CELEBRANTE', 'NOTAS']
        };

        const columnas = headers[tipoSacramento] || ['LIBRO', 'FOLIO', 'NUMERO'];
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Plantilla');
        worksheet.addRow(columnas);

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plantilla_${tipoSacramento}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setArchivo(file);
        setProcesando(true);
        setResultado(null);
        try {
            const res = await leerExcelMasivo(file, tipoSacramento);
            setResultado(res);
        } catch (error: any) {
            alert(error.message);
            setArchivo(null);
        } finally {
            setProcesando(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleImportar = async () => {
        if (!resultado || resultado.datosValidos.length === 0) return;
        
        setProcesando(true);
        try {
            const tableName = `sacramentos_${tipoSacramento}`;
            const chunks = [];
            for (let i = 0; i < resultado.datosValidos.length; i += 100) {
                chunks.push(resultado.datosValidos.slice(i, i + 100));
            }

            for (const chunk of chunks) {
                const { error } = await supabase.from(tableName).insert(chunk);
                if (error) throw error;
            }

            await supabase.from('audit_log').insert({
                tabla: tableName,
                operacion: 'INSERT',
                registro_id: '00000000-0000-0000-0000-000000000000',
                datos_nuevos: { importacion_masiva: true, total: resultado.datosValidos.length, archivo: archivo?.name }
            });

            alert(`¡Importación exitosa! Se cargaron ${resultado.datosValidos.length} registros.`);
            navigate('/configuracion');
        } catch (error: any) {
            console.error(error);
            alert('Error al insertar en la base de datos: ' + error.message);
        } finally {
            setProcesando(false);
        }
    };

    return (
        <div className="bg-[#F8F9FA] min-h-[calc(100vh-4rem)] p-6">
            <div className="mb-6 flex items-center gap-4">
                <button onClick={() => navigate('/configuracion')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Importación Histórica</h1>
                    <p className="text-gray-500 text-sm mt-1">Carga masiva de partidas desde plantillas Excel.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-3xl">
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">1. Selecciona el tipo de Sacramento</label>
                    <select 
                        value={tipoSacramento}
                        onChange={(e) => { setTipoSacramento(e.target.value); setResultado(null); setArchivo(null); }}
                        className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#C9973A]"
                    >
                        <option value="bautismo">Bautismos</option>
                        <option value="confirmacion">Confirmaciones</option>
                        <option value="matrimonio">Matrimonios</option>
                        <option value="defuncion">Defunciones</option>
                    </select>
                </div>

                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">2. Descarga la plantilla</p>
                    <button 
                        onClick={handleDescargarPlantilla}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Descargar Plantilla {tipoSacramento.toUpperCase()} (.xlsx)
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">3. Sube el archivo diligenciado</p>
                    <div 
                        onClick={() => !procesando && fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                            archivo ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-[#6B1E2E] hover:bg-gray-50'
                        }`}
                    >
                        <input 
                            type="file" 
                            accept=".xlsx, .xls, .csv" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        {procesando && !resultado ? (
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-10 h-10 text-[#6B1E2E] animate-spin mb-3" />
                                <p className="text-gray-600 font-medium">Procesando y validando filas...</p>
                            </div>
                        ) : archivo ? (
                            <div className="flex flex-col items-center">
                                <FileSpreadsheet className="w-10 h-10 text-green-500 mb-3" />
                                <p className="text-gray-800 font-medium">{archivo.name}</p>
                                <p className="text-sm text-gray-500 mt-1">Haz clic para cambiar archivo</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                                <p className="text-gray-600 font-medium">Haz clic aquí o arrastra tu archivo Excel</p>
                                <p className="text-sm text-gray-400 mt-1">Soporta .xlsx (Máx 10MB)</p>
                            </div>
                        )}
                    </div>
                </div>

                {resultado && (
                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Reporte de Validación</h3>
                        
                        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p className="text-2xl font-bold text-gray-800">{resultado.totalAnalizadas}</p>
                                <p className="text-xs text-gray-500 uppercase font-bold">Total Filas</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                <p className="text-2xl font-bold text-green-600">{resultado.datosValidos.length}</p>
                                <p className="text-xs text-green-700 uppercase font-bold">Listas para importar</p>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                <p className="text-2xl font-bold text-red-600">{resultado.errores.length}</p>
                                <p className="text-xs text-red-700 uppercase font-bold">Con errores</p>
                            </div>
                        </div>

                        {resultado.errores.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-h-40 overflow-y-auto">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-red-800 mb-2">
                                    <AlertCircle className="w-4 h-4" /> Errores detectados (no se importarán)
                                </h4>
                                <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                                    {resultado.errores.slice(0, 50).map((err, i) => (
                                        <li key={i}><strong>Fila {err.fila}:</strong> {err.mensaje}</li>
                                    ))}
                                    {resultado.errores.length > 50 && (
                                        <li>... y {resultado.errores.length - 50} errores más.</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={handleImportar}
                            disabled={procesando || resultado.datosValidos.length === 0}
                            className="w-full flex items-center justify-center py-3 bg-[#6B1E2E] text-white rounded-xl font-bold hover:bg-[#8B293F] transition-colors disabled:opacity-50"
                        >
                            {procesando ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando en base de datos...</>
                            ) : (
                                <><CheckCircle2 className="w-5 h-5 mr-2" /> Importar {resultado.datosValidos.length} registros válidos</>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
