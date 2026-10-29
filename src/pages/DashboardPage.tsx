import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { supabase } from '@/lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import {
  Droplet, Heart, BookOpen, Flame,
  Loader2, CalendarOff,
  FileText, Plus, ChevronRight, ScanLine, Download, ChevronDown
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import StatCard from '@/components/dashboard/StatCard';
import { exportarCSV, COLUMNAS_SACRAMENTOS, prepararDatosParaExportacion } from '@/utils/exportarCSV';
import ExcelJS from 'exceljs';
import { PARROQUIA_CONFIG } from '@/utils/constantes';

const ModalImportacionOCR = lazy(() => import('@/components/partidas/ModalImportacionOCR'));

/* ── Estilos reutilizables ──────────────────────────── */

const panelStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: '14px',
  boxShadow: '0 1px 2px rgba(74,20,40,0.06), 0 8px 24px -12px rgba(74,20,40,0.12)',
  overflow: 'hidden',
};

const btnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '7px',
  padding: '10px 16px', borderRadius: '9px',
  fontSize: '13.5px', fontWeight: 600,
  cursor: 'pointer', border: '1px solid #E9E1D6',
  background: '#FFFFFF', color: '#2B2320', whiteSpace: 'nowrap',
};

const btnPrimaryStyle: React.CSSProperties = {
  ...btnStyle,
  background: '#6B1E2E', color: '#fff', borderColor: '#6B1E2E',
};

/* ── Tipos de sacramento (config compartida) ───────── */

const SACRAMENTO_ITEMS = [
  { key: 'bautismo',      label: 'Bautismo',      labelPlural: 'Bautismos',       route: '/bautismos/nuevo',       listRoute: '/bautismos',        icon: <Droplet size={15} />, iconSm: <Droplet size={14} />, color: '#6B1E2E', tint: '#FDF4F5', table: 'sacramentos_bautismo' },
  { key: 'confirmacion',  label: 'Confirmación',  labelPlural: 'Confirmaciones',  route: '/confirmaciones/nuevo',  listRoute: '/confirmaciones',   icon: <Flame size={15} />,   iconSm: <Flame size={14} />,   color: '#C9973A', tint: '#FDF8EE', table: 'sacramentos_confirmacion' },
  { key: 'matrimonio',    label: 'Matrimonio',    labelPlural: 'Matrimonios',     route: '/matrimonios/nuevo',     listRoute: '/matrimonios',      icon: <Heart size={15} />,   iconSm: <Heart size={14} />,   color: '#8B293F', tint: '#FBF0F2', table: 'sacramentos_matrimonio' },
  { key: 'defuncion',     label: 'Defunción',     labelPlural: 'Defunciones',     route: '/defunciones/nuevo',     listRoute: '/defunciones',      icon: <BookOpen size={15} />,iconSm: <BookOpen size={14} />,color: '#544648', tint: '#F4F1F2', table: 'sacramentos_defuncion' },
] as const;

/* ── Estilo dropdown reutilizable ──────────────────── */

const dropdownContainerStyle: React.CSSProperties = {
  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
  background: '#FFFFFF', borderRadius: '12px', minWidth: '220px',
  boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
  border: '1px solid #E2E8F0', overflow: 'hidden', zIndex: 50,
};

function DropdownItem({ item, onClick, index }: { item: typeof SACRAMENTO_ITEMS[number]; onClick: () => void; index: number }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '11px',
        padding: '11px 16px', cursor: 'pointer',
        borderTop: index > 0 ? '1px solid #F1F5F9' : 'none',
        transition: 'background 0.12s ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#F8F9FB')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{
        width: '30px', height: '30px', borderRadius: '8px',
        background: item.tint, color: item.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {item.icon}
      </div>
      <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>{item.label}</span>
    </div>
  );
}

/* ── Datos del gráfico (estáticos) ──────────────────── */

const CHART_DATA: Record<string, {
  meses: string[];
  bautismos: number[];
  confirmaciones: number[];
  matrimonios: number[];
}> = {
  '2026': {
    meses: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
    bautismos:      [22, 18, 25, 30, 27, 35, 18],
    confirmaciones: [10,  8, 12, 15, 20, 28,  9],
    matrimonios:    [ 3,  5,  4,  6,  8,  4,  2],
  },
  '2025': {
    meses: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    bautismos:      [18, 22, 20, 28, 25, 31, 27, 24, 29, 33, 26, 30],
    confirmaciones: [ 8, 10, 14, 11, 18, 22, 16, 12, 19, 25, 14, 20],
    matrimonios:    [ 4,  3,  6,  5,  7,  4,  5,  3,  6,  4,  5,  7],
  },
  '2024': {
    meses: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    bautismos:      [15, 19, 17, 24, 21, 27, 23, 20, 26, 29, 22, 28],
    confirmaciones: [ 6,  9, 11,  9, 15, 18, 13,  9, 16, 21, 11, 16],
    matrimonios:    [ 3,  2,  5,  4,  6,  3,  4,  2,  5,  3,  4,  6],
  },
};

