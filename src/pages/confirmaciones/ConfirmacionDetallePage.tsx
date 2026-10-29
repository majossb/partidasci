import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useConfirmaciones } from '@/hooks/useConfirmaciones';
import PartidaHeader from '@/components/partidas/PartidaHeader';
import { Button } from '@/components/ui/Button';
import { Edit, Printer, AlertTriangle, Download } from 'lucide-react';
import ModalExportacion from '@/components/exportacion/ModalExportacion';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '@/store/auth.store';
import { PARROQUIA_CONFIG } from '@/utils/constantes';

export default function ConfirmacionDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchConfirmacionById, anular } = useConfirmaciones();
  const { usuario } = useAuthStore();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAnularModal, setShowAnularModal] = useState(false);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      const result = await fetchConfirmacionById(id);
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
        titulo="Detalle de Confirmación" 
        libro={data.libro}
        folio={data.folio} 
        numero={data.numero} 
        estado={data.estado}
        volverUrl="/confirmaciones"
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
                <Link to={`/confirmaciones/${id}/editar`}><Edit className="w-4 h-4" /> Editar</Link>
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
          <div className="text-center w-full max-w-sm mx-auto font-bold text-[15px] leading-tight italic">
            <p>{PARROQUIA_CONFIG.diocesis.toUpperCase()}</p>
            <p>{PARROQUIA_CONFIG.nombre.toUpperCase()}</p>
            <p>{PARROQUIA_CONFIG.direccion}</p>
            <p>Teléfono {PARROQUIA_CONFIG.telefono}</p>
          </div>
          <div className="absolute right-10 top-10 w-24 h-32 flex items-start justify-end overflow-hidden">
            <img src={PARROQUIA_CONFIG.logoUrl} alt="Logo Parroquia" className="max-w-full max-h-full object-contain" />
          </div>
        </div>

        <h2 className="font-bold text-[15px] italic mb-2">ACTA DE confirmación</h2>

        {/* Tabla Identificadores */}
        <div className="mb-8 border border-black p-4 flex justify-around">
          <div className="font-bold italic text-sm">LIBRO No. <span className="ml-2 font-sans not-italic text-base border-b border-black inline-block min-w-8 text-center">{data.libro || '\u00A0'}</span></div>
          <div className="font-bold italic text-sm">FOLIO No. <span className="ml-2 font-sans not-italic text-base border-b border-black inline-block min-w-8 text-center">{data.folio}</span></div>
          <div className="font-bold italic text-sm">ACTA No. <span className="ml-2 font-sans not-italic text-base border-b border-black inline-block min-w-8 text-center">{data.numero}</span></div>
        </div>

        {/* Datos en Formato Punteado */}
        <style>
          {`
            .c-row { display: flex; align-items: flex-end; margin-bottom: 1.5rem; padding-left: 0.5rem; }
            .c-label { font-weight: bold; font-size: 0.9rem; font-style: italic; width: 14rem; flex-shrink: 0; }
            .c-val { flex-grow: 1; border-bottom: 2px dotted #000; padding-bottom: 2px; text-align: center; font-weight: bold; font-family: sans-serif; font-size: 0.9rem; text-transform: uppercase; }
          `}
        </style>

        <div className="space-y-1 mb-8">
          <div className="c-row">
            <span className="c-label">FECHA DE CONFIRMACIÓN:</span>
            <span className="c-val">
              {data.fecha_confirmacion 
                ? format(parseISO(data.fecha_confirmacion), "d 'de' MMMM 'de' yyyy", { locale: es }) 
                : (data.anio_confirmacion ? `AÑO ${data.anio_confirmacion}` : 'NO REGISTRA')}
            </span>
          </div>

          <div className="c-row">
            <span className="c-label">PARROQUIA:</span>
            <span className="c-val">{data.parroquia}</span>
          </div>

          <div className="c-row">
            <span className="c-label">LUGAR DE CONFIRMACIÓN:</span>
            <span className="c-val">{data.lugar_confirmacion || data.parroquia || PARROQUIA_CONFIG.nombre}</span>
          </div>

          <div className="c-row">
            <span className="c-label">CONFIRMADO:</span>
            <span className="c-val">{data.nombre_confirmado} {data.apellidos_confirmado}</span>
          </div>

          <div className="c-row">
            <span className="c-label">EDAD:</span>
            <span className="c-val">
              {data.fecha_nacimiento && data.fecha_confirmacion 
                ? `${Math.floor((new Date(data.fecha_confirmacion).getTime() - new Date(data.fecha_nacimiento).getTime()) / 31557600000)} AÑOS` 
                : (data.fecha_nacimiento && data.anio_confirmacion
                    ? `${Number(data.anio_confirmacion) - new Date(data.fecha_nacimiento).getFullYear()} AÑOS (APROX.)`
                    : 'NO REGISTRA')}
            </span>
          </div>

          <div className="c-row">
            <span className="c-label">BAUTIZADO EN:</span>
            <span className="c-val">
              {data.parroquia_bautismo || '\u00A0'}
              {data.numero_libro_bautismo || data.folio_bautismo || data.numero_bautismo ? (
                ` (LIBRO: ${data.numero_libro_bautismo || 'N/R'}, FOLIO: ${data.folio_bautismo || 'N/R'}, NÚMERO: ${data.numero_bautismo || 'N/R'})`
              ) : ''}
            </span>
          </div>

          <div className="c-row">
            <span className="c-label">NOMBRE DEL PADRE:</span>
            <span className="c-val">{data.nombre_padre || '\u00A0'}</span>
          </div>

          <div className="c-row">
            <span className="c-label">NOMBRE DE LA MADRE:</span>
            <span className="c-val">{data.nombre_madre || '\u00A0'}</span>
          </div>

          <div className="c-row">
            <span className="c-label">PADRINO/MADRINA:</span>
            <span className="c-val">{data.padrino_madrina || '\u00A0'}</span>
          </div>

          <div className="c-row">
            <span className="c-label">MINISTRO:</span>
            <span className="c-val">{data.ministro || 'NO REGISTRA'}</span>
          </div>

          {data.obispo && (
            <div className="c-row">
              <span className="c-label">OBISPO:</span>
              <span className="c-val">{data.obispo}</span>
            </div>
          )}
          
          <div className="mt-8 font-bold italic text-sm">
            <span>DOY FE: {data.da_fe || 'El Párroco'}</span>
          </div>

          <div className="mt-8"></div>

          <div className="text-center font-bold text-sm italic">
            Párroco
          </div>

          <div 
            className="mt-6 font-bold text-sm outline-none hover:bg-gray-50 focus:bg-gray-50 print:bg-transparent rounded px-2 py-1 cursor-text transition-colors uppercase"
            contentEditable
            suppressContentEditableWarning
          >
            ES FIEL COPIA DEL ORIGINAL EXPEDIDA EN {PARROQUIA_CONFIG.ciudad.toUpperCase()} A LOS {format(new Date(), "d 'DIAS DEL MES DE' MMMM 'DE' yyyy", { locale: es }).toUpperCase()}.
          </div>
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
        tipo="confirmacion" 
      />
    </div>
  );
}
