import { useState, useEffect } from 'react';
import { X, FileText, Download, Loader2, Image as ImageIcon } from 'lucide-react';
import { exportarElementoAPDF } from '@/utils/exportarPDF';
import { exportarPartidaWord } from '@/utils/exportarWord';
import CertificadoBautismo from '@/components/partidas/CertificadoBautismo';
import CertificadoConfirmacion from '@/components/partidas/CertificadoConfirmacion';
import CertificadoMatrimonio from '@/components/partidas/CertificadoMatrimonio';
import CertificadoDefuncion from '@/components/partidas/CertificadoDefuncion';
import ModalLey1581 from '@/components/exportacion/ModalLey1581';
import { procesarFirmaTransparente } from '@/utils/procesarFirma';
import { supabase } from '@/lib/supabase';

interface ModalExportacionProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  tipo: 'bautismo' | 'confirmacion' | 'matrimonio' | 'defuncion';
}

export default function ModalExportacion({ isOpen, onClose, data, tipo }: ModalExportacionProps) {
  const [formato, setFormato] = useState<'PDF' | 'WORD'>('PDF');
  const [exportando, setExportando] = useState(false);
  const [incluirFirma, setIncluirFirma] = useState(true);
  const [firmaUrl, setFirmaUrl] = useState<string | null>(null);
  const [showLey1581, setShowLey1581] = useState(false);

  // Ajustes de firma
  const [firmaScale, setFirmaScale] = useState(1);
  const [firmaOffsetY, setFirmaOffsetY] = useState(0);
  const [firmaOffsetX, setFirmaOffsetX] = useState(0);

  // Cargar la firma global desde el bucket privado de Supabase Storage mediante Signed URL
  useEffect(() => {
    if (isOpen) {
      const loadFirmaGlobal = async () => {
        try {
          const { data: fileList, error } = await supabase.storage.from('firmas').list();
          if (error) {
            console.error('Error al listar bucket firmas:', error);
          }
          if (fileList && fileList.length > 0) {
            const file = fileList.find(f => f.name.includes('firma_parroco'));
            if (file) {
              // Generar Signed URL de 1 hora (3600s) para bucket privado
              const { data: urlData, error: urlErr } = await supabase.storage
                .from('firmas')
                .createSignedUrl(file.name, 3600);

              if (urlErr) {
                console.error('Error generando Signed URL de la firma:', urlErr);
              } else if (urlData?.signedUrl) {
                try {
                  const res = await fetch(urlData.signedUrl);
                  const blob = await res.blob();
                  const reader = new FileReader();
                  reader.onloadend = async () => {
                    const processed = await procesarFirmaTransparente(reader.result as string);
                    setFirmaUrl(processed);
                    setIncluirFirma(true);
                  };
                  reader.readAsDataURL(blob);
                  return;
                } catch (e) {
                  setFirmaUrl(urlData.signedUrl);
                  setIncluirFirma(true);
                  return;
                }
              }
            }
          }
        } catch (e) {
          console.error('Error cargando firma global:', e);
        }
        setFirmaUrl(null);
      };

      loadFirmaGlobal();
      setFirmaScale(1);
      setFirmaOffsetY(0);
      setFirmaOffsetX(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getExportId = () => {
    switch (tipo) {
      case 'bautismo': return 'certificado-bautismo-export';
      case 'confirmacion': return 'certificado-confirmacion-export';
      case 'matrimonio': return 'certificado-matrimonio-export';
      case 'defuncion': return 'certificado-defuncion-export';
    }
  };

  const handleExportarClick = () => {
    // Mostrar modal de Ley 1581 antes de exportar
    setShowLey1581(true);
  };

  const handleExportarConfirmado = async () => {
    setShowLey1581(false);
    setExportando(true);
    try {
      const nombreArchivo = `${tipo}_${data.numero || data.folio || data.id}`;

      if (formato === 'PDF') {
        await exportarElementoAPDF(getExportId(), nombreArchivo);
      } else {
        const blob = await exportarPartidaWord(data, tipo, undefined, incluirFirma, firmaUrl);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nombreArchivo}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      onClose();
    } catch (error) {
      console.error('Error exportando:', error);
      alert('Hubo un error al exportar el documento.');
    } finally {
      setExportando(false);
    }
  };

  const renderCertificado = () => {
    const activeFirma = incluirFirma ? firmaUrl : null;
    switch (tipo) {
      case 'bautismo':
        return (
          <CertificadoBautismo
            data={data}
            firmaUrl={activeFirma}
            firmaScale={firmaScale}
            firmaOffsetY={firmaOffsetY}
            firmaOffsetX={firmaOffsetX}
          />
        );
      case 'confirmacion':
        return (
          <CertificadoConfirmacion
            data={data}
            firmaUrl={activeFirma}
            firmaScale={firmaScale}
            firmaOffsetY={firmaOffsetY}
            firmaOffsetX={firmaOffsetX}
          />
        );
      case 'matrimonio':
        return (
          <CertificadoMatrimonio
            data={data}
            firmaUrl={activeFirma}
            firmaScale={firmaScale}
            firmaOffsetY={firmaOffsetY}
            firmaOffsetX={firmaOffsetX}
          />
        );
      case 'defuncion':
        return (
          <CertificadoDefuncion
            data={data}
            firmaUrl={activeFirma}
            firmaScale={firmaScale}
            firmaOffsetY={firmaOffsetY}
            firmaOffsetX={firmaOffsetX}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-[#7B1C2E] text-white">
          <h2 className="text-xl font-bold flex items-center gap-2 font-serif">
            <Download className="w-5 h-5" />
            Exportar Partida
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Controles Laterales */}
          <div className="w-full md:w-76 border-r border-gray-100 bg-gray-50 p-5 flex flex-col gap-5 overflow-y-auto">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 font-sans">1. Formato de Descarga</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormato('PDF')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    formato === 'PDF' ? 'border-[#7B1C2E] bg-rose-50 text-[#7B1C2E]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-6 h-6 mb-1" />
                  <span className="font-semibold text-sm">PDF</span>
                </button>
                <button
                  onClick={() => setFormato('WORD')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    formato === 'WORD' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-6 h-6 mb-1" />
                  <span className="font-semibold text-sm">Word</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2 font-sans">
                <ImageIcon className="w-4 h-4" />
                2. Firma del Párroco
              </label>
              <label className="flex items-center gap-2 bg-white p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={incluirFirma}
                  onChange={(e) => setIncluirFirma(e.target.checked)}
                  className="rounded border-gray-300 text-[#7B1C2E] focus:ring-[#7B1C2E]"
                />
                <span className="text-sm font-medium text-gray-700 font-sans">
                  Incluir firma digital {firmaUrl ? '(Cargada)' : '(No registrada)'}
                </span>
              </label>

              {incluirFirma && (
                <div className="mt-3 space-y-3 bg-white p-3 border border-gray-200 rounded-lg">
                  <p className="text-[11px] text-gray-500 font-sans">
                    {firmaUrl
                      ? 'Ajusta la posición y escala de la firma sobre la línea PÁRROCO.'
                      : 'No hay firma subida aún en Configuración → Firma del Párroco.'}
                  </p>

                  {firmaUrl && (
                    <>
                      <div>
                        <div className="flex justify-between mb-0.5">
                          <label className="text-xs font-semibold text-gray-600 font-sans">Tamaño</label>
                          <span className="text-xs text-gray-400 font-mono">{Math.round(firmaScale * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.3"
                          max="2.5"
                          step="0.1"
                          value={firmaScale}
                          onChange={(e) => setFirmaScale(parseFloat(e.target.value))}
                          className="w-full accent-[#7B1C2E]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-0.5">
                          <label className="text-xs font-semibold text-gray-600 font-sans">Posición Vertical (Y)</label>
                          <span className="text-xs text-gray-400 font-mono">{firmaOffsetY}px</span>
                        </div>
                        <input
                          type="range"
                          min="-150"
                          max="150"
                          step="5"
                          value={firmaOffsetY}
                          onChange={(e) => setFirmaOffsetY(parseInt(e.target.value))}
                          className="w-full accent-[#7B1C2E]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-0.5">
                          <label className="text-xs font-semibold text-gray-600 font-sans">Posición Horizontal (X)</label>
                          <span className="text-xs text-gray-400 font-mono">{firmaOffsetX}px</span>
                        </div>
                        <input
                          type="range"
                          min="-300"
                          max="300"
                          step="5"
                          value={firmaOffsetX}
                          onChange={(e) => setFirmaOffsetX(parseInt(e.target.value))}
                          className="w-full accent-[#7B1C2E]"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mt-auto pt-4">
              <button
                onClick={handleExportarClick}
                disabled={exportando}
                className="w-full py-3 bg-[#7B1C2E] text-white rounded-xl font-bold hover:bg-[#6B1E2E] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer shadow-xs font-sans"
              >
                {exportando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                Generar {formato}
              </button>
            </div>
          </div>

          {/* Previsualización del Documento */}
          <div className="flex-1 bg-gray-200 p-4 overflow-y-auto flex justify-center items-start">
            <div className="shadow-lg bg-white scale-[0.6] origin-top md:scale-[0.7] lg:scale-[0.8] xl:scale-[0.9] transition-transform">
              {renderCertificado()}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de advertencia Ley 1581 de Protección de Datos */}
      <ModalLey1581
        isOpen={showLey1581}
        onClose={() => setShowLey1581(false)}
        onAccept={handleExportarConfirmado}
        formato={formato}
      />
    </div>
  );
}
