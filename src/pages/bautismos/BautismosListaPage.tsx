import { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useBautismos } from '@/hooks/useBautismos';
import { useFiltrosStore } from '@/store/filtros.store';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Plus, Filter, Eye, Edit, Camera, Download, ChevronLeft, ChevronRight, Calendar, BookOpen, CheckCircle2, XCircle, Bookmark, AlertTriangle } from 'lucide-react';
import EstadoBadge from '@/components/partidas/EstadoBadge';
import { useAuthStore } from '@/store/auth.store';
import ModalExportacion from '@/components/exportacion/ModalExportacion';
import { fetchSacramentoStats, formatTiempoRelativo, SacramentoStats } from '@/utils/sacramentoStats';
import { exportarCSV } from '@/utils/exportarCSV';
import { esAnioCuatroDigitos, obtenerErrorAnio } from '@/utils/validaciones';
import { PARROQUIA_CONFIG } from '@/utils/constantes';

const ModalImportacionOCR = lazy(() => import('@/components/partidas/ModalImportacionOCR'));

export default function BautismosListaPage() {
  const { fetchBautismos, loading } = useBautismos();
  const { busqueda, setFiltro, estado, anio, libro } = useFiltrosStore();
  const { usuario } = useAuthStore();
  
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [exportandoGlobal, setExportandoGlobal] = useState(false);

  const [stats, setStats] = useState<SacramentoStats>({
    total: 0,
    activos: 0,
    anulados: 0,
    ultimoRef: 'N/A',
    esteMes: 0
  });

  const [modalExportacionOpen, setModalExportacionOpen] = useState(false);
  const [selectedPartida, setSelectedPartida] = useState<any>(null);
  const [modalOCROpen, setModalOCROpen] = useState(false);

  const loadStats = async () => {
    const s = await fetchSacramentoStats('sacramentos_bautismo', 'fecha_bautismo');
    setStats(s);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const anioInvalido = Boolean(anio && anio.trim().length > 0 && !esAnioCuatroDigitos(anio));

  useEffect(() => {
    const load = async () => {
      // Si el usuario comenzó a escribir un año pero no es válido (ej: 1, 2 o 3 dígitos), no disparar consulta corrupta
      if (anio && anio.trim().length > 0 && !esAnioCuatroDigitos(anio)) {
        return;
      }
      try {
        const result = await fetchBautismos(page, 20, { busqueda, estado, anio, libro });
        setData(result.data);
        setTotalCount(result.count);
        setTotalPages(result.totalPages);
      } catch (err) {
        console.error(err);
      }
    };
    
    const timer = setTimeout(() => {
      load();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [page, busqueda, estado, anio, libro, fetchBautismos]);

  const handleExportarVistaActual = async () => {
    if (data.length === 0) return;
    try {
      setExportandoGlobal(true);
      await exportarCSV(data, `Bautismos_Pagina_${page}_${format(new Date(), 'yyyyMMdd')}`, 'bautismo');
    } catch (err) {
      console.error(err);
    } finally {
      setExportandoGlobal(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header principal con jerarquía tipográfica mejorada */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">Libro de bautismos</h1>
          <p className="text-slate-500 text-sm mt-1.5 font-sans">
            Registro canónico de bautizados — {PARROQUIA_CONFIG.nombre}
          </p>
        </div>
        
        {usuario?.rol === 'secretaria' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalOCROpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#6B1E2E]" />
              <span>Importar</span>
            </button>

            <Link
              to="/bautismos/nuevo"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#6B1E2E] hover:bg-[#541724] rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva partida</span>
            </Link>
          </div>
        )}
      </div>

      {/* 2. Tarjetas KPI con la paleta de marca unificada (Granate + Dorado + Terracota) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total</span>
            <div className="p-2 rounded-xl bg-slate-100/80 text-slate-700">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.total.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Partidas registradas</p>
          </div>
        </div>

        {/* Activos - Granate Vivo */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B1E2E]">Activos</span>
            <div className="p-2 rounded-xl bg-[#FDF4F5] text-[#6B1E2E] border border-[#F3D2D7]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-[#6B1E2E] tracking-tight">{stats.activos.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Vigentes canónicamente</p>
          </div>
        </div>

        {/* Anulados - Muted Sepia/Terracota */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#544648]">Anulados</span>
            <div className="p-2 rounded-xl bg-[#F4F1F2] text-[#544648] border border-[#DCD3D5]">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-[#544648] tracking-tight">{stats.anulados.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Registros invalidados</p>
          </div>
        </div>

        {/* Último folio - Vino Rosado */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B293F]">Último folio</span>
            <div className="p-2 rounded-xl bg-[#FBF0F2] text-[#8B293F] border border-[#F3C8D0]">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#8B293F] tracking-tight truncate">{stats.ultimoRef}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Último tomo asignado</p>
          </div>
        </div>

        {/* Este mes - Dorado Sacro */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9E721D]">Este mes</span>
            <div className="p-2 rounded-xl bg-[#FDF8EE] text-[#9E721D] border border-[#F5E5C7]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-[#9E721D] tracking-tight">{stats.esteMes.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Nuevos registros</p>
          </div>
        </div>

      </div>

      {/* 3. Contenedor de Tabla con Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        
        {/* Toolbar de búsqueda y filtros */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/40">
          
          {/* Buscador de texto */}
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, padres..."
              className="pl-10 w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6B1E2E]/20 focus:border-[#6B1E2E] transition-all"
              value={busqueda}
              onChange={(e) => {
                setFiltro('busqueda', e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Filtros rápidos y Exportar */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            
            {/* Filtro Año */}
            <div className="flex flex-col">
              <div
                className={`flex items-center gap-1.5 px-3 py-2 bg-white border rounded-xl text-xs font-semibold transition-colors ${
                  anioInvalido
                    ? 'border-amber-400 bg-amber-50/60 text-amber-800 ring-2 ring-amber-400/20'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                <Calendar className={`w-3.5 h-3.5 ${anioInvalido ? 'text-amber-500' : 'text-slate-400'}`} />
                <input
                  type="number"
                  placeholder="Año"
                  min="1900"
                  value={anio}
                  onChange={(e) => {
                    setFiltro('anio', e.target.value);
                    setPage(1);
                  }}
                  className="w-14 bg-transparent outline-none text-xs font-semibold text-slate-800"
                />
              </div>
              {anioInvalido && obtenerErrorAnio(anio) && (
                <span className="text-[11px] text-amber-600 font-medium mt-1 ml-1">{obtenerErrorAnio(anio)}</span>
              )}
            </div>

            {/* Filtro Libro */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="number"
                placeholder="Libro"
                min="1"
                value={libro}
                onChange={(e) => {
                  setFiltro('libro', e.target.value);
                  setPage(1);
                }}
                className="w-14 bg-transparent outline-none text-xs font-semibold text-slate-800"
              />
            </div>

            {/* Botón Filtros desplegable */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                estado ? 'bg-[#FDF4F5] text-[#6B1E2E] border-[#F3D2D7]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtros {estado && '(1)'}</span>
            </button>

            {/* Botón Exportar */}
            <button
              onClick={handleExportarVistaActual}
              disabled={exportandoGlobal || data.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-[#6B1E2E]" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Panel desplegable de estado */}
        {showFilters && (
          <div className="p-5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap gap-4 animate-in slide-in-from-top-1">
            <div className="w-full sm:w-64">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Estado de Partida</label>
              <select 
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6B1E2E]/20 focus:border-[#6B1E2E]"
                value={estado}
                onChange={(e) => {
                  setFiltro('estado', e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="requiere_revision">Requiere Revisión</option>
                <option value="anulado">Anulados</option>
              </select>
            </div>
          </div>
        )}

        {/* Tabla de Registros */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-sans">
            <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">REFERENCIA</th>
                <th className="px-6 py-4">BAUTIZADO</th>
                <th className="px-6 py-4">FECHA</th>
                <th className="px-6 py-4">PADRES</th>
                <th className="px-6 py-4">ESTADO</th>
                <th className="px-6 py-4 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#6B1E2E] border-t-transparent"></div>
                    <p className="mt-2 text-sm text-slate-500 font-medium">Cargando partidas de bautismo...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    {anioInvalido ? (
                      <div className="flex flex-col items-center justify-center gap-1 text-amber-700">
                        <AlertTriangle className="w-5 h-5 text-amber-500 mb-1" />
                        <span className="font-bold">Filtro de año no válido</span>
                        <span className="text-xs text-slate-500">El año debe tener 4 dígitos y ser igual o mayor a 1900.</span>
                      </div>
                    ) : (
                      "No se encontraron bautismos con los filtros seleccionados."
                    )}
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const tiempoRelativo = formatTiempoRelativo(item.fecha_bautismo);
                  const fechaFormateada = item.fecha_bautismo 
                    ? format(parseISO(item.fecha_bautismo), "d MMM yyyy", { locale: es })
                    : 'Sin fecha';

                  const apellidos = item.apellidos_bautizado ? String(item.apellidos_bautizado).trim() : '';
                  const nombres = item.nombre_bautizado ? String(item.nombre_bautizado).trim() : '';
                  const nombreCompleto = apellidos && nombres ? `${apellidos}, ${nombres}` : (nombres || apellidos || 'Sin nombre');

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      
                      {/* Referencia L:1 F:1 Nº1 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#FDF4F5] text-[#6B1E2E] border border-[#F3D2D7]">
                          {item.libro ? `L:${item.libro} ` : ''}F:{item.folio} Nº{item.numero}
                        </span>
                      </td>

                      {/* Bautizado */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 text-sm block">
                          {nombreCompleto}
                        </span>
                      </td>

                      {/* Fecha y tiempo relativo */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800 text-xs">{fechaFormateada}</div>
                        {tiempoRelativo && (
                          <div className="text-[11px] font-medium text-slate-400 mt-0.5">{tiempoRelativo}</div>
                        )}
                      </td>

                      {/* Padres */}
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-0.5 max-w-xs">
                          {item.nombre_padre && (
                            <div className="truncate text-slate-600">
                              <span className="font-bold text-slate-800 mr-1">P:</span>{item.nombre_padre}
                            </div>
                          )}
                          {item.nombre_madre && (
                            <div className="truncate text-slate-600">
                              <span className="font-bold text-slate-800 mr-1">M:</span>{item.nombre_madre}
                            </div>
                          )}
                          {!item.nombre_padre && !item.nombre_madre && (
                            <span className="text-slate-400 italic">No registra</span>
                          )}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <EstadoBadge estado={item.estado} />
                      </td>

                      {/* Acciones en grupo */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs divide-x divide-slate-100">
                          <Link 
                            to={`/bautismos/${item.id}`}
                            className="p-2 text-slate-400 hover:text-[#6B1E2E] hover:bg-slate-50 transition-colors"
                            title="Ver Detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedPartida(item);
                              setModalExportacionOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-[#6B1E2E] hover:bg-slate-50 transition-colors cursor-pointer"
                            title="Exportar Partida"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {usuario?.rol === 'secretaria' && item.estado !== 'anulado' && (
                            <Link 
                              to={`/bautismos/${item.id}/editar`}
                              className="p-2 text-slate-400 hover:text-[#6B1E2E] hover:bg-slate-50 transition-colors"
                              title="Editar Partida"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 text-xs text-slate-500 font-medium">
          <div>
            Mostrando {data.length > 0 ? (page - 1) * 20 + 1 : 0}-{Math.min(page * 20, totalCount)} de {totalCount.toLocaleString()} registros
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="w-8 h-8 flex items-center justify-center border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                let pNum = page;
                if (totalPages <= 5) pNum = idx + 1;
                else if (page <= 3) pNum = idx + 1;
                else if (page >= totalPages - 2) pNum = totalPages - 4 + idx;
                else pNum = page - 2 + idx;

                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      page === pNum
                        ? 'bg-[#6B1E2E] text-white border-[#6B1E2E]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}

              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="w-8 h-8 flex items-center justify-center border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {selectedPartida && (
        <ModalExportacion
          isOpen={modalExportacionOpen}
          onClose={() => setModalExportacionOpen(false)}
          data={selectedPartida}
          tipo="bautismo"
        />
      )}

      <Suspense fallback={null}>
        <ModalImportacionOCR 
          isOpen={modalOCROpen}
          onClose={() => setModalOCROpen(false)}
          tipo="bautismo"
          onSuccess={() => {
            setModalOCROpen(false);
            loadStats();
            fetchBautismos(1, 20, { busqueda, estado, anio, libro }).then(result => {
              setData(result.data);
              setTotalCount(result.count);
              setTotalPages(result.totalPages);
              setPage(1);
            });
          }}
        />
      </Suspense>
    </div>
  );
}