/* ── Colores por tipo de sacramento (Unificados) ─────────────────── */

const typeColors: Record<string, { c: string; tint: string }> = {
  bautismo:     { c: '#6B1E2E', tint: '#FDF4F5' },
  confirmacion: { c: '#C9973A', tint: '#FDF8EE' },
  matrimonio:   { c: '#8B293F', tint: '#FBF0F2' },
  defuncion:    { c: '#544648', tint: '#F4F1F2' },
};

/* ── Palette de colores pastel por columna para tablas formateadas ── */

const PASTEL_COLUMNS = [
  'EDF2F8', // Col 1: Soft Ice Blue
  'FCE4D6', // Col 2: Soft Peach / Pink
  'E2EFDA', // Col 3: Soft Sage Green
  'E7E6E6', // Col 4: Soft Lavender / Grey
  'D9E1F2', // Col 5: Soft Soft Blue
  'FFF2CC', // Col 6: Soft Warm Yellow
  'F2F2F2', // Col 7+: Soft Neutral Grey
];

/* ── Función Helper para Generar Tablas con Diseño Estructurado (Igual a Imagen) ── */

function construirTablaFormateadaEstiloImagen(
  sheet: ExcelJS.Worksheet,
  tituloTabla: string,
  metaInfo: { label: string; valor: string }[],
  encabezados: string[],
  filasDatos: (string | number)[][],
  totales?: (string | number)[]
) {
  const colCount = encabezados.length;
  sheet.views = [{ showGridLines: true }];

  // 1. Título principal enmarcado (Fila 1)
  sheet.mergeCells(1, 1, 1, colCount);
  const titleCell = sheet.getCell('A1');
  titleCell.value = tituloTabla;
  titleCell.font = { name: 'Arial', size: 13, bold: true, color: { argb: '000000' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FCE4D6' } }; // Soft Peach Fill
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 32;

  // Borde externo grueso para el título
  for (let c = 1; c <= colCount; c++) {
    const cell = sheet.getCell(1, c);
    cell.border = {
      top: { style: 'medium', color: { argb: '000000' } },
      bottom: { style: 'medium', color: { argb: '000000' } },
      left: c === 1 ? { style: 'medium', color: { argb: '000000' } } : { style: 'thin', color: { argb: '000000' } },
      right: c === colCount ? { style: 'medium', color: { argb: '000000' } } : { style: 'thin', color: { argb: '000000' } },
    };
  }

  // 2. Barra de información de metadatos (Fila 2)
  const metaText = metaInfo.map(m => `${m.label.toLowerCase()}: ${m.valor}`).join('    |    ');
  sheet.mergeCells(2, 1, 2, colCount);
  const metaCell = sheet.getCell('A2');
  metaCell.value = metaText;
  metaCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: '333333' } };
  metaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } };
  metaCell.alignment = { horizontal: 'left', vertical: 'middle' };
  sheet.getRow(2).height = 22;

  for (let c = 1; c <= colCount; c++) {
    sheet.getCell(2, c).border = {
      top: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
      left: c === 1 ? { style: 'medium', color: { argb: '000000' } } : { style: 'thin', color: { argb: '000000' } },
      right: c === colCount ? { style: 'medium', color: { argb: '000000' } } : { style: 'thin', color: { argb: '000000' } },
    };
  }

  // 3. Fila de Encabezados de Columna (Fila 3)
  const headerRow = sheet.addRow(encabezados);
  sheet.getRow(3).height = 28;

  headerRow.eachCell((cell, colIdx) => {
    cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '595959' } }; // Dark Slate Grey
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: '000000' } },
      bottom: { style: 'medium', color: { argb: '000000' } },
      left: colIdx === 1 ? { style: 'medium', color: { argb: '000000' } } : { style: 'thin', color: { argb: '000000' } },
      right: colIdx === colCount ? { style: 'medium', color: { argb: '000000' } } : { style: 'thin', color: { argb: '000000' } },
    };
  });

  // 4. Filas de Datos con Colores Pastel Distintos por Columna y Bordes Completos
  filasDatos.forEach((rowVals, rIdx) => {
    const rowNum = 4 + rIdx;
    const dataRow = sheet.addRow(rowVals);
    sheet.getRow(rowNum).height = 21;

    dataRow.eachCell((cell, colIdx) => {
      const colorBg = PASTEL_COLUMNS[Math.min(colIdx - 1, PASTEL_COLUMNS.length - 1)];
      cell.font = { name: 'Arial', size: 9, color: { argb: '000000' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorBg } };
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        left: colIdx === 1 ? { style: 'medium', color: { argb: '000000' } } : { style: 'thin', color: { argb: '000000' } },
        right: colIdx === colCount ? { style: 'medium', color: { argb: '000000' } } : { style: 'thin', color: { argb: '000000' } },
      };

      // Alineación por tipo de contenido
      const val = rowVals[colIdx - 1];
      if (typeof val === 'number') {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (Number.isInteger(val)) {
          cell.numberFormat = '#,##0';
        } else {
          cell.numberFormat = '0.0%';
        }
      } else if (typeof val === 'string' && (val.includes('/') || /^\d+$/.test(val))) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: colIdx === 1 ? 'center' : 'left', vertical: 'middle' };
      }
    });
  });

  // 5. Fila de Totales al Final (Fila N)
  if (totales) {
    const totalRowNum = 4 + filasDatos.length;
    const totalRow = sheet.addRow(totales);
    sheet.getRow(totalRowNum).height = 25;

    totalRow.eachCell((cell, colIdx) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '595959' } }; // Dark Slate Grey Total Row
      cell.alignment = { horizontal: colIdx === 1 ? 'center' : 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        left: colIdx === 1 ? { style: 'medium', color: { argb: '000000' } } : { style: 'thin', color: { argb: '000000' } },
        right: colIdx === colCount ? { style: 'medium', color: { argb: '000000' } } : { style: 'thin', color: { argb: '000000' } },
      };

      const val = totales[colIdx - 1];
      if (typeof val === 'number') {
        cell.numberFormat = Number.isInteger(val) ? '#,##0' : '0.0%';
      }
    });
  }

  // 6. Ajuste Automático de Ancho de Columnas
  encabezados.forEach((h, colIdx) => {
    let maxLen = h.length;
    filasDatos.forEach(r => {
      const v = String(r[colIdx] ?? '');
      if (v.length > maxLen) maxLen = v.length;
    });
    sheet.getColumn(colIdx + 1).width = Math.max(14, Math.min(45, maxLen + 5));
  });
}



