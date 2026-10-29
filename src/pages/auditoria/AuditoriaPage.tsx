import { useState } from 'react';
import { useAuditoria } from '@/hooks/useAuditoria';
import { exportarCSV } from '@/utils/exportarCSV';
import { Download, Filter, RefreshCw, ShieldCheck } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AuditoriaPage() {
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    usuario: '',
    operacion: '',
    tabla: '',
  });

  const { logs, loading, refetch } = useAuditoria(filtros);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handleExportCSV = async () => {
    if (logs.length === 0) return;
    const exportData = logs.map(log => ({
      ID: log.id,
      Fecha: format(parseISO(log.timestamp), 'dd/MM/yyyy HH:mm:ss'),
      Usuario: log.usuario_email,
      Rol: log.usuario_rol,
      Operación: log.operacion,
      Tabla: log.tabla,
      'Registro ID': log.registro_id,
      IP: log.ip_address || 'N/A'
    }));
    await exportarCSV(exportData, `Auditoria_Parroquia_${format(new Date(), 'yyyyMMdd_HHmmss')}`);
  };

  const getOperacionBadge = (op: string) => {
    switch (op) {
      case 'INSERT': return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#6B1E2E]" />
            Registro de Auditoría
          </h1>
          <p className="text-gray-500 text-sm mt-1">Historial inmutable de cambios en el sistema (Solo lectura).</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C9973A]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#6B1E2E] border border-transparent rounded-lg text-white hover:bg-[#8B293F] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6B1E2E]"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-5">
        <div className="flex items-center gap-2 mb-4 text-gray-700 font-medium">
          <Filter className="w-4 h-4" /> Filtros de Búsqueda
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Fecha Inicio</label>
            <input type="date" name="fechaInicio" value={filtros.fechaInicio} onChange={handleFilterChange} className="w-full text-sm border-gray-300 rounded-lg focus:ring-[#C9973A] focus:border-[#C9973A] shadow-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Fecha Fin</label>
            <input type="date" name="fechaFin" value={filtros.fechaFin} onChange={handleFilterChange} className="w-full text-sm border-gray-300 rounded-lg focus:ring-[#C9973A] focus:border-[#C9973A] shadow-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Usuario (Email)</label>
            <input type="text" name="usuario" value={filtros.usuario} onChange={handleFilterChange} placeholder="Buscar email..." className="w-full text-sm border-gray-300 rounded-lg focus:ring-[#C9973A] focus:border-[#C9973A] shadow-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Operación</label>
            <select name="operacion" value={filtros.operacion} onChange={handleFilterChange} className="w-full text-sm border-gray-300 rounded-lg focus:ring-[#C9973A] focus:border-[#C9973A] shadow-sm bg-white">
              <option value="">Todas</option>
              <option value="INSERT">Creación (INSERT)</option>
              <option value="UPDATE">Edición (UPDATE)</option>
              <option value="DELETE">Borrado (DELETE)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Módulo / Tabla</label>
            <select name="tabla" value={filtros.tabla} onChange={handleFilterChange} className="w-full text-sm border-gray-300 rounded-lg focus:ring-[#C9973A] focus:border-[#C9973A] shadow-sm bg-white">
              <option value="">Todas</option>
              <option value="sacramentos_bautismo">Bautismos</option>
              <option value="sacramentos_confirmacion">Confirmaciones</option>
              <option value="sacramentos_matrimonio">Matrimonios</option>
              <option value="sacramentos_defuncion">Defunciones</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Fecha y Hora</th>
                <th className="px-6 py-4 font-semibold">Usuario</th>
                <th className="px-6 py-4 font-semibold">Operación</th>
                <th className="px-6 py-4 font-semibold">Módulo</th>
                <th className="px-6 py-4 font-semibold">ID Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && logs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Cargando registros...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">No se encontraron registros de auditoría para estos filtros.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">
                        {format(parseISO(log.timestamp), 'dd MMM yyyy', { locale: es })}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {format(parseISO(log.timestamp), 'HH:mm:ss')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{log.usuario_email}</div>
                      <div className="text-xs text-gray-500 capitalize mt-0.5">{log.usuario_rol}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getOperacionBadge(log.operacion)}`}>
                        {log.operacion}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 capitalize">
                      {log.tabla.replace('sacramentos_', '')}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {log.registro_id.split('-')[0]}...
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 text-xs text-gray-500 flex justify-between items-center">
          <span>Mostrando los últimos {logs.length} registros (limitado a 100 en vista).</span>
          <span>Actualizado automáticamente</span>
        </div>
      </div>
    </div>
  );
}
