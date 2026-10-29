import React from 'react';
import { FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form';
import {
  CheckCircle2, AlertCircle, AlertTriangle, Save, Trash2, ChevronLeft, ChevronRight,
  ChevronUp, ChevronDown, Pencil, SkipForward
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import SeccionAnotaciones from '@/components/partidas/SeccionAnotaciones';
import { ImageEntry } from '../ModalImportacionOCR';
import FormularioBautismo from './forms/FormularioBautismo';
import FormularioConfirmacion from './forms/FormularioConfirmacion';
import FormularioDefuncion from './forms/FormularioDefuncion';
import FormularioMatrimonio from './forms/FormularioMatrimonio';

interface PasoRevisionProps {
  images: ImageEntry[];
  tipo: 'bautismo' | 'confirmacion' | 'defuncion' | 'matrimonio';
  isBulkMode: boolean;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  savingAll: boolean;
  saveResults: { saved: number; errors: number; skipped: number } | null;
  errorGuardar: string | null;
  expandedRows: Record<string, boolean>;
  setExpandedRows: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  handleUpdateFieldDirectly: (id: string, field: string, value: any) => void;
  handleDeleteRow: (id: string) => void;
  toggleSkip: (index: number) => void;
  onClose: () => void;
  handleSaveAll: () => void;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch?: UseFormWatch<any>;
  successCount: number;
  pendingSaveCount: number;
  savedCount: number;
  errorCount: number;
  activeImage?: ImageEntry;
}

const PasoRevision: React.FC<PasoRevisionProps> = React.memo(({
  images,
  tipo,
  isBulkMode,
  activeIndex,
  setActiveIndex,
  savingAll,
  saveResults,
  errorGuardar,
  expandedRows,
  setExpandedRows,
  handleUpdateFieldDirectly,
  handleDeleteRow,
  toggleSkip,
  onClose,
  handleSaveAll,
  register,
  errors,
  watch,
  successCount,
  pendingSaveCount,
  savedCount,
  errorCount,
  activeImage,
}) => {
  return (
    <div className="space-y-4 font-sans">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          {successCount > 0 && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
              <CheckCircle2 className="w-4 h-4" /> {successCount} procesada{successCount !== 1 && 's'}
            </span>
          )}
          {savedCount > 0 && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-blue-700">
              <Save className="w-4 h-4" /> {savedCount} guardada{savedCount !== 1 && 's'}
            </span>
          )}
          {errorCount > 0 && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> {errorCount} no legible{errorCount !== 1 && 's'}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Revisa y edita la información antes de guardar.
        </div>
      </div>

      {saveResults && (
        <div className={`p-4 rounded-xl border text-sm font-sans flex items-center gap-2 ${
          saveResults.errors > 0
            ? 'bg-amber-50 border-amber-300 text-amber-800'
            : 'bg-green-50 border-green-300 text-green-800'
        }`}>
          <CheckCircle2 className="w-4 h-4 inline mr-2" />
          {saveResults.saved} partida{saveResults.saved !== 1 && 's'} guardada{saveResults.saved !== 1 && 's'} exitosamente.
          {saveResults.skipped > 0 && ` ${saveResults.skipped} omitida${saveResults.skipped !== 1 ? 's' : ''}.`}
          {saveResults.errors > 0 && ` ${saveResults.errors} con error${saveResults.errors !== 1 ? 'es' : ''} al guardar.`}
        </div>
      )}

      {errorGuardar && (
        <div className="p-4 bg-danger/10 border border-danger/30 text-danger rounded-md text-sm font-sans">
          {errorGuardar}
        </div>
      )}

      {isBulkMode ? (
        <div className="space-y-4 font-sans w-full">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[50vh]">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-12">Sel.</th>
                    <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-36">L / F / N°</th>
                    {tipo === 'bautismo' && (
                      <>
                        <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bautizado (Nombres / Apellidos)</th>
                        <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha Bautismo</th>
                        <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Padres (Padre / Madre)</th>
                      </>
                    )}
                    {tipo === 'confirmacion' && (
                      <>
                        <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Confirmado (Nombres / Apellidos)</th>
                        <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha / Año</th>
                        <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ministro / Obispo</th>
                      </>
                    )}
                    {tipo === 'defuncion' && (
                      <>
                        <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Difunto (Nombres / Apellidos)</th>
                        <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha Defunción / Edad</th>
                        <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Padres / Causa Muerte</th>
                      </>
                    )}
                    {tipo === 'matrimonio' && (
                      <>
                        <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Esposo (Nombres / Apellidos)</th>
                        <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Esposa (Nombres / Apellidos)</th>
                        <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha Matrimonio / Presenció</th>
                      </>
                    )}
                    <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {images.map((img, idx) => {
                    if (img.status === 'error') {
                      return (
                        <tr key={img.id} className="bg-amber-50/80 border-l-4 border-amber-500">
                          <td className="px-4 py-3 text-center">
                            <AlertTriangle className="w-4 h-4 text-amber-600 mx-auto" />
                          </td>
                          <td colSpan={4} className="px-4 py-3 text-xs text-amber-900">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="font-bold text-amber-950">{img.file?.name || 'Documento'}:</span>
                              <span className="font-medium text-amber-800">{img.error || 'No se pudo leer el documento. Adjunte una imagen nítida en JPG o PNG'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(img.id)}
                              className="p-1.5 border border-amber-300 rounded hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                              title="Descartar imagen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    const isExpanded = !!expandedRows[img.id];
                    const ext = img.extractedData || {};
                    const hasError = !!img.error;

                    return (
                      <React.Fragment key={img.id}>
                        <tr className={`hover:bg-gray-50/50 transition-colors ${img.skip ? 'opacity-40 bg-gray-50/30' : ''} ${hasError ? 'bg-red-50 border-l-4 border-red-500' : ''} ${img.saved ? 'bg-green-50/40' : ''}`}>
                          <td className="px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={!img.skip}
                              disabled={img.saved}
                              className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer disabled:opacity-50"
                              onChange={() => toggleSkip(idx)}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={ext.libro || ''}
                                placeholder="L"
                                disabled={img.saved}
                                className="w-10 h-8 text-center text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]"
                                onChange={(e) => handleUpdateFieldDirectly(img.id, 'libro', e.target.value)}
                              />
                              <input
                                type="number"
                                value={ext.folio || ''}
                                placeholder="F"
                                disabled={img.saved}
                                className="w-12 h-8 text-center text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]"
                                onChange={(e) => handleUpdateFieldDirectly(img.id, 'folio', e.target.value)}
                              />
                              <input
                                type="number"
                                value={ext.numero || ''}
                                placeholder="N°"
                                disabled={img.saved}
                                className="w-12 h-8 text-center text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]"
                                onChange={(e) => handleUpdateFieldDirectly(img.id, 'numero', e.target.value)}
                              />
                            </div>
                          </td>

                          {tipo === 'bautismo' && (
                            <>
                              <td className="px-4 py-2">
                                <div className="flex gap-2">
                                  <input type="text" value={ext.nombre_bautizado || ''} placeholder="Nombres" disabled={img.saved} className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'nombre_bautizado', e.target.value)} />
                                  <input type="text" value={ext.apellidos_bautizado || ''} placeholder="Apellidos" disabled={img.saved} className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'apellidos_bautizado', e.target.value)} />
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                <input type="date" value={ext.fecha_bautismo || ''} disabled={img.saved} className="w-32 h-8 px-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'fecha_bautismo', e.target.value)} />
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex gap-2">
                                  <input type="text" value={ext.nombre_padre || ''} placeholder="Padre" disabled={img.saved} className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'nombre_padre', e.target.value)} />
                                  <input type="text" value={ext.nombre_madre || ''} placeholder="Madre" disabled={img.saved} className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'nombre_madre', e.target.value)} />
                                </div>
                              </td>
                            </>
                          )}

                          {tipo === 'confirmacion' && (
                            <>
                              <td className="px-4 py-2">
                                <div className="flex gap-2">
                                  <input type="text" value={ext.nombre_confirmado || ''} placeholder="Nombres" disabled={img.saved} className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'nombre_confirmado', e.target.value)} />
                                  <input type="text" value={ext.apellidos_confirmado || ''} placeholder="Apellidos" disabled={img.saved} className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'apellidos_confirmado', e.target.value)} />
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex gap-2 items-center">
                                  <input type="date" value={ext.fecha_confirmacion || ''} disabled={img.saved} className="w-28 h-8 px-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => {
                                    handleUpdateFieldDirectly(img.id, 'fecha_confirmacion', e.target.value);
                                    if (e.target.value) {
                                      const anio = new Date(e.target.value).getFullYear();
                                      if (!isNaN(anio)) {
                                        handleUpdateFieldDirectly(img.id, 'anio_confirmacion', String(anio));
                                      }
                                    }
                                  }} />
                                  <input type="number" value={ext.anio_confirmacion || ''} placeholder="Año" disabled={img.saved} className="w-14 h-8 text-center text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'anio_confirmacion', e.target.value)} />
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex gap-2">
                                  <input type="text" value={ext.ministro || ''} placeholder="Ministro" disabled={img.saved} className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'ministro', e.target.value)} />
                                  <input type="text" value={ext.obispo || ''} placeholder="Obispo" disabled={img.saved} className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'obispo', e.target.value)} />
                                </div>
                              </td>
                            </>
                          )}

                          {tipo === 'defuncion' && (
                            <>
                              <td className="px-4 py-2">
                                <div className="flex gap-2">
                                  <input type="text" value={ext.nombre_difunto || ''} placeholder="Nombres" disabled={img.saved} className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'nombre_difunto', e.target.value)} />
                                  <input type="text" value={ext.apellidos_difunto || ''} placeholder="Apellidos" disabled={img.saved} className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'apellidos_difunto', e.target.value)} />
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex gap-2 items-center">
                                  <input type="date" value={ext.fecha_defuncion || ''} disabled={img.saved} className="w-28 h-8 px-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'fecha_defuncion', e.target.value)} />
                                  <input type="text" value={ext.edad || ''} placeholder="Edad" disabled={img.saved} className="w-16 h-8 text-center text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'edad', e.target.value)} />
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex gap-2">
                                  <input type="text" value={ext.padre_difunto || ''} placeholder="Padre" disabled={img.saved} className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'padre_difunto', e.target.value)} />
                                  <input type="text" value={ext.causa_muerte || ''} placeholder="Causa Muerte" disabled={img.saved} className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'causa_muerte', e.target.value)} />
                                </div>
                              </td>
                            </>
                          )}

                          {tipo === 'matrimonio' && (
                            <>
                              <td className="px-4 py-2">
                                <div className="flex gap-2">
                                  <input type="text" value={ext.nombre_esposo || ''} placeholder="Nombres" disabled={img.saved} className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'nombre_esposo', e.target.value)} />
                                  <input type="text" value={ext.apellidos_esposo || ''} placeholder="Apellidos" disabled={img.saved} className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'apellidos_esposo', e.target.value)} />
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex gap-2">
                                  <input type="text" value={ext.nombre_esposa || ''} placeholder="Nombres" disabled={img.saved} className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'nombre_esposa', e.target.value)} />
                                  <input type="text" value={ext.apellidos_esposa || ''} placeholder="Apellidos" disabled={img.saved} className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'apellidos_esposa', e.target.value)} />
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex gap-2 items-center">
                                  <input type="date" value={ext.fecha_matrimonio || ''} disabled={img.saved} className="w-28 h-8 px-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'fecha_matrimonio', e.target.value)} />
                                  <input type="text" value={ext.presencio || ''} placeholder="Presenció" disabled={img.saved} className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7B1C2E]" onChange={(e) => handleUpdateFieldDirectly(img.id, 'presencio', e.target.value)} />
                                </div>
                              </td>
                            </>
                          )}

                          <td className="px-4 py-2 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setExpandedRows(prev => ({ ...prev, [img.id]: !prev[img.id] }))}
                                className={`p-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors ${isExpanded ? 'bg-gray-100 text-[#7B1C2E]' : 'text-gray-600'}`}
                                title={isExpanded ? "Ocultar detalles" : "Ver todos los detalles"}
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(img.id)}
                                disabled={img.saved}
                                className="p-1 border border-gray-300 rounded hover:bg-red-50 text-red-500 hover:text-red-700 disabled:opacity-30 transition-colors"
                                title="Eliminar registro"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {hasError && (
                          <tr key={`${img.id}_error`} className="bg-red-50/90 border-l-4 border-red-500">
                            <td colSpan={6} className="px-4 py-2.5 text-xs text-red-700 font-medium">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                                <span><strong>Error al guardar:</strong> {img.error}</span>
                              </div>
                            </td>
                          </tr>
                        )}
                        {isExpanded && (
                          <tr key={`${img.id}_details`}>
                            <td colSpan={6} className="bg-gray-50/70 px-6 py-4 border-l-4 border-[#7B1C2E]">
                              {tipo === 'bautismo' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-xs font-serif font-bold text-[#7B1C2E] uppercase tracking-wider border-b border-gray-100 pb-1 font-sans">Padres y Abuelos</h4>
                                    <Input id={`padre_${img.id}`} label="Padre" value={ext.nombre_padre || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'nombre_padre', e.target.value)} />
                                    <Input id={`madre_${img.id}`} label="Madre" value={ext.nombre_madre || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'nombre_madre', e.target.value)} />
                                    <Input id={`abuelos_p_${img.id}`} label="Abuelos Paternos" value={ext.abuelos_paternos || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'abuelos_paternos', e.target.value)} />
                                    <Input id={`abuelos_m_${img.id}`} label="Abuelos Maternos" value={ext.abuelos_maternos || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'abuelos_maternos', e.target.value)} />
                                  </div>
                                  <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-xs font-serif font-bold text-[#7B1C2E] uppercase tracking-wider border-b border-gray-100 pb-1 font-sans">Padrinos y Ministro</h4>
                                    <Input id={`padrino_${img.id}`} label="Padrino" value={ext.padrino || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'padrino', e.target.value)} />
                                    <Input id={`madrina_${img.id}`} label="Madrina" value={ext.madrina || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'madrina', e.target.value)} />
                                    <Input id={`ministro_${img.id}`} label="Ministro" value={ext.ministro || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'ministro', e.target.value)} />
                                    <Input id={`da_fe_${img.id}`} label="Da Fe (Quien firma)" value={ext.da_fe || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'da_fe', e.target.value)} />
                                  </div>
                                  <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-xs font-serif font-bold text-[#7B1C2E] uppercase tracking-wider border-b border-gray-100 pb-1 font-sans">Nacimiento</h4>
                                    <Input id={`lugar_nacimiento_${img.id}`} label="Lugar de Nacimiento" value={ext.lugar_nacimiento || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'lugar_nacimiento', e.target.value)} />
                                    <Input id={`fecha_nacimiento_${img.id}`} type="date" label="Fecha de Nacimiento" value={ext.fecha_nacimiento || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'fecha_nacimiento', e.target.value)} />
                                  </div>
                                </div>
                              )}
                              {tipo === 'confirmacion' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-xs font-serif font-bold text-[#7B1C2E] uppercase tracking-wider border-b border-gray-100 pb-1 font-sans">Padres y Padrinos</h4>
                                    <Input id={`padre_${img.id}`} label="Padre" value={ext.nombre_padre || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'nombre_padre', e.target.value)} />
                                    <Input id={`madre_${img.id}`} label="Madre" value={ext.nombre_madre || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'nombre_madre', e.target.value)} />
                                    <Input id={`padrino_madrina_${img.id}`} label="Padrino/Madrina" value={ext.padrino_madrina || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'padrino_madrina', e.target.value)} />
                                  </div>
                                  <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-xs font-serif font-bold text-[#7B1C2E] uppercase tracking-wider border-b border-gray-100 pb-1 font-sans">Confirmación y Nacimiento</h4>
                                    <Input id={`lugar_confirmacion_${img.id}`} label="Lugar Confirmación" value={ext.lugar_confirmacion || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'lugar_confirmacion', e.target.value)} />
                                    <Input id={`lugar_nacimiento_${img.id}`} label="Lugar Nacimiento" value={ext.lugar_nacimiento || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'lugar_nacimiento', e.target.value)} />
                                    <Input id={`fecha_nacimiento_${img.id}`} type="date" label="Fecha Nacimiento" value={ext.fecha_nacimiento || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'fecha_nacimiento', e.target.value)} />
                                  </div>
                                  <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-xs font-serif font-bold text-[#7B1C2E] uppercase tracking-wider border-b border-gray-100 pb-1 font-sans">Bautismo de Referencia</h4>
                                    <Input id={`parroquia_bautismo_${img.id}`} label="Parroquia Bautismo" value={ext.parroquia_bautismo || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'parroquia_bautismo', e.target.value)} />
                                    <Input id={`diocesis_${img.id}`} label="Diócesis" value={ext.diocesis || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'diocesis', e.target.value)} />
                                    <Input id={`da_fe_${img.id}`} label="Da Fe (Quien firma)" value={ext.da_fe || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'da_fe', e.target.value)} />
                                  </div>
                                </div>
                              )}
                              {tipo === 'defuncion' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-xs font-serif font-bold text-[#7B1C2E] uppercase tracking-wider border-b border-gray-100 pb-1 font-sans">Origen y Estado Civil</h4>
                                    <Input id={`lugar_origen_${img.id}`} label="Lugar de Origen" value={ext.lugar_origen || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'lugar_origen', e.target.value)} />
                                    <Input id={`estado_civil_${img.id}`} label="Estado Civil" value={ext.estado_civil || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'estado_civil', e.target.value)} />
                                  </div>
                                  <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-xs font-serif font-bold text-[#7B1C2E] uppercase tracking-wider border-b border-gray-100 pb-1 font-sans">Padres</h4>
                                    <Input id={`padre_${img.id}`} label="Padre" value={ext.padre_difunto || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'padre_difunto', e.target.value)} />
                                    <Input id={`madre_${img.id}`} label="Madre" value={ext.madre_difunto || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'madre_difunto', e.target.value)} />
                                  </div>
                                  <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-xs font-serif font-bold text-[#7B1C2E] uppercase tracking-wider border-b border-gray-100 pb-1 font-sans">Causa y Firma</h4>
                                    <Input id={`causa_muerte_${img.id}`} label="Causa de Muerte" value={ext.causa_muerte || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'causa_muerte', e.target.value)} />
                                    <Input id={`da_fe_${img.id}`} label="Da Fe (Quien firma)" value={ext.da_fe || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'da_fe', e.target.value)} />
                                  </div>
                                </div>
                              )}
                              {tipo === 'matrimonio' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-xs font-serif font-bold text-[#7B1C2E] uppercase tracking-wider border-b border-gray-100 pb-1 font-sans">Padres Esposo</h4>
                                    <Input id={`padre_esposo_${img.id}`} label="Padre Esposo" value={ext.padre_esposo || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'padre_esposo', e.target.value)} />
                                    <Input id={`madre_esposo_${img.id}`} label="Madre Esposo" value={ext.madre_esposo || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'madre_esposo', e.target.value)} />
                                  </div>
                                  <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-xs font-serif font-bold text-[#7B1C2E] uppercase tracking-wider border-b border-gray-100 pb-1 font-sans">Padres Esposa</h4>
                                    <Input id={`padre_esposa_${img.id}`} label="Padre Esposa" value={ext.padre_esposa || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'padre_esposa', e.target.value)} />
                                    <Input id={`madre_esposa_${img.id}`} label="Madre Esposa" value={ext.madre_esposa || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'madre_esposa', e.target.value)} />
                                  </div>
                                  <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-xs font-serif font-bold text-[#7B1C2E] uppercase tracking-wider border-b border-gray-100 pb-1 font-sans">Testigos y Firma</h4>
                                    <Input id={`testigo1_${img.id}`} label="Testigo 1" value={ext.testigo1 || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'testigo1', e.target.value)} />
                                    <Input id={`testigo2_${img.id}`} label="Testigo 2" value={ext.testigo2 || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'testigo2', e.target.value)} />
                                    <Input id={`da_fe_${img.id}`} label="Da Fe (Quien firma)" value={ext.da_fe || ''} disabled={img.saved} onChange={(e) => handleUpdateFieldDirectly(img.id, 'da_fe', e.target.value)} />
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
          {/* Left panel: image carousel & status */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
                disabled={activeIndex === 0}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-semibold text-gray-700">
                Imagen {activeIndex + 1} de {images.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveIndex(prev => Math.min(images.length - 1, prev + 1))}
                disabled={activeIndex === images.length - 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Main image viewer */}
            <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm aspect-[3/4] overflow-hidden flex items-center justify-center relative">
              {activeImage?.previewUrl ? (
                <img
                  src={activeImage.previewUrl}
                  alt={activeImage.file.name}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : (
                <span className="text-sm text-gray-400">Sin vista previa</span>
              )}
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`relative w-14 h-18 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${
                      idx === activeIndex
                        ? 'border-[#7B1C2E] ring-2 ring-[#7B1C2E]/20'
                        : 'border-gray-200 opacity-60 hover:opacity-100'
                    } ${img.status === 'error' ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-300' : ''}`}
                  >
                    {img.previewUrl ? (
                      <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      </div>
                    )}
                    {img.status === 'error' && (
                      <div className="absolute top-1 right-1 bg-amber-600 text-white rounded-full p-0.5 shadow-sm" title="Imagen no legible">
                        <AlertCircle className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right panel: single form editor */}
          <div className="lg:col-span-7">
            {activeImage?.status === 'error' && (
              <div className="p-6 bg-amber-50/90 border-2 border-amber-300 rounded-2xl text-amber-950 shadow-sm space-y-4 font-sans mb-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-amber-100 border border-amber-200 rounded-xl text-amber-700 shrink-0 mt-0.5">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-bold text-base text-amber-950">
                      No se pudo leer el documento
                    </h3>
                    <p className="text-sm text-amber-800 leading-relaxed font-medium">
                      {activeImage.error || 'No se pudo leer el documento. Adjunte una imagen nítida en JPG o PNG'}
                    </p>
                    <div className="bg-white/80 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 space-y-1 mt-2">
                      <p className="font-semibold text-amber-950">Recomendaciones para adjuntar la imagen:</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
                        <li>La fotografía debe ser nítida, enfocada y sin movimiento.</li>
                        <li>Asegúrese de una iluminación uniforme, sin sombras oscuras ni destellos quemados.</li>
                        <li>Formatos compatibles: JPG o PNG con resolución mínima recomendada.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-amber-200 flex items-center justify-between">
                  <span className="text-xs text-amber-700">
                    Esta imagen no contiene datos legibles y no se guardará.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(activeImage.id)}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Descartar esta imagen
                  </button>
                </div>
              </div>
            )}

            {activeImage?.saved && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 mb-4 font-sans flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <span>Esta partida ya ha sido guardada exitosamente en el sistema.</span>
              </div>
            )}

            {activeImage?.status === 'success' && activeImage?.error && !activeImage.saved && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4 font-sans flex items-center gap-2 shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span><strong>Error al guardar:</strong> {activeImage.error}</span>
              </div>
            )}

            {activeImage?.skip && (
              <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600 mb-4 flex items-center justify-between">
                <span><SkipForward className="w-4 h-4 inline mr-2" /> Esta partida será omitida al guardar.</span>
                <button
                  onClick={() => toggleSkip(activeIndex)}
                  className="text-primary hover:underline text-xs font-medium"
                >
                  Incluir
                </button>
              </div>
            )}

            {activeImage?.status === 'success' && !activeImage.skip && (
              <form className="space-y-4">
                <fieldset disabled={activeImage?.saved} className="space-y-4 border-0 p-0 m-0">
                  {/* Validation errors */}
                  {Object.keys(errors).length > 0 && (
                    <div className="p-3 bg-danger/10 border border-danger/30 text-danger rounded-md text-sm font-sans">
                      <p className="font-bold mb-1">Corrige los siguientes errores:</p>
                      <ul className="list-disc pl-5">
                        {Object.entries(errors).map(([field, error]) => (
                          <li key={field}>{field}: {String(error?.message)}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Identifiers */}
                  <div className="bg-amber-50 p-4 rounded-xl border-2 border-amber-300 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Pencil className="w-3.5 h-3.5 text-amber-600" />
                      <h2 className="text-sm font-serif font-semibold text-text-primary">Identificadores</h2>
                    </div>
                    <p className="text-xs text-amber-700 mb-3 border-b border-amber-200 pb-2">
                      Edita estos campos directamente antes de guardar.
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <Input id={`libro_${activeIndex}`} label="Libro" {...register('libro')} error={errors.libro?.message as string} className="bg-white border-amber-300 focus:border-amber-500" />
                      <Input id={`folio_${activeIndex}`} type="number" label="Folio" {...register('folio')} error={errors.folio?.message as string} className="bg-white border-amber-300 focus:border-amber-500" />
                      <Input id={`numero_${activeIndex}`} type="number" label="Número" {...register('numero')} error={errors.numero?.message as string} className="bg-white border-amber-300 focus:border-amber-500" />
                    </div>
                  </div>

                  {tipo === 'bautismo' && (
                    <FormularioBautismo register={register} errors={errors} activeIndex={activeIndex} />
                  )}
                  {tipo === 'confirmacion' && (
                    <FormularioConfirmacion register={register} errors={errors} activeIndex={activeIndex} />
                  )}
                  {tipo === 'defuncion' && (
                    <FormularioDefuncion register={register} errors={errors} activeIndex={activeIndex} />
                  )}
                  {tipo === 'matrimonio' && (
                    <FormularioMatrimonio register={register} errors={errors} activeIndex={activeIndex} />
                  )}

                  {/* Annotations */}
                  <SeccionAnotaciones register={register} errors={errors} watch={watch} defaultExpanded={true} />
                </fieldset>
              </form>
            )}

            {/* Skip / include toggle */}
            {activeImage?.status === 'success' && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => toggleSkip(activeIndex)}
                  className={`text-xs font-medium flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                    activeImage.skip
                      ? 'text-primary hover:bg-primary/10'
                      : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <SkipForward className="w-3 h-3" />
                  {activeImage.skip ? 'Incluir esta partida' : 'Omitir esta partida'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom action bar */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <Button type="button" variant="ghost" onClick={onClose} disabled={savingAll}>
          Cancelar
        </Button>
        <Button
          onClick={handleSaveAll}
          disabled={savingAll || pendingSaveCount === 0}
          isLoading={savingAll}
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar {pendingSaveCount} partida{pendingSaveCount !== 1 && 's'}
        </Button>
      </div>
    </div>
  );
});

PasoRevision.displayName = 'PasoRevision';

export default PasoRevision;
