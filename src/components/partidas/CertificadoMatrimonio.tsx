import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { PARROQUIA_CONFIG } from '../../utils/constantes';

interface CertificadoMatrimonioProps {
    data: any;
    textoExpedicion?: string;
    firmaUrl?: string | null;
    firmaScale?: number;
    firmaOffsetY?: number;
    firmaOffsetX?: number;
}

export default function CertificadoMatrimonio({ 
    data, 
    textoExpedicion, 
    firmaUrl, 
    firmaScale = 1, 
    firmaOffsetY = 0,
    firmaOffsetX = 0
}: CertificadoMatrimonioProps) {
    if (!data) return null;

    const textoExpedicionFinal = textoExpedicion || `ES FIEL COPIA DEL ORIGINAL EXPEDIDA EN ${PARROQUIA_CONFIG.ciudad.toUpperCase()} A LOS ${format(new Date(), "d 'DIAS DEL MES DE' MMMM 'DE' yyyy", { locale: es }).toUpperCase()}.`;

    return (
        <div id="certificado-matrimonio-export" className="bg-white p-10 font-serif text-black relative w-[800px] mx-auto">
            {/* Encabezado */}
            <div className="flex justify-between items-start mb-8">
                <div className="text-center w-full max-w-sm mx-auto font-bold text-[15px] leading-tight">
                    <p>{PARROQUIA_CONFIG.diocesis.toUpperCase()}</p>
                    <p>{PARROQUIA_CONFIG.nombre.toUpperCase()}</p>
                    <p>{PARROQUIA_CONFIG.direccion} {PARROQUIA_CONFIG.ciudad} Tel. {PARROQUIA_CONFIG.telefono}</p>
                </div>
                <div className="absolute right-10 top-10 w-24 h-32 flex items-start justify-end overflow-hidden">
                    <img src={PARROQUIA_CONFIG.logoUrl} alt={`Logo ${PARROQUIA_CONFIG.nombre}`} className="w-full h-full object-contain" />
                </div>
            </div>

            <h2 className="text-center font-bold text-xl italic mb-6">PARTIDA DE MATRIMONIO</h2>

            {/* Matrimonio de Box */}
            <div className="flex items-start mb-4 pl-4">
                <span className="font-bold text-sm italic w-32 flex-shrink-0 pt-2">Matrimonio de:</span>
                <div className="flex-grow">
                    <table className="border-collapse border border-black w-full text-center text-sm mb-2">
                        <thead>
                            <tr>
                                <th className="border border-black font-normal py-1 px-4">LIBRO</th>
                                <th className="border border-black font-normal py-1 px-4">FOLIO</th>
                                <th className="border border-black font-normal py-1 px-4">PARTIDA</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-black font-bold py-2">{data.libro || '\u00A0'}</td>
                                <td className="border border-black font-bold py-2">{data.folio}</td>
                                <td className="border border-black font-bold py-2">{data.numero}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="border border-black border-t-0 px-4 py-2 text-center font-bold uppercase tracking-wider h-10 flex items-center justify-center text-xs">
                        {data.nombre_esposo} {data.apellidos_esposo} <span className="mx-2 lowercase font-normal italic">y</span> {data.nombre_esposa} {data.apellidos_esposa}
                    </div>
                </div>
            </div>

            {/* Datos en Formato Punteado */}
            <style>
                {`
                .me-row { display: flex; align-items: flex-end; margin-bottom: 0.8rem; padding-left: 1rem; }
                .me-label { font-weight: bold; font-size: 0.85rem; font-style: italic; width: 14rem; flex-shrink: 0; }
                .me-val { flex-grow: 1; border-bottom: 2px dotted #000; padding-bottom: 2px; text-align: center; font-weight: bold; font-family: sans-serif; font-size: 0.85rem; text-transform: uppercase; }
                .me-title { font-weight: bold; font-size: 0.9rem; font-style: italic; margin-top: 1rem; margin-bottom: 0.5rem; padding-left: 1rem; }
                `}
            </style>

            <div className="space-y-1 mb-8">
                <div className="me-row">
                    <span className="me-label">En la Parroquia de</span>
                    <span className="me-val">{data.parroquia || '\u00A0'}</span>
                </div>
                <div className="me-row">
                    <span className="me-label">Fecha de Matrimonio</span>
                    <span className="me-val">{data.fecha_matrimonio ? format(parseISO(data.fecha_matrimonio), "d 'de' MMMM 'de' yyyy", { locale: es }) : 'NO REGISTRA'}</span>
                </div>
                <div className="me-row">
                    <span className="me-label">Celebrante</span>
                    <span className="me-val">{data.presencio || '\u00A0'}</span>
                </div>

                <div className="me-title mt-4">Datos del Esposo:</div>
                <div className="me-row">
                    <span className="me-label">Nombre de los Padres</span>
                    <span className="me-val">{[data.padre_esposo, data.madre_esposo].filter(Boolean).join(' y ')}</span>
                </div>
                <div className="me-row">
                    <span className="me-label">Parroquia del bautismo</span>
                    <span className="me-val">{data.parroquia_bautismo_esposo || '\u00A0'}</span>
                </div>
                <div className="me-row">
                    <span className="me-label">Fecha del Bautismo</span>
                    <span className="me-val">{data.fecha_bautismo_esposo ? format(parseISO(data.fecha_bautismo_esposo), "d 'de' MMMM 'de' yyyy", { locale: es }) : 'NO REGISTRA'}</span>
                </div>

                <div className="me-title mt-4">Datos de la Esposa:</div>
                <div className="me-row">
                    <span className="me-label">Nombre de los Padres</span>
                    <span className="me-val">{[data.padre_esposa, data.madre_esposa].filter(Boolean).join(' y ')}</span>
                </div>
                <div className="me-row">
                    <span className="me-label">Parroquia del bautismo</span>
                    <span className="me-val">{data.parroquia_bautismo_esposa || '\u00A0'}</span>
                </div>
                <div className="me-row">
                    <span className="me-label">Fecha del Bautismo</span>
                    <span className="me-val">{data.fecha_bautismo_esposa ? format(parseISO(data.fecha_bautismo_esposa), "d 'de' MMMM 'de' yyyy", { locale: es }) : 'NO REGISTRA'}</span>
                </div>

                <div className="me-row mt-4">
                    <span className="me-label">Padrinos</span>
                    <span className="me-val">{[data.testigo1, data.testigo2].filter(Boolean).join(' y ')}</span>
                </div>
                <div className="me-row">
                    <span className="me-label">Doy Fe</span>
                    <span className="me-val">{data.da_fe || 'El Párroco'}</span>
                </div>
            </div>

            {/* Anotaciones */}
            <div className="mb-4 text-center">
                <p className="font-bold text-sm mb-2">Anotación (es):</p>
                <p className="text-sm min-h-[2rem] uppercase">
                    {data.anotaciones || '........................................................................................................................'}
                </p>
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
                <div className="mt-8">PARROCO</div>
            </div>
        </div>
    );
}
