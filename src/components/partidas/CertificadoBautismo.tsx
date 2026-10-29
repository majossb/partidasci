import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { PARROQUIA_CONFIG } from '../../utils/constantes';

interface CertificadoBautismoProps {
    data: any;
    textoExpedicion?: string;
    firmaUrl?: string | null;
    firmaScale?: number;
    firmaOffsetY?: number;
    firmaOffsetX?: number;
}

export default function CertificadoBautismo({ 
    data, 
    textoExpedicion, 
    firmaUrl, 
    firmaScale = 1, 
    firmaOffsetY = 0,
    firmaOffsetX = 0
}: CertificadoBautismoProps) {
    if (!data) return null;

    const textoExpedicionFinal = textoExpedicion || `ES FIEL COPIA DEL ORIGINAL EXPEDIDA EN ${PARROQUIA_CONFIG.ciudad.toUpperCase()} A LOS ${format(new Date(), "d 'DIAS DEL MES DE' MMMM 'DE' yyyy", { locale: es }).toUpperCase()}.`;

    return (
        <div id="certificado-bautismo-export" className="bg-white p-10 font-serif text-black relative w-[800px] mx-auto">
            {/* Encabezado */}
            <div className="flex justify-between items-start mb-8">
                <div className="text-center w-full max-w-sm mx-auto font-bold text-[15px] leading-tight">
                    <p>{PARROQUIA_CONFIG.diocesis.toUpperCase()}</p>
                    <p>{PARROQUIA_CONFIG.nombre.toUpperCase()}</p>
                    <p>{PARROQUIA_CONFIG.direccion} {PARROQUIA_CONFIG.ciudad}</p>
                    <p>TELEFONO: {PARROQUIA_CONFIG.telefono}</p>
                </div>
                <div className="absolute right-10 top-10 w-24 h-32 flex items-start justify-end overflow-hidden">
                    <img src={PARROQUIA_CONFIG.logoUrl} alt={`Logo ${PARROQUIA_CONFIG.nombre}`} className="w-full h-full object-contain" />
                </div>
            </div>

            <h2 className="text-center font-bold text-xl italic mb-6">PARTIDA DE BAUTISMO</h2>

            {/* Tabla Identificadores */}
            <div className="flex justify-center mb-10">
                <table className="border-collapse border border-black w-2/3 text-center text-sm">
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
            </div>

            {/* Bautizado Nombre Box */}
            <div className="flex items-center mb-8 pl-4">
                <span className="font-bold text-sm italic w-40 flex-shrink-0">Bautizado (a)</span>
                <div className="border border-black px-4 py-2 flex-grow text-center font-bold uppercase tracking-wider h-10 flex items-center justify-center">
                    {data.nombre_bautizado} {data.apellidos_bautizado}
                </div>
            </div>

            {/* Datos en Formato Punteado */}
            <style>
                {`
                .dotted-row { display: flex; align-items: flex-end; margin-bottom: 1.5rem; padding-left: 1rem; }
                .dotted-label { font-weight: bold; font-size: 0.9rem; font-style: italic; width: 10rem; flex-shrink: 0; }
                .dotted-value { flex-grow: 1; border-bottom: 2px dotted #000; padding-bottom: 2px; text-align: center; font-weight: bold; font-family: sans-serif; font-size: 0.95rem; text-transform: uppercase; }
                `}
            </style>

            <div className="space-y-1 mb-10">
                <div className="dotted-row">
                    <span className="dotted-label">Fecha de Bautismo</span>
                    <span className="dotted-value">
                        {data.fecha_bautismo ? format(parseISO(data.fecha_bautismo), "d 'de' MMMM 'de' yyyy", { locale: es }) : 'NO REGISTRA'}
                    </span>
                </div>

                <div className="dotted-row">
                    <span className="dotted-label">Celebrante</span>
                    <span className="dotted-value">{data.ministro}</span>
                </div>

                <div className="dotted-row">
                    <span className="dotted-label">Fecha de Nacimiento</span>
                    <span className="dotted-value">
                        {data.fecha_nacimiento ? format(parseISO(data.fecha_nacimiento), "d 'de' MMMM 'de' yyyy", { locale: es }) : 'NO REGISTRA'}
                    </span>
                </div>

                <div className="dotted-row">
                    <span className="dotted-label">Lugar Nacimiento</span>
                    <span className="dotted-value">{data.lugar_nacimiento}</span>
                </div>

                <div className="dotted-row">
                    <span className="dotted-label">Nombre de los Padres</span>
                    <span className="dotted-value">
                        {[data.nombre_padre, data.nombre_madre].filter(Boolean).join(' y ')}
                    </span>
                </div>

                <div className="dotted-row">
                    <span className="dotted-label">Abuelos Paternos</span>
                    <span className="dotted-value">{data.abuelos_paternos || '\u00A0'}</span>
                </div>

                <div className="dotted-row">
                    <span className="dotted-label">Abuelos Maternos</span>
                    <span className="dotted-value">{data.abuelos_maternos || '\u00A0'}</span>
                </div>

                <div className="dotted-row">
                    <span className="dotted-label">Padrinos</span>
                    <span className="dotted-value">
                        {[data.padrino, data.madrina].filter(Boolean).join(' y ')}
                    </span>
                </div>

                <div className="dotted-row">
                    <span className="dotted-label">Doy Fe</span>
                    <span className="dotted-value">{data.da_fe || 'El Párroco'}</span>
                </div>
            </div>

            {/* Anotaciones */}
            <div className="mb-6 text-center">
                <p className="font-bold text-sm mb-2">Anotación (es):</p>
                <p className="text-sm min-h-[3rem] uppercase">
                    {data.anotaciones || '........................................................................................................................'}
                </p>
            </div>

            {/* Texto Legal Editable */}
            <div 
                className="text-center text-xs uppercase mb-8 px-10 outline-none rounded px-2 py-1"
            >
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
                <div className="mt-8">PÁRROCO</div>
            </div>
        </div>
    );
}
