import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, UploadCloud, Trash2, X } from 'lucide-react';

interface GestorFirmaProps {
    onClose: () => void;
}

export default function GestorFirma({ onClose }: GestorFirmaProps) {
    const [firmaUrl, setFirmaUrl] = useState<string | null>(null);
    const [cargando, setCargando] = useState(true);
    const [subiendo, setSubiendo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadFirma = async () => {
        try {
            setCargando(true);
            const { data, error } = await supabase.storage.from('firmas').list();
            if (error) {
                console.error('Error listando firmas:', error);
            }
            if (data && data.length > 0) {
                const file = data.find(f => f.name.includes('firma_parroco'));
                if (file) {
                    // Generar Signed URL de 5 minutos (300s) para bucket privado
                    const { data: urlData, error: urlErr } = await supabase.storage
                        .from('firmas')
                        .createSignedUrl(file.name, 300);

                    if (urlErr) {
                        console.error('Error al generar URL firmada:', urlErr);
                        setFirmaUrl(null);
                    } else if (urlData?.signedUrl) {
                        setFirmaUrl(urlData.signedUrl);
                    }
                } else {
                    setFirmaUrl(null);
                }
            } else {
                setFirmaUrl(null);
            }
        } catch (err) {
            console.error('Error cargando firma:', err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        loadFirma();
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo supera los 5MB permitidos.');
            return;
        }
        if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
            alert('Solo se permiten imágenes PNG, JPG o WEBP.');
            return;
        }

        try {
            setSubiendo(true);
            const fileExt = file.type.split('/')[1] || 'png';
            const fileName = `firma_parroco.${fileExt}`;

            // Eliminar archivos anteriores en el bucket privado antes de subir la nueva
            await supabase.storage
                .from('firmas')
                .remove(['firma_parroco.png', 'firma_parroco.jpg', 'firma_parroco.jpeg', 'firma_parroco.webp', fileName]);

            const { error: uploadErr } = await supabase.storage.from('firmas').upload(fileName, file, {
                upsert: true,
                cacheControl: '0',
            });

            if (uploadErr) {
                throw uploadErr;
            }

            alert('Firma guardada correctamente. Se incluirá automáticamente en las próximas expediciones.');
            await loadFirma();
        } catch (error: any) {
            console.error('Error subiendo firma:', error);
            alert('Error al subir la firma: ' + (error.message || 'Verifica los permisos RLS en Supabase.'));
        } finally {
            setSubiendo(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleEliminar = async () => {
        if (!confirm('¿Seguro que deseas eliminar la firma digital? Las partidas dejarán de salir firmadas automáticamente.')) return;

        try {
            setSubiendo(true);
            await supabase.storage
                .from('firmas')
                .remove(['firma_parroco.png', 'firma_parroco.jpeg', 'firma_parroco.jpg', 'firma_parroco.webp']);
            setFirmaUrl(null);
            alert('Firma eliminada exitosamente.');
        } catch (error: any) {
            alert('Error al eliminar: ' + error.message);
        } finally {
            setSubiendo(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full relative animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1 cursor-pointer">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-gray-800 mb-2 font-serif">Firma del Párroco</h2>
                <p className="text-sm text-gray-500 mb-6 font-sans">
                    Esta imagen se incrustará automáticamente sobre la línea "PÁRROCO" al exportar documentos en PDF o Word.
                </p>

                {cargando ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#6B1E2E]" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {firmaUrl ? (
                            <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center bg-gray-50">
                                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-4 font-sans">
                                    Vista Previa Registrada
                                </span>
                                <div className="bg-white p-4 rounded shadow-sm border border-gray-100 mb-4 h-32 flex items-center justify-center w-full max-w-[220px]">
                                    <img src={firmaUrl} alt="Firma Párroco" className="max-h-full max-w-full object-contain" />
                                </div>
                                <button
                                    onClick={handleEliminar}
                                    disabled={subiendo}
                                    className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors text-sm font-medium cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" /> Eliminar Firma
                                </button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mb-4">
                                    <UploadCloud className="w-8 h-8" />
                                </div>
                                <h3 className="text-gray-700 font-medium mb-1 font-sans">No hay firma registrada</h3>
                                <p className="text-gray-500 text-xs max-w-xs mx-auto font-sans">
                                    Recomendamos usar una imagen PNG con fondo transparente.
                                </p>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-100">
                            <input
                                type="file"
                                accept=".png, .jpg, .jpeg, .webp"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleUpload}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={subiendo}
                                className="w-full flex items-center justify-center gap-2 bg-[#6B1E2E] text-white py-2.5 rounded-lg font-medium hover:bg-[#8B293F] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                            >
                                {subiendo ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                                {firmaUrl ? 'Reemplazar Firma Actual' : 'Subir Nueva Firma'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
