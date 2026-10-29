import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMatrimonios } from '@/hooks/useMatrimonios';
import PartidaHeader from '@/components/partidas/PartidaHeader';
import { Button } from '@/components/ui/Button';
import { Edit, Printer, AlertTriangle, Download } from 'lucide-react';
import ModalExportacion from '@/components/exportacion/ModalExportacion';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '@/store/auth.store';
import { PARROQUIA_CONFIG } from '@/utils/constantes';

export default function MatrimonioDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { fetchMatrimonioById, anular } = useMatrimonios();
  const { usuario } = useAuthStore();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAnularModal, setShowAnularModal] = useState(false);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      const result = await fetchMatrimonioById(id);
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAnular = async () => {
    if (!id || !motivoAnulacion.trim()) return;
    try {
      await anular(id, motivoAnulacion);
      setShowAnularModal(false);
      loadData();
    } catch (err) {
      alert('Error al anular la partida');
    }
  };

  if (loading) return <div className="p-12 text-center text-text-secondary animate-pulse">Cargando...</div>;
  if (!data) return <div className="p-8 text-danger bg-danger/10 text-center max-w-md mx-auto mt-12 rounded-lg">Error al cargar</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <PartidaHeader 
        titulo="Detalle de Matrimonio" 
        libro={data.libro}
        folio={data.folio} 
        numero={data.numero} 
        estado={data.estado}
        volverUrl="/matrimonios"
        acciones={
          <>
            <Button variant="outline" className="gap-2 print:hidden" onClick={() => setShowExportModal(true)}>
              <Download className="w-4 h-4" /> Descargar
            </Button>
            <Button variant="outline" className="gap-2 print:hidden" onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> Imprimir
            </Button>
            {usuario?.rol === 'secretaria' && data.estado !== 'anulado' && (
              <Button asChild className="gap-2 print:hidden">
                <Link to={`/matrimonios/${id}/editar`}><Edit className="w-4 h-4" /> Editar</Link>
              </Button>
            )}
          </>
        }
      />

      {data.estado === 'anulado' && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/30 text-danger rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold font-serif">Esta partida se encuentra ANULADA</h3>
            <p className="text-sm mt-1">Motivo: {data.motivo_anulacion}</p>
          </div>
        </div>
      )}

      {/* CERTIFICADO PARA IMPRIMIR */}
      <div className="overflow-x-auto print:overflow-visible">
      <div className="bg-white border border-border shadow-sm rounded-xl print:shadow-none print:border-none print:m-0 print:p-0 p-4 sm:p-8 md:p-10 font-serif text-black relative bg-white min-w-[640px]">
        
        {/* Encabezado */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-center w-full max-w-sm mx-auto font-bold text-[15px] leading-tight">
            <p>{PARROQUIA_CONFIG.diocesis.toUpperCase()}</p>
            <p>{PARROQUIA_CONFIG.nombre.toUpperCase()}</p>
            <p>{PARROQUIA_CONFIG.ciudad}, {PARROQUIA_CONFIG.direccion} Tel. {PARROQUIA_CONFIG.telefono}</p>
          </div>
          <div className="absolute right-10 top-10 w-24 h-32 flex items-start justify-end overflow-hidden">
            <img src={PARROQUIA_CONFIG.logoUrl} alt="Logo Parroquia" className="max-w-full max-h-full object-contain" />
          </div>
        </div>

        <h2 className="text-center font-bold text-xl italic mb-6">PARTIDA DE MATRIMONIO</h2>

        {/* Matrimonio de Box */}
        <div className="flex items-start mb-4 pl-4">
          <span className="font-bold text-sm italic w-32 flex-shrink-0 pt-2">Matrimonio de:</span>
          <div className="flex-grow">
            {/* Tabla Identificadores integrada */}
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
            .m-row { display: flex; align-items: flex-end; margin-bottom: 0.8rem; padding-left: 1rem; }
            .m-label { font-weight: bold; font-size: 0.85rem; font-style: italic; width: 14rem; flex-shrink: 0; }
            .m-val { flex-grow: 1; border-bottom: 2px dotted #000; padding-bottom: 2px; text-align: center; font-weight: bold; font-family: sans-serif; font-size: 0.85rem; text-transform: uppercase; }
            .m-title { font-weight: bold; font-size: 0.9rem; font-style: italic; margin-top: 1rem; margin-bottom: 0.5rem; padding-left: 1rem; }
          `}
        </style>

        <div className="space-y-1 mb-8">
          <div className="m-row">
            <span className="m-label">En la Parroquia de</span>
            <span className="m-val">{data.parroquia || '\u00A0'}</span>
          </div>
          <div className="m-row">
            <span className="m-label">Fecha de Matrimonio</span>
            <span className="m-val">{data.fecha_matrimonio ? format(parseISO(data.fecha_matrimonio), "d 'de' MMMM 'de' yyyy", { locale: es }) : 'NO REGISTRA'}</span>
          </div>
          <div className="m-row">
            <span className="m-label">Celebrante</span>
            <span className="m-val">{data.presencio || '\u00A0'}</span>
          </div>

          <div className="m-title mt-4">Datos del Esposo:</div>
          <div className="m-row">
            <span className="m-label">Nombre de los Padres</span>
            <span className="m-val">{[data.padre_esposo, data.madre_esposo].filter(Boolean).join(' y ')}</span>
          </div>
          <div className="m-row">
            <span className="m-label">Parroquia del bautismo</span>
            <span className="m-val">{data.parroquia_bautismo_esposo || '\u00A0'}</span>
          </div>
          <div className="m-row">
            <span className="m-label">Fecha del Bautismo</span>
            <span className="m-val">{data.fecha_bautismo_esposo ? format(parseISO(data.fecha_bautismo_esposo), "d 'de' MMMM 'de' yyyy", { locale: es }) : 'NO REGISTRA'}</span>
          </div>

          <div className="m-title mt-4">Datos de la Esposa:</div>
          <div className="m-row">
            <span className="m-label">Nombre de los Padres</span>
            <span className="m-val">{[data.padre_esposa, data.madre_esposa].filter(Boolean).join(' y ')}</span>
          </div>
          <div className="m-row">
            <span className="m-label">Parroquia del bautismo</span>
            <span className="m-val">{data.parroquia_bautismo_esposa || '\u00A0'}</span>
          </div>
          <div className="m-row">
            <span className="m-label">Fecha del Bautismo</span>
            <span className="m-val">{data.fecha_bautismo_esposa ? format(parseISO(data.fecha_bautismo_esposa), "d 'de' MMMM 'de' yyyy", { locale: es }) : 'NO REGISTRA'}</span>
          </div>

          <div className="m-row mt-4">
            <span className="m-label">Padrinos</span>
            <span className="m-val">{[data.testigo1, data.testigo2].filter(Boolean).join(' y ')}</span>
          </div>
          <div className="m-row">
            <span className="m-label">Doy Fe</span>
            <span className="m-val">{data.da_fe || 'El Párroco'}</span>
          </div>
        </div>

        {/* Anotaciones */}
        <div className="mb-6 text-center">
          <p className="font-bold text-sm mb-2">Anotación (es):</p>
          <p className="text-sm min-h-[2rem] uppercase">
            {data.anotaciones || '........................................................................................................................'}
          </p>
        </div>

        {/* Texto Legal Editable */}
        <div 
          className="text-center text-xs uppercase mb-8 px-10 outline-none hover:bg-gray-50 focus:bg-gray-50 print:bg-transparent rounded px-2 py-1 cursor-text transition-colors"
          contentEditable
          suppressContentEditableWarning
        >
          ES FIEL COPIA DEL ORIGINAL EXPEDIDA EN {PARROQUIA_CONFIG.ciudad.toUpperCase()} A LOS {format(new Date(), "d 'DIAS DEL MES DE' MMMM 'DE' yyyy", { locale: es }).toUpperCase()}.
        </div>

        {/* Firma - Doy Fe */}
        <div className="text-center">
          <div className="mt-12 mb-4"></div>
          <div className="font-bold text-sm italic">PARROCO</div>
        </div>
      </div>
      </div>

      {/* Zona de Peligro - Anulación */}
      {usuario?.rol === 'secretaria' && data.estado !== 'anulado' && (
        <div className="mt-12 p-6 border border-danger/30 rounded-xl bg-danger/5 print:hidden">
          <h3 className="text-danger font-bold mb-2">Zona de Peligro</h3>
          <p className="text-sm text-text-secondary mb-4">
            Si esta partida tiene errores graves en el folio o número, debe ser anulada.
          </p>
          <Button variant="outline" className="border-danger text-danger hover:bg-danger hover:text-white" onClick={() => setShowAnularModal(true)}>
            Anular Partida
          </Button>
        </div>
      )}

      {/* Modal de Anulación */}
      {showAnularModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
          <div className="bg-surface-card w-full max-w-md rounded-xl p-6 shadow-xl">
            <h3 className="text-xl font-serif font-bold text-text-primary mb-2">Confirmar Anulación</h3>
            <p className="text-sm text-text-secondary mb-4">
              Por favor indica el motivo de la anulación.
            </p>
            <textarea
              className="w-full p-3 border border-border rounded-md font-sans text-sm mb-4"
              rows={3}
              value={motivoAnulacion}
              onChange={(e) => setMotivoAnulacion(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowAnularModal(false)}>Cancelar</Button>
              <Button className="bg-danger hover:bg-danger/90" onClick={handleAnular} disabled={!motivoAnulacion.trim()}>
                Confirmar Anulación
              </Button>
            </div>
          </div>
        </div>
      )}

      <ModalExportacion 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
        data={data} 
        tipo="matrimonio" 
      />
    </div>
  );
}
