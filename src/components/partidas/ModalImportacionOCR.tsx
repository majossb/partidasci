import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { X, Sparkles, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bautismoSchema } from '@/features/bautismos/bautismos.schema';
import { confirmacionSchema } from '@/features/confirmaciones/confirmaciones.schema';
import { defuncionSchema } from '@/features/defunciones/defunciones.schema';
import { matrimonioSchema } from '@/features/matrimonios/matrimonios.schema';

import { useBautismos } from '@/hooks/useBautismos';
import { useConfirmaciones } from '@/hooks/useConfirmaciones';
import { useDefunciones } from '@/hooks/useDefunciones';
import { useMatrimonios } from '@/hooks/useMatrimonios';


import { supabase } from '@/lib/supabase';
import { sanitizeText } from '@/utils/sanitize';
import { PARROQUIA_CONFIG } from '@/utils/constantes';
import {
    MENSAJE_IMAGEN_NO_LEGIBLE,
    validarFormatoArchivo,
    validarDimensionesImagen,
    validarContrasteCanvas,
    validarDatosExtraidosLegibles
} from '@/utils/validarCalidadImagen';
import PasoSubida from './ocr/PasoSubida';
import PasoProcesando from './ocr/PasoProcesando';
import PasoRevision from './ocr/PasoRevision';

interface ModalImportacionOCRProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    tipo?: 'bautismo' | 'confirmacion' | 'defuncion' | 'matrimonio';
}

export interface ImageEntry {
    id: string;
    file: File;
    previewUrl: string;
    status: 'pending' | 'processing' | 'success' | 'error';
    extractedData?: any;
    error?: string;
    skip: boolean;
    saved?: boolean;
    esMasivo?: boolean;
}

let entryIdCounter = 0;
function generateEntryId() {
    return `img_${Date.now()}_${entryIdCounter++}`;
}

const MAX_IMAGE_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

/**
 * Reads a File, resizes it to max 1600px on the longest side, and returns
 * a compressed JPEG data-URL. This replaces the old FileReader approach and
 * eliminates the polling loop that waited for previewUrl.
 */
const compressAndPreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        // 1. Validar formato de archivo (JPG o PNG)
        const formatoCheck = validarFormatoArchivo(file);
        if (!formatoCheck.esLegible) {
            reject(new Error(formatoCheck.error || MENSAJE_IMAGEN_NO_LEGIBLE));
            return;
        }

        const reader = new FileReader();
        reader.onerror = () => reject(new Error(MENSAJE_IMAGEN_NO_LEGIBLE));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error(MENSAJE_IMAGEN_NO_LEGIBLE));
            img.onload = () => {
                let { naturalWidth: w, naturalHeight: h } = img;

                // 2. Validar dimensiones mínimas para legibilidad de texto
                const dimCheck = validarDimensionesImagen(w, h);
                if (!dimCheck.esLegible) {
                    reject(new Error(dimCheck.error || MENSAJE_IMAGEN_NO_LEGIBLE));
                    return;
                }

                if (Math.max(w, h) > MAX_IMAGE_DIMENSION) {
                    const scale = MAX_IMAGE_DIMENSION / Math.max(w, h);
                    w = Math.round(w * scale);
                    h = Math.round(h * scale);
                }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                if (!ctx) { reject(new Error('No se pudo obtener el contexto 2D')); return; }
                ctx.drawImage(img, 0, 0, w, h);

                // 3. Validar contraste del canvas (descartar imágenes vacías, completamente negras o blancas)
                const contrasteCheck = validarContrasteCanvas(ctx, w, h);
                if (!contrasteCheck.esLegible) {
                    reject(new Error(contrasteCheck.error || MENSAJE_IMAGEN_NO_LEGIBLE));
                    return;
                }

                resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    });
};

