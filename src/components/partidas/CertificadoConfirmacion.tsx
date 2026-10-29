import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { PARROQUIA_CONFIG } from '../../utils/constantes';

interface CertificadoConfirmacionProps {
    data: any;
    textoExpedicion?: string;
    firmaUrl?: string | null;
    firmaScale?: number;
    firmaOffsetY?: number;
    firmaOffsetX?: number;
}

export default function CertificadoConfirmacion({ 
    data, 
    textoExpedicion, 
    firmaUrl, 
    firmaScale = 1, 
    firmaOffsetY = 0,
    firmaOffsetX = 0
}: CertificadoConfirmacionProps) {
    if (!data) return null;

    const textoExpedicionFinal = textoExpedicion || `ES FIEL COPIA DEL ORIGINAL EXPEDIDA EN ${PARROQUIA_CONFIG.ciudad.toUpperCase()} A LOS ${format(new Date(), "d 'DIAS DEL MES DE' MMMM 'DE' yyyy", { locale: es }).toUpperCase()}.`;

    return (
        <div id="certificado-confirmacion-export" className="bg-white p-10 font-serif text-black relative w-[800px] mx-auto">
            {/* Encabezado */}
            <div className="flex justify-between items-start mb-8">
                <div className="text-center w-full max-w-sm mx-auto font-bold text-[15px] leading-tight italic">
                    <p>{PARROQUIA_CONFIG.diocesis.toUpperCase()}</p>
                    <p>{PARROQUIA_CONFIG.nombre.toUpperCase()}</p>
                    <p>{PARROQUIA_CONFIG.direccion} {PARROQUIA_CONFIG.ciudad}</p>
                    <p>Teléfono {PARROQUIA_CONFIG.telefono}</p>
                </div>
                <div className="absolute right-10 top-10 w-24 h-32 flex items-start justify-end overflow-hidden">
                    <img src={PARROQUIA_CONFIG.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                </div>
            </div>

            <h2 className="font-bold text-[15px] italic mb-2">ACTA DE confirmación</h2>

            {/* Tabla Identificadores */}
            <div className="mb-8 border border-black p-4 flex justify-around">
                <div className="font-bold italic text-sm">LIBRO No. <span className="ml-2 font-sans not-italic text-base border-b border-black inline-block min-w-8 text-center">{data.libro || '\u00A0'}</span></div>
                <div className="font-bold italic text-sm">FOLIO No. <span className="ml-2 font-sans not-italic text-base border-b border-black inline-block min-w-8 text-center">{data.folio}</span></div>
                <div className="font-bold italic text-sm">ACTA No. <span className="ml-2 font-sans not-italic text-base border-b border-black inline-block min-w-8 text-center">{data.numero}</span></div>
            </div>

            <style>
                {`
                .ce-row { display: flex; align-items: flex-end; margin-bottom: 1.5rem; padding-left: 0.5rem; }
                .ce-label { font-weight: bold; font-size: 0.9rem; font-style: italic; width: 14rem; flex-shrink: 0; }
                .ce-val { flex-grow: 1; border-bottom: 2px dotted #000; padding-bottom: 2px; text-align: center; font-weight: bold; font-family: sans-serif; font-size: 0.9rem; text-transform: uppercase; }
                `}
            </style>

            <div className="space-y-1 mb-8">
                <div className="ce-row">
                    <span className="ce-label">FECHA DE CONFIRMACIÓN:</span>
                    <span className="ce-val">
                        {data.fecha_confirmacion 
                            ? format(parseISO(data.fecha_confirmacion), "d 'de' MMMM 'de' yyyy", { locale: es }) 
                            : (data.anio_confirmacion ? `AÑO ${data.anio_confirmacion}` : 'NO REGISTRA')}
                    </span>
                </div>
                <div className="ce-row">
                    <span className="ce-label">PARROQUIA:</span>
                    <span className="ce-val">{data.parroquia}</span>
                </div>
                <div className="ce-row">
                    <span className="ce-label">LUGAR DE CONFIRMACIÓN:</span>
                    <span className="ce-val">{data.lugar_confirmacion || data.parroquia || PARROQUIA_CONFIG.nombre}</span>
                </div>
                <div className="ce-row">
                    <span className="ce-label">CONFIRMADO:</span>
                    <span className="ce-val">{data.nombre_confirmado} {data.apellidos_confirmado}</span>
                </div>
                <div className="ce-row">
                    <span className="ce-label">EDAD:</span>
                    <span className="ce-val">
                        {data.fecha_nacimiento && data.fecha_confirmacion 
                            ? `${Math.floor((new Date(data.fecha_confirmacion).getTime() - new Date(data.fecha_nacimiento).getTime()) / 31557600000)} AÑOS` 
                            : (data.fecha_nacimiento && data.anio_confirmacion
                                ? `${Number(data.anio_confirmacion) - new Date(data.fecha_nacimiento).getFullYear()} AÑOS (APROX.)`
                                : 'NO REGISTRA')}
                    </span>
                </div>
                <div className="ce-row">
                    <span className="ce-label">BAUTIZADO EN:</span>
                    <span className="ce-val">{data.parroquia_bautismo || '\u00A0'}</span>
                </div>
                <div className="ce-row">
                    <span className="ce-label">NOMBRE DEL PADRE:</span>
                    <span className="ce-val">{data.nombre_padre || '\u00A0'}</span>
                </div>
                <div className="ce-row">
                    <span className="ce-label">NOMBRE DE LA MADRE:</span>
                    <span className="ce-val">{data.nombre_madre || '\u00A0'}</span>
                </div>
                <div className="ce-row">
                    <span className="ce-label">PADRINO/MADRINA:</span>
                    <span className="ce-val">{data.padrino_madrina || '\u00A0'}</span>
                </div>
                <div className="ce-row">
                    <span className="ce-label">MINISTRO:</span>
                    <span className="ce-val">{data.ministro || 'NO REGISTRA'}</span>
                </div>

                {data.obispo && (
                    <div className="ce-row">
                        <span className="ce-label">OBISPO:</span>
                        <span className="ce-val">{data.obispo}</span>
                    </div>
                )}

                <div className="mt-8 font-bold italic text-sm">
                    <span>DOY FE: {data.da_fe || 'El Párroco'}</span>
                </div>
            </div>

            {/* Texto Legal */}
            <div className="text-center text-xs uppercase mb-4 px-10 py-1">
                {textoExpedicionFinal}
            </div>

            {/* Firma */}
            <div className="text-center font-bold text-sm relative z-20 mt-20 flex flex-col items-center justify-center min-h-[80px]">
                {firmaUrl && (
                    <img 
                        src={firmaUrl} 
                        alt="Firma del Párroco" 
                        className="absolute pointer-events-none"
                        style={{
                            transform: `translate(${firmaOffsetX}px, ${firmaOffsetY}px) scale(${firmaScale})`,
                            height: '75px',
                            zIndex: 10
                        }}
                    />
                )}
                <div className="mt-8">Párroco</div>
            </div>
        </div>
    );
}