/* ── Función para renderizar el gráfico de barras SVG ── */

function renderBarChart(year: string) {
  const d = CHART_DATA[year];
  if (!d) return null;

  const BAR_H = 160;
  const groupW = Math.floor(600 / d.meses.length);
  const bw = Math.max(8, Math.floor(groupW * 0.22));
  const gap = 3;
  const totalGroupW = bw * 3 + gap * 2;
  const groupPad = Math.floor((groupW - totalGroupW) / 2);
  const colors = ['#6B1E2E', '#C9973A', '#8B293F'];
  const series = [d.bautismos, d.confirmaciones, d.matrimonios];
  const maxVal = Math.max(...series.flat());
  const svgW = groupW * d.meses.length;

  const bars: JSX.Element[] = [];
  const labels: JSX.Element[] = [];

  d.meses.forEach((mes, i) => {
    const x0 = i * groupW + groupPad;
    series.forEach((s, si) => {
      const val = s[i];
      const h = Math.round((val / maxVal) * BAR_H);
      const x = x0 + si * (bw + gap);
      const y = BAR_H - h;
      bars.push(
        <g key={`b-${i}-${si}`}>
          <rect x={x} y={y} width={bw} height={h} rx={4} fill={colors[si]} opacity={0.88}>
            <title>{['Bautismos', 'Confirmaciones', 'Matrimonios'][si]}: {val}</title>
          </rect>
          <text x={x + bw / 2} y={y - 4} textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize={9} fill="#8A7F76">{val}</text>
        </g>
      );
    });
    labels.push(
      <text key={`l-${i}`} x={i * groupW + groupW / 2} y={BAR_H + 18} textAnchor="middle" fontFamily="'Source Sans 3', sans-serif" fontSize={11.5} fill="#8A7F76">{mes}</text>
    );
  });

  const guides = [0, 0.25, 0.5, 0.75, 1].map(f => {
    const y = Math.round(BAR_H - f * BAR_H);
    const val = Math.round(f * maxVal);
    return (
      <g key={`g-${f}`}>
        <line x1={0} y1={y} x2={svgW} y2={y} stroke="#E9E1D6" strokeWidth={1} strokeDasharray="4 4" />
        <text x={-6} y={y + 4} textAnchor="end" fontFamily="'IBM Plex Mono', monospace" fontSize={9.5} fill="#8A7F76">{val}</text>
      </g>
    );
  });

  return (
    <svg width="100%" viewBox={`-30 -10 ${svgW + 40} ${BAR_H + 42}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
      {guides}{bars}{labels}
    </svg>
  );
}

/* ── Componente principal ───────────────────────────── */

export default function DashboardPage() {
  const { usuario } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    bautismos: 0,
    confirmaciones: 0,
    matrimonios: 0,
    defunciones: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartYear, setChartYear] = useState('2025');

  // Dropdown states
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [showQuickNewMenu, setShowQuickNewMenu] = useState(false);
  const [showOcrMenu, setShowOcrMenu] = useState(false);
  const [showCsvMenu, setShowCsvMenu] = useState(false);

  // OCR modal
  const [ocrOpen, setOcrOpen] = useState(false);
  const [ocrTipo, setOcrTipo] = useState<'bautismo' | 'confirmacion' | 'defuncion' | 'matrimonio'>('bautismo');

  // Activity filter
  const [activityFilter, setActivityFilter] = useState<string>('todos');

  // Export states
  const [exportingReport, setExportingReport] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  // Refs for close-on-outside-click
  const newMenuRef = useRef<HTMLDivElement>(null);
  const reportMenuRef = useRef<HTMLDivElement>(null);
  const quickNewMenuRef = useRef<HTMLDivElement>(null);
  const ocrMenuRef = useRef<HTMLDivElement>(null);
  const csvMenuRef = useRef<HTMLDivElement>(null);

  // Close all dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) setShowNewMenu(false);
      if (reportMenuRef.current && !reportMenuRef.current.contains(e.target as Node)) setShowReportMenu(false);
      if (quickNewMenuRef.current && !quickNewMenuRef.current.contains(e.target as Node)) setShowQuickNewMenu(false);
      if (ocrMenuRef.current && !ocrMenuRef.current.contains(e.target as Node)) setShowOcrMenu(false);
      if (csvMenuRef.current && !csvMenuRef.current.contains(e.target as Node)) setShowCsvMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [
          { count: countBautismos },
          { count: countConfirmaciones },
          { count: countMatrimonios },
          { count: countDefunciones }
        ] = await Promise.all([
          supabase.from('sacramentos_bautismo').select('*', { count: 'exact', head: true }).neq('estado', 'anulado'),
          supabase.from('sacramentos_confirmacion').select('*', { count: 'exact', head: true }).neq('estado', 'anulado'),
          supabase.from('sacramentos_matrimonio').select('*', { count: 'exact', head: true }).neq('estado', 'anulado'),
          supabase.from('sacramentos_defuncion').select('*', { count: 'exact', head: true }).neq('estado', 'anulado'),
        ]);

        setStats({
          bautismos: countBautismos || 0,
          confirmaciones: countConfirmaciones || 0,
          matrimonios: countMatrimonios || 0,
          defunciones: countDefunciones || 0,
        });

        const [
          { data: b },
          { data: c },
          { data: m },
          { data: d }
        ] = await Promise.all([
          supabase.from('sacramentos_bautismo').select('id, libro, folio, numero, creado_en, nombre_bautizado, apellidos_bautizado').neq('estado', 'anulado').order('creado_en', { ascending: false }).limit(3),
          supabase.from('sacramentos_confirmacion').select('id, libro, folio, numero, creado_en, nombre_confirmado, apellidos_confirmado').neq('estado', 'anulado').order('creado_en', { ascending: false }).limit(3),
          supabase.from('sacramentos_matrimonio').select('id, libro, folio, numero, creado_en, nombre_esposo, nombre_esposa').neq('estado', 'anulado').order('creado_en', { ascending: false }).limit(3),
          supabase.from('sacramentos_defuncion').select('id, libro, folio, numero, creado_en, nombre_difunto, apellidos_difunto').neq('estado', 'anulado').order('creado_en', { ascending: false }).limit(3),
        ]);

        const merged = [
          ...(b || []).map(x => ({ ...x, type: 'bautismo', title: `Bautismo de ${x.nombre_bautizado} ${x.apellidos_bautizado}` })),
          ...(c || []).map(x => ({ ...x, type: 'confirmacion', title: `Confirmación de ${x.nombre_confirmado} ${x.apellidos_confirmado}` })),
          ...(m || []).map(x => ({ ...x, type: 'matrimonio', title: `Matrimonio de ${x.nombre_esposo} y ${x.nombre_esposa}` })),
          ...(d || []).map(x => ({ ...x, type: 'defuncion', title: `Defunción de ${x.nombre_difunto} ${x.apellidos_difunto}` }))
        ];

        merged.sort((x, y) => new Date(y.creado_en).getTime() - new Date(x.creado_en).getTime());

        setRecentActivity(merged.slice(0, 8));

      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  /* ── Exportar reporte Excel con formato exacto a imagen de referencia ─── */

  const handleExportReport = useCallback(async (tipo: string) => {
    setShowReportMenu(false);
    setExportingReport(true);
    try {
      const tables = tipo === 'todos'
        ? SACRAMENTO_ITEMS.map(s => ({ ...s }))
        : SACRAMENTO_ITEMS.filter(s => s.key === tipo);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = PARROQUIA_CONFIG.nombre;
      workbook.lastModifiedBy = 'Sistema Parroquial';
      workbook.created = new Date();

      /* ─────────────────────────────────────────────────────────────
         HOJA 1: 📊 RESUMEN EJECUTIVO (FORMATO TABLA ESTRUCTURADA DE IMAGEN)
         ───────────────────────────────────────────────────────────── */
      const summarySheet = workbook.addWorksheet('📊 Resumen General');
      const totalGeneral = stats.bautismos + stats.confirmaciones + stats.matrimonios + stats.defunciones;

      const encabezadosResumen = ['Sacramento', 'Total Actas Registradas', 'Porcentaje del Total (%)', 'Estado de Cobertura'];
      const filasResumen = [
        ['Bautismos', stats.bautismos, totalGeneral > 0 ? stats.bautismos / totalGeneral : 0, '100% Activo'],
        ['Confirmaciones', stats.confirmaciones, totalGeneral > 0 ? stats.confirmaciones / totalGeneral : 0, '100% Activo'],
        ['Matrimonios', stats.matrimonios, totalGeneral > 0 ? stats.matrimonios / totalGeneral : 0, '100% Activo'],
        ['Defunciones', stats.defunciones, totalGeneral > 0 ? stats.defunciones / totalGeneral : 0, '100% Activo'],
      ];
      const totalesResumen = ['total', totalGeneral, 1.0, ''];

      construirTablaFormateadaEstiloImagen(
        summarySheet,
        'Resumen general de los registros sacramentales parroquiales.',
        [
          { label: 'entidad / parroquia', valor: `${PARROQUIA_CONFIG.nombre} (${PARROQUIA_CONFIG.ciudad})` },
          { label: 'unidad', valor: 'Número de Actas' },
          { label: 'fecha emisión', valor: format(new Date(), 'dd/MM/yyyy HH:mm') },
        ],
        encabezadosResumen,
        filasResumen,
        totalesResumen
      );

      /* ─────────────────────────────────────────────────────────────
         HOJAS DETALLADAS POR SACRAMENTO (ESTRUCTURA DE TABLA CON BORDES DE IMAGEN)
         ───────────────────────────────────────────────────────────── */
      for (const t of tables) {
        const { data, error } = await supabase
          .from(t.table)
          .select('*')
          .neq('estado', 'anulado')
          .order('libro', { ascending: true })
          .order('folio', { ascending: true })
          .order('numero', { ascending: true });

        if (error || !data || data.length === 0) continue;

        const sheet = workbook.addWorksheet(t.labelPlural);

        // Obtener nombres de columna en español e información limpia
        const colsDef = COLUMNAS_SACRAMENTOS[t.key] || [];
        const encabezados = colsDef.map(c => c.label);
        const datosLimpios = prepararDatosParaExportacion(data, t.key);

        const filasDatos: (string | number)[][] = datosLimpios.map(rowObj => {
          return colsDef.map(col => rowObj[col.label] ?? '');
        });

        const filaTotales: (string | number)[] = colsDef.map((_, i) => {
          if (i === 0) return 'total';
          if (i === 1) return data.length;
          return '';
        });

        construirTablaFormateadaEstiloImagen(
          sheet,
          `Registro general y control de libros de ${t.labelPlural.toLowerCase()}.`,
          [
            { label: 'parroquia', valor: PARROQUIA_CONFIG.nombre },
            { label: 'sacramento', valor: t.labelPlural },
            { label: 'total registros', valor: `${data.length}` },
          ],
          encabezados,
          filasDatos,
          filaTotales
        );
      }

      // Descargar archivo Excel
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const tipoLabel = tipo === 'todos' ? 'General' : SACRAMENTO_ITEMS.find(s => s.key === tipo)?.labelPlural || tipo;
      a.download = `Reporte_Tabla_${tipoLabel}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Error al exportar reporte:', err);
      alert('Error al generar el reporte. Intente nuevamente.');
    } finally {
      setExportingReport(false);
    }
  }, [stats]);

  /* ── Exportar CSV por tipo (con headers en español y BOM UTF-8) ─── */

  const handleExportCSV = useCallback(async (tipo: string) => {
    setShowCsvMenu(false);
    setExportingCsv(true);
    try {
      const tables = tipo === 'todos'
        ? SACRAMENTO_ITEMS
        : SACRAMENTO_ITEMS.filter(s => s.key === tipo);

      for (const t of tables) {
        const { data, error } = await supabase
          .from(t.table)
          .select('*')
          .neq('estado', 'anulado')
          .order('libro', { ascending: true })
          .order('folio', { ascending: true })
          .order('numero', { ascending: true });

        if (error || !data || data.length === 0) continue;

        await exportarCSV(data, `${t.labelPlural}_${format(new Date(), 'yyyy-MM-dd')}`, t.key);
      }
    } catch (err) {
      console.error('Error al exportar CSV:', err);
      alert('Error al exportar CSV. Intente nuevamente.');
    } finally {
      setExportingCsv(false);
    }
  }, []);

  /* ── Abrir modal OCR ─── */

  const handleOpenOcr = useCallback((tipo: 'bautismo' | 'confirmacion' | 'defuncion' | 'matrimonio') => {
    setShowOcrMenu(false);
    setOcrTipo(tipo);
    setOcrOpen(true);
  }, []);

  /* ── StatCards config ─── */

  const statCards = [
    {
      title: 'Bautismos',
      count: stats.bautismos,
      icon: <Droplet style={{ width: 17, height: 17 }} />,
      link: '/bautismos',
      colorHex: '#6B1E2E',
      iconBgClass: '',
      sparklinePoints: '0,22 30,20 60,21 90,15 120,17 150,10 180,12 220,4',
    },
    {
      title: 'Confirmaciones',
      count: stats.confirmaciones,
      icon: <Flame style={{ width: 17, height: 17 }} />,
      link: '/confirmaciones',
      colorHex: '#C9973A',
      iconBgClass: '',
      sparklinePoints: '0,10 30,14 60,9 90,16 120,13 150,18 180,15 220,6',
    },
    {
      title: 'Matrimonios',
      count: stats.matrimonios,
      icon: <Heart style={{ width: 17, height: 17 }} />,
      link: '/matrimonios',
      colorHex: '#8B293F',
      iconBgClass: '',
      sparklinePoints: '0,10 30,13 60,11 90,15 120,14 150,17 180,15 220,17',
    },
    {
      title: 'Defunciones',
      count: stats.defunciones,
      icon: <BookOpen style={{ width: 17, height: 17 }} />,
      link: '/defunciones',
      colorHex: '#544648',
      iconBgClass: '',
      sparklinePoints: '0,16 30,14 60,17 90,13 120,15 150,12 180,14 220,11',
    },
  ];

  /* ── Distribución total ─── */

  const total = stats.bautismos + stats.confirmaciones + stats.matrimonios + stats.defunciones;
  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;

  const distribDatos = [
    { label: 'Bautismos',      val: stats.bautismos,       pct: pct(stats.bautismos),       color: '#6B1E2E' },
    { label: 'Confirmaciones', val: stats.confirmaciones,  pct: pct(stats.confirmaciones),  color: '#C9973A' },
    { label: 'Matrimonios',    val: stats.matrimonios,     pct: pct(stats.matrimonios),     color: '#8B293F' },
    { label: 'Defunciones',    val: stats.defunciones,     pct: pct(stats.defunciones),     color: '#544648' },
  ];

  /* ── Actividad filtrada ─── */

  const filteredActivity = activityFilter === 'todos'
    ? recentActivity
    : recentActivity.filter(a => a.type === activityFilter);

  const FILTER_PILLS = [
    { key: 'todos',        label: 'Todos' },
    { key: 'bautismo',     label: 'Bautismos' },
    { key: 'confirmacion', label: 'Confirm.' },
    { key: 'matrimonio',   label: 'Matrim.' },
    { key: 'defuncion',    label: 'Defunc.' },
  ];

  /* ── Render ─── */

  return (
    <div className="space-y-8">

      {/* ── Page Head ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Panel de Control
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-sans">
            {usuario?.rol === 'secretaria' ? 'Bienvenida, Secretaría.' : 'Bienvenido, Padre.'} Resumen de la {PARROQUIA_CONFIG.nombre}.
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2.5 w-full sm:w-auto">

          {/* Exportar reporte dropdown */}
          <div ref={reportMenuRef} className="relative flex-1 sm:flex-initial">
            <button onClick={() => setShowReportMenu(v => !v)} style={btnStyle} className="w-full sm:w-auto justify-center cursor-pointer shadow-2xs" disabled={exportingReport}>
              {exportingReport ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
              <span>{exportingReport ? 'Generando...' : 'Exportar reporte'}</span>
              <ChevronDown size={13} style={{ marginLeft: '-2px', opacity: 0.6 }} />
            </button>
            {showReportMenu && (
              <div style={dropdownContainerStyle}>
                <div
                  onClick={() => handleExportReport('todos')}
                  style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '11px 16px', cursor: 'pointer', transition: 'background 0.12s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FAF7F1')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#F7EEF1', color: '#6B1E3C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={15} />
                  </div>
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#2B2320' }}>Todas las partidas</span>
                </div>
                {SACRAMENTO_ITEMS.map((item, i) => (
                  <DropdownItem key={item.key} item={item} index={i + 1} onClick={() => handleExportReport(item.key)} />
                ))}
              </div>
            )}
          </div>

          {/* Nuevo registro dropdown */}
          <div ref={newMenuRef} className="relative flex-1 sm:flex-initial">
            <button onClick={() => setShowNewMenu(v => !v)} style={btnPrimaryStyle} className="w-full sm:w-auto justify-center cursor-pointer shadow-xs">
              <Plus size={15} /> <span>Nuevo registro</span>
              <ChevronDown size={13} style={{ marginLeft: '-2px', opacity: 0.7 }} />
            </button>
            {showNewMenu && (
              <div style={dropdownContainerStyle}>
                {SACRAMENTO_ITEMS.map((item, i) => (
                  <DropdownItem key={item.key} item={item} index={i} onClick={() => { setShowNewMenu(false); navigate(item.route); }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
          <Loader2 style={{ width: 32, height: 32, color: '#8A7F76' }} className="animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Stat Cards Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
            {statCards.map((card, idx) => (
              <StatCard key={idx} {...card} />
            ))}
          </div>

          {/* ── Main Grid (1 col en mobile/tablet, 3 cols en desktop) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* ── Left Column (Actividad Reciente) ── */}
            <div className="lg:col-span-2 flex flex-col gap-4">

              {/* Panel: Actividad Reciente */}
              <div style={panelStyle}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-[#E2E8F0]">
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '20px', color: '#0F172A', margin: 0 }}>
                    Actividad reciente
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {FILTER_PILLS.map((p) => (
                      <span
                        key={p.key}
                        onClick={() => setActivityFilter(p.key)}
                        style={{
                          fontSize: '13px', fontWeight: 600,
                          padding: '6px 14px', borderRadius: '20px',
                          border: activityFilter === p.key ? 'none' : '1px solid #E2E8F0',
                          background: activityFilter === p.key ? '#6B1E2E' : '#FFFFFF',
                          color: activityFilter === p.key ? '#fff' : '#64748B',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >{p.label}</span>
                    ))}
                  </div>
                </div>

                {filteredActivity.length > 0 ? (
                  <div>
                    {filteredActivity.map((act) => {
                      const tc = typeColors[act.type as string] || typeColors.bautismo;
                      const detailRoute = `/${act.type === 'defuncion' ? 'defunciones' : act.type + 's'}/${act.id}`;

                      return (
                        <div
                          key={act.id}
                          onClick={() => navigate(detailRoute)}
                          style={{ display: 'flex', gap: '14px', padding: '16px 22px', cursor: 'pointer', borderTop: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#F8F9FB')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          {/* Badge circular */}
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '50%',
                            background: tc.tint, color: tc.c,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, border: '2px solid #fff',
                            boxShadow: '0 0 0 1px #E2E8F0',
                            marginTop: '2px',
                          }}>
                            {act.type === 'bautismo' && <Droplet size={15} />}
                            {act.type === 'confirmacion' && <Flame size={15} />}
                            {act.type === 'matrimonio' && <Heart size={15} />}
                            {act.type === 'defuncion' && <BookOpen size={15} />}
                          </div>

                          {/* Body */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>{act.title}</div>
                            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12.5px', color: '#64748B', marginTop: '4px', display: 'flex', gap: '12px' }}>
                              {act.libro ? <span>Libro {act.libro}</span> : null}
                              <span>Folio {act.folio}</span>
                              <span>N° {act.numero}</span>
                            </div>
                          </div>

                          {/* Right */}
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '13px', color: '#64748B' }}>
                              {format(parseISO(act.creado_en), "d MMM, yyyy", { locale: es })}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#6B1E2E', marginTop: '4px', display: 'block' }}>
                              Ver detalle →
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Footer */}
                    <div
                      style={{ padding: '14px 22px', textAlign: 'center', borderTop: '1px solid #E2E8F0', fontSize: '14px', fontWeight: 700, color: '#6B1E2E', cursor: 'pointer' }}
                      onClick={() => navigate('/bautismos')}
                    >
                      Ver toda la actividad →
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <CalendarOff style={{ width: 24, height: 24, color: '#64748B' }} />
                    </div>
                    <p style={{ fontWeight: 600, color: '#0F172A', fontSize: '15px', margin: 0 }}>Sin actividad reciente</p>
                    <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
                      {activityFilter !== 'todos'
                        ? `No hay registros de ${FILTER_PILLS.find(p => p.key === activityFilter)?.label || activityFilter} recientes`
                        : 'Los nuevos registros aparecerán aquí'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right Column (Accesos rápidos & Distribución) ── */}
            <div className="lg:col-span-1 flex flex-col gap-5">

              {/* Panel: Accesos rápidos */}
              <div style={panelStyle}>
                <div style={{ padding: '20px 22px 16px 22px', borderBottom: '1px solid #E2E8F0' }}>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '18px', color: '#0F172A', margin: 0 }}>Accesos rápidos</h2>
                </div>

                {/* Nueva partida — dropdown */}
                <div ref={quickNewMenuRef} style={{ position: 'relative' }}>
                  <div
                    onClick={() => setShowQuickNewMenu(v => !v)}
                    style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '14px 20px', cursor: 'pointer', borderTop: '1px solid #F1F5F9', transition: 'background 0.12s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F8F9FB')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FDF4F5', color: '#6B1E2E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Plus size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>Nueva partida</div>
                      <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>Bautismo, confirmación, matrimonio…</div>
                    </div>
                    <ChevronDown size={16} color="#64748B" style={{ transform: showQuickNewMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                  </div>

                  {showQuickNewMenu && (
                    <div style={{ borderTop: '1px solid #E2E8F0', background: '#F8F9FB' }}>
                      {SACRAMENTO_ITEMS.map((item) => (
                        <div
                          key={item.key}
                          onClick={() => { setShowQuickNewMenu(false); navigate(item.route); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 20px 11px 34px', cursor: 'pointer', transition: 'background 0.12s ease' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#E2E8F0')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: item.tint, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {item.icon}
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Importar con IA — dropdown */}
                <div ref={ocrMenuRef} style={{ position: 'relative' }}>
                  <div
                    onClick={() => setShowOcrMenu(v => !v)}
                    style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '14px 20px', cursor: 'pointer', borderTop: '1px solid #F1F5F9', transition: 'background 0.12s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F8F9FB')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FDF8EE', color: '#C9973A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ScanLine size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>Importar con IA</div>
                      <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>Escanear fotos de libros</div>
                    </div>
                    <ChevronDown size={16} color="#64748B" style={{ transform: showOcrMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                  </div>

                  {showOcrMenu && (
                    <div style={{ borderTop: '1px solid #E2E8F0', background: '#F8F9FB' }}>
                      {SACRAMENTO_ITEMS.map((item) => (
                        <div
                          key={item.key}
                          onClick={() => handleOpenOcr(item.key as any)}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 20px 11px 34px', cursor: 'pointer', transition: 'background 0.12s ease' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#E2E8F0')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: item.tint, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {item.icon}
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Exportar CSV — dropdown */}
                <div ref={csvMenuRef} style={{ position: 'relative' }}>
                  <div
                    onClick={() => setShowCsvMenu(v => !v)}
                    style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '14px 20px', cursor: 'pointer', borderTop: '1px solid #F1F5F9', transition: 'background 0.12s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F8F9FB')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F4F1F2', color: '#544648', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {exportingCsv ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>{exportingCsv ? 'Exportando...' : 'Exportar CSV'}</div>
                      <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>Descargar registros</div>
                    </div>
                    <ChevronDown size={16} color="#64748B" style={{ transform: showCsvMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                  </div>

                  {showCsvMenu && (
                    <div style={{ borderTop: '1px solid #E2E8F0', background: '#F8F9FB' }}>
                      <div
                        onClick={() => handleExportCSV('todos')}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 20px 11px 34px', cursor: 'pointer', transition: 'background 0.12s ease' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#E2E8F0')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#FDF4F5', color: '#6B1E2E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Download size={14} />
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Todas las partidas</span>
                      </div>
                      {SACRAMENTO_ITEMS.map((item) => (
                        <div
                          key={item.key}
                          onClick={() => handleExportCSV(item.key)}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 20px 11px 34px', cursor: 'pointer', transition: 'background 0.12s ease' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#E2E8F0')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: item.tint, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {item.icon}
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Panel: Distribución total */}
              <div style={panelStyle}>
                <div style={{ padding: '20px 22px 16px 22px', borderBottom: '1px solid #E2E8F0' }}>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '18px', color: '#0F172A', margin: 0 }}>Distribución total</h2>
                </div>
                <div style={{ padding: '12px 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {distribDatos.map(d => (
                    <div key={d.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#0F172A' }}>{d.label}</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '14px', fontWeight: 700, color: d.color }}>{d.pct}%</span>
                      </div>
                      <div style={{ height: '8px', borderRadius: '20px', background: '#E2E8F0', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '20px', background: d.color, width: `${d.pct}%`, transition: 'width .6s cubic-bezier(.4,0,.2,1)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Panel: Registros por mes (full width) ── */}
          <div style={{ ...panelStyle, marginTop: '24px' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-[#E2E8F0]">
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '20px', color: '#0F172A', margin: 0 }}>Registros por mes</h2>
              <select
                value={chartYear}
                onChange={e => setChartYear(e.target.value)}
                style={{
                  appearance: 'none', fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '13px', fontWeight: 600, color: '#2B2320',
                  background: '#FAF7F1', border: '1px solid #E9E1D6',
                  borderRadius: '8px', padding: '7px 28px 7px 12px', cursor: 'pointer', outline: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A7F76' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                }}
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
            <div className="p-4 sm:p-6 overflow-x-auto">
              <div className="min-w-[480px]">
                {renderBarChart(chartYear)}
              </div>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '16px', justifyContent: 'center' }}>
                {[
                  { label: 'Bautismos',      color: '#6B1E2E' },
                  { label: 'Confirmaciones', color: '#C9973A' },
                  { label: 'Matrimonios',    color: '#8B293F' },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '3px', background: l.color, display: 'inline-block' }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Modal OCR ── */}
      <Suspense fallback={null}>
        <ModalImportacionOCR
          isOpen={ocrOpen}
          onClose={() => setOcrOpen(false)}
          onSuccess={() => {
            setOcrOpen(false);
            // Re-fetch dashboard data
            window.location.reload();
          }}
          tipo={ocrTipo}
        />
      </Suspense>
    </div>
  );
}