const cropSignatureFromImage = (previewUrl: string, bbox: number[]): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const [yMin, xMin, yMax, xMax] = bbox;
            const width = img.naturalWidth;
            const height = img.naturalHeight;

            // Coordenadas normalizadas (0-1000) a píxeles reales
            const x = (xMin / 1000) * width;
            const y = (yMin / 1000) * height;
            const w = ((xMax - xMin) / 1000) * width;
            const h = ((yMax - yMin) / 1000) * height;

            // Recorta la región con padding de 15 píxeles
            const padding = 15;
            const cropX = Math.max(0, x - padding);
            const cropY = Math.max(0, y - padding);
            const cropW = Math.min(width - cropX, w + padding * 2);
            const cropH = Math.min(height - cropY, h + padding * 2);

            const canvas = document.createElement('canvas');
            canvas.width = cropW;
            canvas.height = cropH;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('No se pudo obtener el contexto 2D del canvas'));
                return;
            }

            ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
            reject(new Error('Error al cargar la imagen original para recortar la firma'));
        };
        img.src = previewUrl;
    });
};

export default function ModalImportacionOCR({ isOpen, onClose, onSuccess, tipo = 'bautismo' }: ModalImportacionOCRProps) {
    const [images, setImages] = useState<ImageEntry[]>([]);
    const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
    const [processingIndex, setProcessingIndex] = useState(0);
    const [processingMessage, setProcessingMessage] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [savingAll, setSavingAll] = useState(false);
    const [saveResults, setSaveResults] = useState<{ saved: number; errors: number; skipped: number } | null>(null);
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const addMoreRef = useRef<HTMLInputElement>(null);

    const isBulkMode = useMemo(() => images.some(img => img.esMasivo), [images]);

    const handleUpdateFieldDirectly = useCallback((id: string, field: string, value: any) => {
        setImages(prev => prev.map(img => {
            if (img.id === id) {
                return {
                    ...img,
                    extractedData: {
                        ...img.extractedData,
                        [field]: value === '' ? null : value
                    }
                };
            }
            return img;
        }));
    }, []);

    const handleDeleteRow = useCallback((id: string) => {
        setImages(prev => {
            const newLen = prev.filter(img => img.id !== id).length;
            setActiveIndex(prevIdx => Math.max(0, Math.min(prevIdx, newLen - 1)));
            return prev.filter(img => img.id !== id);
        });
    }, []);

    const { fetchNextFolioNumero: fetchNextBautismo, create: createBautismo } = useBautismos();
    const { fetchNextFolioNumero: fetchNextConfirmacion, create: createConfirmacion } = useConfirmaciones();
    const { fetchNextFolioNumero: fetchNextDefuncion, create: createDefuncion } = useDefunciones();
    const { fetchNextFolioNumero: fetchNextMatrimonio, create: createMatrimonio } = useMatrimonios();

    const fetchNextFolioNumero = {
        bautismo: fetchNextBautismo,
        confirmacion: fetchNextConfirmacion,
        defuncion: fetchNextDefuncion,
        matrimonio: fetchNextMatrimonio
    }[tipo];

    const create = {
        bautismo: createBautismo,
        confirmacion: createConfirmacion,
        defuncion: createDefuncion,
        matrimonio: createMatrimonio
    }[tipo];

    const schema = {
        bautismo: bautismoSchema,
        confirmacion: confirmacionSchema,
        defuncion: defuncionSchema,
        matrimonio: matrimonioSchema
    }[tipo];

    const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
    const [detectedSchema, setDetectedSchema] = useState<any>(null);

    const getDefaultValues = (t: typeof tipo) => {
        const base = {
            parroquia: PARROQUIA_CONFIG.nombre,
            anotaciones: '',
            da_fe: '',
            firma_base64: null
        };
        return base;
    };

    const { register, formState: { errors }, reset, getValues, setValue, watch } = useForm<any>({
        resolver: zodResolver(schema),
        defaultValues: getDefaultValues(tipo)
    });

    // Reset everything when modal closes
    useEffect(() => {
        if (!isOpen) {
            setImages([]);
            setStep('upload');
            setProcessingIndex(0);
            setProcessingMessage('');
            setActiveIndex(0);
            setSavingAll(false);
            setSaveResults(null);
            setErrorGuardar(null);
            setDetectedSchema(null);
            reset(getDefaultValues(tipo));
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (addMoreRef.current) addMoreRef.current.value = '';
        }
    }, [isOpen, reset, tipo]);

    // Load form data when switching between images in review step
    useEffect(() => {
        if (step === 'review' && images[activeIndex]?.extractedData) {
            reset(images[activeIndex].extractedData);
        }
    }, [activeIndex, step, images, reset]);

    const handleFilesSelected = useCallback((files: FileList | null) => {
        if (!files || files.length === 0) return;

        const fileList = Array.from(files);
        if (fileList.length === 0) return;

        // Create entries with empty previewUrl immediately so the UI shows placeholders
        const newEntries: ImageEntry[] = fileList.map(file => ({
            id: generateEntryId(),
            file,
            previewUrl: '',
            status: 'pending' as const,
            skip: false
        }));

        setImages(prev => [...prev, ...newEntries]);

        // Compress all images in parallel and update previews as they complete
        Promise.all(
            newEntries.map(entry =>
                compressAndPreview(entry.file).then(dataUrl => {
                    setImages(prev =>
                        prev.map(p => p.id === entry.id ? { ...p, previewUrl: dataUrl } : p)
                    );
                }).catch(err => {
                    console.error(`Error procesando archivo ${entry.file.name}:`, err);
                    setImages(prev =>
                        prev.map(p => p.id === entry.id ? {
                            ...p,
                            status: 'error',
                            error: err?.message || MENSAJE_IMAGEN_NO_LEGIBLE
                        } : p)
                    );
                })
            )
        );
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleFilesSelected(e.target.files);
        if (e.target) e.target.value = '';
    }, [handleFilesSelected]);

    const removeImage = useCallback((id: string) => {
        setImages(prev => prev.filter(img => img.id !== id));
    }, []);

    // Convierte texto a Title Case: "LAURA MARIA" â†’ "Laura Maria"
    const toTitleCase = (val: string): string => {
        return val
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const formatNoRegistra = (val: any) => {
        if (!val) return 'No registra';
        const trimmed = String(val).trim();
        const lower = trimmed.toLowerCase();
        if (
            lower === '' ||
            lower === 'n/a' ||
            lower === 'na' ||
            lower === 'no registra' ||
            lower === 'no se registra' ||
            lower === 'no registrado' ||
            lower === 'no consta' ||
            lower === 'no menciona' ||
            lower === 'no tiene' ||
            lower === 'nr' ||
            lower === 'n.r.'
        ) {
            return 'No registra';
        }
        return toTitleCase(trimmed);
    };

    const extractFromImage = async (
        previewUrl: string,
        file: File,
        folioHint: number,
        numeroHint: number,
        prevSchema: any
    ): Promise<any> => {
        const base64Image = previewUrl.split(',')[1];
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

        const { data, error } = await supabase.functions.invoke('ocr-sacramento', {
            body: {
                imageBase64: base64Image,
                mimeType,
                tipo,
                prevSchema
            }
        });

        if (error) {
            throw new Error(`Error en servicio OCR: ${error.message || MENSAJE_IMAGEN_NO_LEGIBLE}`);
        }

        if (!data || !data.candidates?.[0]?.content?.parts?.[0]?.text) {
            if (data?.error) {
                throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
            }
            throw new Error(MENSAJE_IMAGEN_NO_LEGIBLE);
        }

        const text = data.candidates[0].content.parts[0].text;
        const cleanText = text.replace(/```json|```/gi, "").trim();
        let parsed: any;
        try {
            parsed = JSON.parse(cleanText);
        } catch {
            throw new Error(MENSAJE_IMAGEN_NO_LEGIBLE);
        }

        // Validación de calidad y legibilidad de los datos devueltos por la IA
        const validacionLegibilidad = validarDatosExtraidosLegibles(tipo, parsed);
        if (!validacionLegibilidad.esLegible) {
            throw new Error(validacionLegibilidad.error || MENSAJE_IMAGEN_NO_LEGIBLE);
        }

        const registrosRaw = Array.isArray(parsed.registros) && parsed.registros.length > 0
            ? parsed.registros
            : [parsed];

        const registrosMapeados = await Promise.all(registrosRaw.map(async (reg: any, index: number) => {
            const folioVal = reg.folio && !isNaN(parseInt(reg.folio)) ? parseInt(reg.folio) : folioHint;
            const numeroVal = reg.numero && !isNaN(parseInt(reg.numero)) ? parseInt(reg.numero) : (numeroHint + index);

            let record: any = {
                libro: reg.libro || '',
                folio: folioVal,
                numero: numeroVal,
                parroquia: reg.parroquia ? toTitleCase(String(reg.parroquia).trim()) : PARROQUIA_CONFIG.nombre,
                da_fe: reg.da_fe ? toTitleCase(String(reg.da_fe).trim()) : '',
                anotaciones: reg.anotaciones || '',
            };

            if (tipo === 'bautismo') {
                record = {
                    ...record,
                    fecha_bautismo: reg.fecha_bautismo || '',
                    fecha_nacimiento: reg.fecha_nacimiento || '',
                    nombre_bautizado: reg.nombre_bautizado ? toTitleCase(String(reg.nombre_bautizado).trim()) : '',
                    apellidos_bautizado: reg.apellidos_bautizado ? toTitleCase(String(reg.apellidos_bautizado).trim()) : '',
                    lugar_nacimiento: formatNoRegistra(reg.lugar_nacimiento),
                    nombre_padre: formatNoRegistra(reg.nombre_padre),
                    nombre_madre: formatNoRegistra(reg.nombre_madre),
                    abuelos_paternos: formatNoRegistra(reg.abuelos_paternos),
                    abuelos_maternos: formatNoRegistra(reg.abuelos_maternos),
                    padrino: formatNoRegistra(reg.padrino),
                    madrina: formatNoRegistra(reg.madrina),
                    ministro: formatNoRegistra(reg.ministro),
                };
            } else if (tipo === 'confirmacion') {
                record = {
                    ...record,
                    nombre_confirmado: reg.nombre_confirmado ? toTitleCase(String(reg.nombre_confirmado).trim()) : '',
                    apellidos_confirmado: reg.apellidos_confirmado ? toTitleCase(String(reg.apellidos_confirmado).trim()) : '',
                    fecha_confirmacion: reg.fecha_confirmacion || '',
                    anio_confirmacion: reg.anio_confirmacion || '',
                    fecha_nacimiento: reg.fecha_nacimiento || '',
                    lugar_nacimiento: formatNoRegistra(reg.lugar_nacimiento),
                    lugar_confirmacion: reg.lugar_confirmacion || PARROQUIA_CONFIG.nombre,
                    nombre_padre: formatNoRegistra(reg.nombre_padre),
                    nombre_madre: formatNoRegistra(reg.nombre_madre),
                    padrino_madrina: formatNoRegistra(reg.padrino_madrina),
                    ministro: formatNoRegistra(reg.ministro),
                    obispo: formatNoRegistra(reg.obispo),
                    parroquia_bautismo: formatNoRegistra(reg.parroquia_bautismo),
                    diocesis: formatNoRegistra(reg.diocesis),
                    dia_semana: reg.dia_semana || '',
                    numero_libro_bautismo: reg.numero_libro_bautismo || '',
                    folio_bautismo: reg.folio_bautismo || '',
                    numero_bautismo: reg.numero_bautismo || '',
                };
            } else if (tipo === 'defuncion') {
                record = {
                    ...record,
                    nombre_difunto: reg.nombre_difunto ? toTitleCase(String(reg.nombre_difunto).trim()) : '',
                    apellidos_difunto: reg.apellidos_difunto ? toTitleCase(String(reg.apellidos_difunto).trim()) : '',
                    fecha_defuncion: reg.fecha_defuncion || '',
                    edad: reg.edad || '',
                    lugar_origen: formatNoRegistra(reg.lugar_origen),
                    estado_civil: reg.estado_civil || '',
                    padre_difunto: formatNoRegistra(reg.padre_difunto),
                    madre_difunto: formatNoRegistra(reg.madre_difunto),
                    causa_muerte: reg.causa_muerte || '',
                };
            } else if (tipo === 'matrimonio') {
                let firmaBase64 = null;
                if (reg.firma_bbox && Array.isArray(reg.firma_bbox) && reg.firma_bbox.length === 4) {
                    try {
                        firmaBase64 = await cropSignatureFromImage(previewUrl, reg.firma_bbox);
                    } catch (cropErr) {
                        console.error("Error cropping signature:", cropErr);
                    }
                }
                record = {
                    ...record,
                    fecha_matrimonio: reg.fecha_matrimonio || '',
                    nombre_esposo: reg.nombre_esposo ? toTitleCase(String(reg.nombre_esposo).trim()) : '',
                    apellidos_esposo: reg.apellidos_esposo ? toTitleCase(String(reg.apellidos_esposo).trim()) : '',
                    nombre_esposa: reg.nombre_esposa ? toTitleCase(String(reg.nombre_esposa).trim()) : '',
                    apellidos_esposa: reg.apellidos_esposa ? toTitleCase(String(reg.apellidos_esposa).trim()) : '',
                    padre_esposo: formatNoRegistra(reg.padre_esposo),
                    madre_esposo: formatNoRegistra(reg.madre_esposo),
                    padre_esposa: formatNoRegistra(reg.padre_esposa),
                    madre_esposa: formatNoRegistra(reg.madre_esposa),
                    parroquia_bautismo_esposo: formatNoRegistra(reg.parroquia_bautismo_esposo),
                    fecha_bautismo_esposo: reg.fecha_bautismo_esposo || '',
                    libro_bautismo_esposo: reg.libro_bautismo_esposo || '',
                    folio_bautismo_esposo: reg.folio_bautismo_esposo || '',
                    numero_bautismo_esposo: reg.numero_bautismo_esposo || '',
                    parroquia_bautismo_esposa: formatNoRegistra(reg.parroquia_bautismo_esposa),
                    fecha_bautismo_esposa: reg.fecha_bautismo_esposa || '',
                    libro_bautismo_esposa: reg.libro_bautismo_esposa || '',
                    folio_bautismo_esposa: reg.folio_bautismo_esposa || '',
                    numero_bautismo_esposa: reg.numero_bautismo_esposa || '',
                    testigo1: formatNoRegistra(reg.testigo1),
                    testigo2: formatNoRegistra(reg.testigo2),
                    presencio: reg.presencio ? toTitleCase(String(reg.presencio).trim()) : '',
                    firma_base64: firmaBase64,
                };
            }

            return record;
        }));

        return {
            modo_extraccion: parsed.modo_extraccion || (registrosMapeados.length > 1 ? 'masivo' : 'individual'),
            registros: registrosMapeados,
            esquema_columnas: parsed.esquema_columnas || { tiene_encabezados: false, columnas: null, descripcion: null }
        };
    };

    const handleProcessAll = async () => {
        if (images.length === 0) return;

        setStep('processing');
        setProcessingIndex(0);

        // Get initial folio/numero from DB
        const nextIds = await fetchNextFolioNumero();
        let currentFolio = nextIds.folio;
        let currentNumero = nextIds.numero;

        let localSchema = detectedSchema;

        const updatedImages = [...images];

        for (let i = 0; i < updatedImages.length; i++) {
            setProcessingIndex(i);
            setProcessingMessage('');

            // Si la imagen ya fue detectada como ilegible o con error de formato previo
            if (updatedImages[i].status === 'error') {
                continue;
            }

            // Ensure previewUrl is ready (compressAndPreview may still be running)
            if (!updatedImages[i].previewUrl) {
                try {
                    updatedImages[i].previewUrl = await compressAndPreview(updatedImages[i].file);
                } catch (err: any) {
                    updatedImages[i].status = 'error';
                    updatedImages[i].error = err?.message || MENSAJE_IMAGEN_NO_LEGIBLE;
                    setImages([...updatedImages]);
                    continue;
                }
            }

            updatedImages[i].status = 'processing';
            setImages([...updatedImages]);

            try {
                const extracted = await extractFromImage(
                    updatedImages[i].previewUrl,
                    updatedImages[i].file,
                    currentFolio,
                    currentNumero,
                    localSchema
                );

                // Si la IA detectó un esquema de columnas en esta página, lo guardamos para las siguientes
                if (extracted.esquema_columnas?.tiene_encabezados && extracted.esquema_columnas.descripcion) {
                    localSchema = {
                        tipo: tipo,
                        columnas: extracted.esquema_columnas.columnas || [],
                        descripcion: extracted.esquema_columnas.descripcion
                    };
                    setDetectedSchema(localSchema);
                }

                updatedImages[i].status = 'success';
                updatedImages[i].extractedData = extracted;

                // Increment folio/numero for next image
                if (extracted.registros?.length > 0) {
                    const ultimoReg = extracted.registros[extracted.registros.length - 1];
                    currentNumero = (Number(ultimoReg.numero) || currentNumero) + 1;
                    currentFolio = Number(ultimoReg.folio) || currentFolio;
                } else {
                    currentNumero = ((extracted.numero as number) || currentNumero) + 1;
                    currentFolio = (extracted.folio as number) || currentFolio;
                }

            } catch (error: any) {
                console.error(`Error processing image ${i}:`, error);
                updatedImages[i].status = 'error';
                updatedImages[i].error = error.message || MENSAJE_IMAGEN_NO_LEGIBLE;
            }

            setImages([...updatedImages]);

            // Delay between images to respect rate limits
            if (i < updatedImages.length - 1 && updatedImages[i].status === 'success') {
                const delayMs = updatedImages.length > 5 ? 3000 : 1500;
                setProcessingMessage(`Esperando antes de procesar la siguiente imagen...`);
                await new Promise(r => setTimeout(r, delayMs));
            }
        }

        setProcessingMessage('');

        // Aplanar imÃ¡genes si hay partidas mÃºltiples
        let finalEntries: ImageEntry[] = [];
        for (const img of updatedImages) {
            if (img.status === 'success' && img.extractedData?.registros) {
                const registros = img.extractedData.registros;
                const modoMasivo = img.extractedData.modo_extraccion === 'masivo' || registros.length > 1;
                registros.forEach((reg: any, idx: number) => {
                    finalEntries.push({
                        ...img,
                        id: `${img.id}_rec_${idx}`,
                        extractedData: reg,
                        esMasivo: modoMasivo
                    });
                });
            } else {
                finalEntries.push(img);
            }
        }

        setImages(finalEntries);

        // Find first successful image to show
        const firstSuccess = finalEntries.findIndex(img => img.status === 'success');
        setActiveIndex(firstSuccess >= 0 ? firstSuccess : 0);
        setStep('review');
    };

    // Obtener las imÃ¡genes con los cambios del formulario actual aplicados de forma sÃ­ncrona
    const getLatestImagesWithCurrentEdits = (): ImageEntry[] => {
        if (step !== 'review') return images;
        if (isBulkMode) return images;
        const currentData = getValues();
        return images.map((img, idx) =>
            idx === activeIndex && img.status === 'success'
                ? { ...img, extractedData: { ...currentData } }
                : img
        );
    };

    // Save current form edits back to the images array before navigating
    const saveCurrentEdits = () => {
        if (step !== 'review') return;
        if (isBulkMode) return;
        const currentData = getValues();
        setImages(prev => prev.map((img, idx) =>
            idx === activeIndex && img.status === 'success'
                ? { ...img, extractedData: { ...currentData } }
                : img
        ));
    };

    const navigateTo = (index: number) => {
        saveCurrentEdits();
        setActiveIndex(index);
        setErrorGuardar(null);
    };

    const navigatePrev = () => {
        if (activeIndex > 0) navigateTo(activeIndex - 1);
    };

    const navigateNext = () => {
        if (activeIndex < images.length - 1) navigateTo(activeIndex + 1);
    };

    const toggleSkip = (index: number) => {
        if (!isBulkMode) {
            saveCurrentEdits();
        }
        setImages(prev => prev.map((img, idx) =>
            idx === index ? { ...img, skip: !img.skip } : img
        ));
    };

    const handleSaveAll = async () => {
        // Guardamos los cambios actuales en el estado
        if (!isBulkMode) {
            saveCurrentEdits();
        }

        setSavingAll(true);
        setErrorGuardar(null);

        let saved = 0;
        let errorsCount = 0;
        let skipped = 0;

        // Obtenemos la versiÃ³n mÃ¡s reciente de la lista con los edits actuales sÃ­ncronamente
        const latestImages = getLatestImagesWithCurrentEdits();

        // 1. Filtramos las imÃ¡genes que realmente vamos a guardar (exitosas, no guardadas previamente y no omitidas)
        const toSave = latestImages.filter(img => !img.skip && img.status === 'success' && !img.saved && img.extractedData);

        // 2. Las ordenamos de manera ascendente por folio y nÃºmero para insertarlas en orden correcto
        toSave.sort((a, b) => {
            const folioA = a.extractedData?.folio ?? 0;
            const folioB = b.extractedData?.folio ?? 0;
            if (folioA !== folioB) return Number(folioA) - Number(folioB);
            const numA = a.extractedData?.numero ?? 0;
            const numB = b.extractedData?.numero ?? 0;
            return Number(numA) - Number(numB);
        });

        // 3. Mapa para recolectar el resultado de guardado por id de imagen
        const resultsMap = new Map<string, { success: boolean; error?: string }>();

        // 4. Guardamos cada partida en la base de datos previa validación de esquema
        for (const img of toSave) {
            try {
                const { esquema_columnas, modo_extraccion, ...dataToSave } = img.extractedData! as any;
                const sanitizedData = {
                    ...dataToSave,
                    anotaciones: sanitizeText(dataToSave.anotaciones),
                    da_fe: sanitizeText(dataToSave.da_fe),
                };

                // Validación previa con Zod
                if (schema) {
                    const validation = schema.safeParse(sanitizedData);
                    if (!validation.success) {
                        errorsCount++;
                        const primerError = validation.error.errors[0]?.message || 'Datos incompletos o con formato inválido';
                        resultsMap.set(img.id, {
                            success: false,
                            error: primerError,
                        });
                        continue;
                    }
                }

                await create(sanitizedData);
                saved++;
                resultsMap.set(img.id, { success: true });
            } catch (err: any) {
                errorsCount++;
                console.error(`Error saving record with ID ${img.id}:`, err);
                const is23505 = err?.code === '23505' || err?.message?.includes('23505') || err?.message?.includes('duplicate key');
                resultsMap.set(img.id, {
                    success: false,
                    error: is23505
                        ? 'Ya existe una partida con este Libro, Folio y Número en los registros parroquiales'
                        : err.message || 'Error al guardar'
                });
            }
        }

        // 5. Mapeamos los resultados de vuelta a la lista original de imÃ¡genes para no desorganizar la vista ni el activeIndex
        const updatedImages = latestImages.map(img => {
            if (img.skip) {
                skipped++;
                return img;
            }
            if (img.status !== 'success' || !img.extractedData) {
                return img;
            }
            if (img.saved) {
                return img;
            }

            const result = resultsMap.get(img.id);
            if (result) {
                if (result.success) {
                    return { ...img, saved: true, error: undefined }; // Marcar como guardada y sin error
                } else {
                    return { ...img, error: result.error }; // Guardar el mensaje de error especÃ­fico
                }
            }
            return img;
        });

        setImages(updatedImages);
        setSavingAll(false);
        setSaveResults({ saved, errors: errorsCount, skipped });

        if (errorsCount === 0) {
            // All saved successfully - close after a brief delay
            setTimeout(() => {
                onSuccess();
            }, 1500);
        }
    };

    const successCount = useMemo(() => images.filter(img => img.status === 'success' && !img.skip).length, [images]);
    const pendingSaveCount = useMemo(() => images.filter(img => img.status === 'success' && !img.skip && !img.saved).length, [images]);
    const savedCount = useMemo(() => images.filter(img => img.saved).length, [images]);
    const errorCount = useMemo(() => images.filter(img => img.status === 'error').length, [images]);
    const activeImage = images[activeIndex];
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl flex flex-col my-8 max-h-[92vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-border bg-[#7B1C2E] text-white rounded-t-2xl shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent-yellow" />
                        Importar {
                            tipo === 'bautismo' ? 'Bautismos' :
                            tipo === 'confirmacion' ? 'Confirmaciones' :
                            tipo === 'defuncion' ? 'Defunciones' : 'Matrimonios'
                        } con Inteligencia Artificial
                    </h2>
                    <div className="flex items-center gap-3">
                        {/* Step indicators */}
                        <div className="hidden sm:flex items-center gap-1 text-sm mr-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${step === 'upload' ? 'bg-white text-[#7B1C2E]' : 'bg-white/20 text-white/70'}`}>1. Subir</span>
                            <ChevronRight className="w-3 h-3 text-white/40" />
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${step === 'processing' ? 'bg-white text-[#7B1C2E]' : 'bg-white/20 text-white/70'}`}>2. Procesar</span>
                            <ChevronRight className="w-3 h-3 text-white/40" />
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${step === 'review' ? 'bg-white text-[#7B1C2E]' : 'bg-white/20 text-white/70'}`}>3. Revisar</span>
                        </div>
                        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors" disabled={savingAll}>
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 bg-[#F8F9FA] overflow-y-auto">

                    {/* ===== STEP 1: UPLOAD ===== */}
                    {step === 'upload' && (
                        <PasoSubida
                            images={images}
                            fileInputRef={fileInputRef}
                            addMoreRef={addMoreRef}
                            handleFileChange={handleFileChange}
                            removeImage={removeImage}
                            handleProcessAll={handleProcessAll}
                        />
                    )}

                    {/* ===== STEP 2: PROCESSING ===== */}
                    {step === 'processing' && (
                        <PasoProcesando
                            images={images}
                            processingIndex={processingIndex}
                            processingMessage={processingMessage}
                        />
                    )}

                    {/* ===== STEP 3: REVIEW ===== */}
                    {step === 'review' && (
                        <PasoRevision
                            images={images}
                            tipo={tipo}
                            isBulkMode={isBulkMode}
                            activeIndex={activeIndex}
                            setActiveIndex={setActiveIndex}
                            savingAll={savingAll}
                            saveResults={saveResults}
                            errorGuardar={errorGuardar}
                            expandedRows={expandedRows}
                            setExpandedRows={setExpandedRows}
                            handleUpdateFieldDirectly={handleUpdateFieldDirectly}
                            handleDeleteRow={handleDeleteRow}
                            toggleSkip={toggleSkip}
                            onClose={onClose}
                            handleSaveAll={handleSaveAll}
                            register={register}
                            errors={errors}
                            watch={watch}
                            successCount={successCount}
                            pendingSaveCount={pendingSaveCount}
                            savedCount={savedCount}
                            errorCount={errorCount}
                            activeImage={activeImage}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

