import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { PARROQUIA_CONFIG } from '../../utils/constantes';

interface CertificadoDefuncionProps {
    data: any;
    textoExpedicion?: string;
    firmaUrl?: string | null;
    firmaScale?: number;
    firmaOffsetY?: number;
    firmaOffsetX?: number;
}

export default function CertificadoDefuncion({ 
    data, 
    textoExpedicion, 
    firmaUrl, 
    firmaScale = 1, 
    firmaOffsetY = 0,
    firmaOffsetX = 0
}: CertificadoDefuncionProps) {
    if (!data) return null;

    const textoExpedicionFinal = textoExpedicion || `ES FIEL COPIA DEL ORIGINAL EXPEDIDA EN ${PARROQUIA_CONFIG.ciudad.toUpperCase()} A LOS ${format(new Date(), "d 'DIAS DEL MES DE' MMMM 'DE' yyyy", { locale: es }).toUpperCase()}.`;

    const mostrarEtiquetaEdad = (edad: string | null) => {
        if (!edad) return 'AÑOS DE EDAD';
        const lower = String(edad).toLowerCase();
        if (lower.includes('año') || lower.includes('mes') || lower.includes('dia') || lower.includes('día') || lower.includes('nacido') || lower.includes('registra')) {
            return '';
        }
        return 'AÑOS DE EDAD';
    };

    return (
        <div id="certificado-defuncion-export" className="bg-white p-12 font-serif text-black relative w-[800px] mx-auto">
            {/* Encabezado lateral */}
            <div className="flex items-center justify-between border-b border-black pb-4 mb-6 relative">
                <div className="w-28 h-28 flex items-center justify-start overflow-hidden">
                    <img src="/logo-diocesis.svg" alt="" className="max-w-full max-h-full object-contain opacity-70" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>

                <div className="text-center font-bold text-sm italic flex-1">
                    <p>{PARROQUIA_CONFIG.diocesis.toUpperCase()}</p>
                    <p>{PARROQUIA_CONFIG.nombre.toUpperCase()}</p>
                    <p>NIT. 900.000.000-1</p>
                </div>

                <div className="w-28 h-32 flex items-center justify-end overflow-hidden">
                    <img src={PARROQUIA_CONFIG.logoUrl} alt={`Logo ${PARROQUIA_CONFIG.nombre}`} className="w-full h-full object-contain" />
                </div>
            </div>

            <h2 className="text-center font-bold text-sm italic mb-2">ACTA DE DEFUNCIÓN</h2>

            <div className="border border-black p-8 text-sm font-bold italic relative">
                <div className="ml-8 mb-8 space-y-2">
                    <div className="flex items-end">
                        <span className="w-24 text-base">LIBRO:</span>
                        <span className="border-b border-black inline-block w-64 text-center font-sans not-italic text-base leading-tight uppercase font-bold">{data.libro || '\u00A0'}</span>
                    </div>
                    <div className="flex items-end">
                        <span className="w-24 text-base">FOLIO:</span>
                        <span className="border-b border-black inline-block w-64 text-center font-sans not-italic text-base leading-tight uppercase font-bold">{data.folio}</span>
                    </div>
                    <div className="flex items-end">
                        <span className="w-24 text-base">NUMERO:</span>
                        <span className="border-b border-black inline-block w-64 text-center font-sans not-italic text-base leading-tight uppercase font-bold">{data.numero}</span>
                    </div>
                </div>

                <div className="text-center mb-8 text-base uppercase tracking-wider">
                    EN LA {PARROQUIA_CONFIG.nombre.toUpperCase()}
                </div>

                <style>
                    {`
                    .de-line { display: flex; align-items: flex-end; margin-bottom: 2rem; }
                    .de-label { min-width: 200px; display: inline-block; text-align: left; white-space: nowrap; margin-right: 0.5rem; font-size: 1.05rem; }
                    .de-val { flex-grow: 1; border-bottom: 1px solid #000; text-align: center; font-family: sans-serif; font-style: normal; text-transform: uppercase; line-height: 1.6; font-size: 1.15rem; }
                    `}
                </style>

                <div className="de-line">
                    <span className="de-label">A:</span>
                    <span className="border-b border-black inline-block w-64 text-center font-sans not-italic text-base leading-tight uppercase font-bold">
                        {data.fecha_defuncion ? format(parseISO(data.fecha_defuncion), "d 'DE' MMMM", { locale: es }) : 'NO REGISTRA'}
                    </span>
                    <span className="ml-4 mr-2 text-base not-italic font-bold">DE:</span>
                    <span className="border-b border-black inline-block w-24 text-center font-sans not-italic text-base uppercase font-bold">
                        {data.fecha_defuncion ? format(parseISO(data.fecha_defuncion), "yyyy") : 'NO REGISTRA'}
                    </span>
                </div>

                <div className="de-line">
                    <span className="de-label">NATURAL DE:</span>
                    <span className="de-val">{data.lugar_origen || 'NO REGISTRA'}</span>
                </div>

                <div className="flex flex-col items-center justify-center mt-6 mb-8 w-full">
                    <span className="text-base font-bold italic mb-2 tracking-wide text-center w-full">NOMBRES Y APELLIDOS DEL DIFUNTO</span>
                    <span className="w-full text-center font-sans not-italic uppercase font-bold text-xl border-b border-black pb-2">
                        {data.nombre_difunto} {data.apellidos_difunto}
                    </span>
                </div>

                <div className="de-line">
                    <span className="de-label">DE:</span>
                    <span className="de-val">{data.edad || '\u00A0'}</span>
                    <span className="ml-2 text-base not-italic">{mostrarEtiquetaEdad(data.edad)}</span>
                </div>

                <div className="de-line">
                    <span className="de-label">HIJO(A) DE:</span>
                    <span className="de-val">{[data.padre_difunto, data.madre_difunto].filter(Boolean).join(' y ') || 'NO REGISTRA'}</span>
                </div>

                <div className="de-line">
                    <span className="de-label">ESTADO CIVIL:</span>
                    <span className="de-val">{data.estado_civil || 'NO REGISTRA'}</span>
                </div>

                <div className="de-line">
                    <span className="de-label">CAUSA DE MUERTE:</span>
                    <span className="de-val">{data.causa_muerte || 'NO REGISTRA'}</span>
                </div>

                <div className="mt-14 mb-14 flex items-end relative">
                    <span className="de-label">DOY FE:</span>
                    <span className="de-val font-sans not-italic uppercase font-bold min-w-64 inline-block text-center relative">
                        <span className="relative z-10">{data.da_fe || 'EL PÁRROCO'}</span>
                        {firmaUrl && (
                            <img 
                                src={firmaUrl} 
                                alt="Firma del Párroco" 
                                className="absolute pointer-events-none left-1/2 -translate-x-1/2"
                                style={{
                                    transform: `translate(${firmaOffsetX}px, ${firmaOffsetY}px) scale(${firmaScale})`,
                                    height: '75px',
                                    bottom: '-15px',
                                    zIndex: 10
                                }}
                            />
                        )}
                    </span>
                </div>

                <div className="text-center text-xs uppercase rounded px-2 py-1 mt-4 font-sans not-italic">
                    {textoExpedicionFinal}
                </div>
            </div>
        </div>
    );
}
