import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDefunciones } from '@/hooks/useDefunciones';
import PartidaHeader from '@/components/partidas/PartidaHeader';
import { Button } from '@/components/ui/Button';
import { Edit, Printer, AlertTriangle, Download } from 'lucide-react';
import ModalExportacion from '@/components/exportacion/ModalExportacion';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '@/store/auth.store';
import { PARROQUIA_CONFIG } from '@/utils/constantes';

export default function DefuncionDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchDefuncionById, anular } = useDefunciones();
  const { usuario } = useAuthStore();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAnularModal, setShowAnularModal] = useState(false);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      const result = await fetchDefuncionById(id);
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

  const mostrarEtiquetaEdad = (edad: string | null) => {
    if (!edad) return 'AÑOS DE EDAD';
    const lower = String(edad).toLowerCase();
    if (lower.includes('año') || lower.includes('mes') || lower.includes('dia') || lower.includes('día') || lower.includes('nacido') || lower.includes('registra')) {
      return '';
    }
    return 'AÑOS DE EDAD';
  };

  if (loading) return <div className="p-12 text-center text-text-secondary animate-pulse">Cargando...</div>;
  if (!data) return <div className="p-8 text-danger bg-danger/10 text-center max-w-md mx-auto mt-12 rounded-lg">Error al cargar</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <PartidaHeader 
        titulo="Detalle de Defunción" 
        libro={data.libro}
        folio={data.folio} 
        numero={data.numero} 
        estado={data.estado}
        volverUrl="/defunciones"
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
                <Link to={`/defunciones/${id}/editar`}><Edit className="w-4 h-4" /> Editar</Link>
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
      <div className="bg-white border border-border shadow-sm rounded-xl print:shadow-none print:border-none print:m-0 print:p-0 p-4 sm:p-8 md:p-12 font-serif text-black relative bg-white min-w-[640px]">
        
        {/* Encabezado lateral */}
        <div className="flex items-center justify-between border-b border-black pb-4 mb-6 relative">
          {/* Logo container izquierdo (diocesis) si existe */}
          <div className="w-28 h-28 flex items-center justify-start overflow-hidden">
            <img src="/logo-diocesis.svg" alt="" className="max-w-full max-h-full object-contain opacity-70" onError={(e) => e.currentTarget.style.display = 'none'} />
          </div>

          <div className="text-center font-bold text-sm italic flex-1">
            <p>{PARROQUIA_CONFIG.diocesis.toUpperCase()}</p>
            <p>{PARROQUIA_CONFIG.nombre.toUpperCase()}</p>
            <p>NIT. 900.000.000-1</p>
          </div>

          {/* Logo container derecho */}
          <div className="w-28 h-32 flex items-center justify-end overflow-hidden">
            <img src={PARROQUIA_CONFIG.logoUrl} alt="Logo Parroquia" className="max-w-full max-h-full object-contain" />
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
              .d-line { display: flex; align-items: flex-end; margin-bottom: 2rem; }
              .d-label { min-width: 200px; display: inline-block; text-align: left; white-space: nowrap; margin-right: 0.5rem; font-size: 1.05rem; }
              .d-val { flex-grow: 1; border-bottom: 1px solid #000; text-align: center; font-family: sans-serif; font-style: normal; text-transform: uppercase; line-height: 1.6; font-size: 1.15rem; }
            `}
          </style>

          <div className="d-line">
            <span className="d-label">A:</span>
            <span className="border-b border-black inline-block w-64 text-center font-sans not-italic text-base leading-tight uppercase font-bold">
              {data.fecha_defuncion ? format(parseISO(data.fecha_defuncion), "d 'DE' MMMM", { locale: es }) : 'NO REGISTRA'}
            </span>
            <span className="ml-4 mr-2 text-base not-italic font-bold">DE:</span>
            <span className="border-b border-black inline-block w-24 text-center font-sans not-italic text-base uppercase font-bold">
              {data.fecha_defuncion ? format(parseISO(data.fecha_defuncion), "yyyy") : 'NO REGISTRA'}
            </span>
          </div>

          <div className="d-line">
            <span className="d-label">NATURAL DE:</span>
            <span className="d-val">{data.lugar_origen || 'NO REGISTRA'}</span>
          </div>

          <div className="flex flex-col items-center justify-center mt-6 mb-8 w-full">
            <span className="text-base font-bold italic mb-2 tracking-wide text-center w-full">NOMBRES Y APELLIDOS DEL DIFUNTO</span>
            <span className="w-full text-center font-sans not-italic uppercase font-bold text-xl border-b border-black pb-2">
              {data.nombre_difunto} {data.apellidos_difunto}
            </span>
          </div>

          <div className="d-line">
            <span className="d-label">DE:</span>
            <span className="d-val">{data.edad || '\u00A0'}</span>
            <span className="ml-2 text-base not-italic">{mostrarEtiquetaEdad(data.edad)}</span>
          </div>

          <div className="d-line">
            <span className="d-label">HIJO(A) DE:</span>
            <span className="d-val">{[data.padre_difunto, data.madre_difunto].filter(Boolean).join(' y ') || 'NO REGISTRA'}</span>
          </div>

          <div className="d-line">
            <span className="d-label">ESTADO CIVIL:</span>
            <span className="d-val">{data.estado_civil || 'NO REGISTRA'}</span>
          </div>

          <div className="d-line">
            <span className="d-label">CAUSA DE MUERTE:</span>
            <span className="d-val">{data.causa_muerte || 'NO REGISTRA'}</span>
          </div>

          <div className="mt-14 mb-14 flex items-end">
            <span className="d-label">DOY FE:</span>
            <span className="d-val font-sans not-italic uppercase font-bold">{data.da_fe || 'EL PÁRROCO'}</span>
          </div>

          <div 
            className="text-center text-xs uppercase outline-none hover:bg-gray-50 focus:bg-gray-50 print:bg-transparent rounded px-2 py-1 cursor-text transition-colors mt-8 font-sans not-italic"
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
        tipo="defuncion" 
      />
    </div>
  );
}
