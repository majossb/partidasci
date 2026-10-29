import ExcelJS from 'exceljs';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PARROQUIA_CONFIG } from '@/utils/constantes';

// ── Paleta de colores brand ──────────────────────────────────────
const COLOR = {
  burdeos:     'FF6B1E2E',  // primario
  bordeosOsc:  'FF4A1428',  // encabezados oscuros
  dorado:      'FFD4AF37',  // acento
  doradoClaro: 'FFFDF0D0',  // fondo suave dorado
  blanco:      'FFFFFFFF',
  grisClaro:   'FFFAF7F1',  // filas alternas
  grisEnc:     'FFF0EBE3',  // encabezados de sección
  verdeClaro:  'FFE8F5E9',  // confirmaciones
  azulClaro:   'FFE3F2FD',  // bautismos
  rojoClaro:   'FFFCE4EC',  // defunciones
  moradoClaro: 'FFEDE7F6',  // matrimonios
  textoOsc:    'FF2B2320',
  textoMed:    'FF6B5E56',
};

// ── Helpers de estilo ────────────────────────────────────────────
function fillSolid(argb: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

function borderFino(color = 'FFD4AF37'): Partial<ExcelJS.Borders> {
  const s = { style: 'thin' as const, color: { argb: color } };
  return { top: s, bottom: s, left: s, right: s };
}

function bordeInferior(color = 'FFD4AF37'): Partial<ExcelJS.Borders> {
  return { bottom: { style: 'medium' as const, color: { argb: color } } };
}

function estiloTituloPrincipal(row: ExcelJS.Row, _numCols: number) {
  row.height = 36;
  row.eachCell(cell => {
    cell.font = { bold: true, size: 16, color: { argb: COLOR.blanco }, name: 'Calibri' };
    cell.fill = fillSolid(COLOR.burdeos);
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
}

function estiloSubtitulo(row: ExcelJS.Row) {
  row.height = 20;
  row.eachCell(cell => {
    cell.font = { italic: true, size: 11, color: { argb: COLOR.blanco } };
    cell.fill = fillSolid(COLOR.bordeosOsc);
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
}

function estiloSeccion(cell: ExcelJS.Cell) {
  cell.font = { bold: true, size: 11, color: { argb: COLOR.bordeosOsc } };
  cell.fill = fillSolid(COLOR.grisEnc);
  cell.border = bordeInferior(COLOR.dorado);
  cell.alignment = { horizontal: 'left', vertical: 'middle' };
}

function estiloEncabezadoTabla(row: ExcelJS.Row) {
  row.height = 22;
  row.eachCell(cell => {
    cell.font = { bold: true, size: 10, color: { argb: COLOR.blanco } };
    cell.fill = fillSolid(COLOR.bordeosOsc);
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false };
    cell.border = borderFino(COLOR.dorado);
  });
}

function estiloFilaDatos(row: ExcelJS.Row, esImpar: boolean, bgImpar = COLOR.blanco, bgPar = COLOR.grisClaro) {
  const bg = esImpar ? bgImpar : bgPar;
  row.eachCell({ includeEmpty: true }, cell => {
    cell.fill = fillSolid(bg);
    cell.font = { size: 10, color: { argb: COLOR.textoOsc } };
    cell.alignment = { vertical: 'middle', wrapText: false };
    cell.border = { bottom: { style: 'hair', color: { argb: 'FFE0D6CC' } } };
  });
  row.height = 18;
}

function estiloTotal(row: ExcelJS.Row) {
  row.height = 22;
  row.eachCell({ includeEmpty: true }, cell => {
    cell.font = { bold: true, size: 10, color: { argb: COLOR.blanco } };
    cell.fill = fillSolid(COLOR.burdeos);
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = borderFino(COLOR.dorado);
  });
}

// ── Helpers de cálculo ───────────────────────────────────────────
function contarPorMes(data: any[], campoFecha: string): number[] {
  const counts = new Array(12).fill(0);
  for (const item of data) {
    const f = item[campoFecha];
    if (f) {
      const m = new Date(f + 'T12:00:00').getMonth();
      if (m >= 0 && m < 12) counts[m]++;
    }
  }
  return counts;
}

function pct(n: number, total: number): string {
  return total > 0 ? `${((n / total) * 100).toFixed(1)}%` : '0.0%';
}

function mesMaximo(bx: number[], cx: number[], mx: number[], dx: number[], meses: string[]): string {
  const totales = bx.map((b, i) => b + cx[i] + mx[i] + dx[i]);
  const maxVal = Math.max(...totales);
  if (maxVal === 0) return 'Sin registros en el año';
  const maxIdx = totales.indexOf(maxVal);
  return `${meses[maxIdx]} (${totales[maxIdx]} registros)`;
}

function masFrequente(b: number, c: number, m: number, d: number): string {
  const map: [string, number][] = [['Bautismos', b], ['Confirmaciones', c], ['Matrimonios', m], ['Defunciones', d]];
  return map.sort((a, z) => z[1] - a[1])[0][0];
}

function formatFecha(v: any): string {
  if (!v) return '';
  try { return format(new Date(v + 'T12:00:00'), "d 'de' MMMM 'de' yyyy", { locale: es }); }
  catch { return String(v); }
}

function descargarBuffer(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Fetch helper con paginación de 1000 registros ───────────────────────────
async function fetchTabla(tabla: string, campoFecha: string, anio: number): Promise<any[]> {
  const PAGE_SIZE = 1000;
  let allData: any[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(tabla)
      .select('*')
      .gte(campoFecha, `${anio}-01-01`)
      .lte(campoFecha, `${anio}-12-31`)
      .neq('estado', 'anulado')
      .order('folio')
      .order('numero')
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allData = allData.concat(data);
    hasMore = data.length === PAGE_SIZE;
    from += PAGE_SIZE;
  }

  return allData;
}

// ── HOJA 1: Resumen ──────────────────────────────────────────────
function crearHojaResumen(
  wb: ExcelJS.Workbook,
  anio: number,
  bautismos: any[],
  confirmaciones: any[],
  matrimonios: any[],
  defunciones: any[]
) {
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio',
                 'Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const ws = wb.addWorksheet('Resumen');

  const bxMes = contarPorMes(bautismos, 'fecha_bautismo');
  const cxMes = contarPorMes(confirmaciones, 'fecha_confirmacion');
  const mxMes = contarPorMes(matrimonios, 'fecha_matrimonio');
  const dxMes = contarPorMes(defunciones, 'fecha_sepultura');

  const total = bautismos.length + confirmaciones.length + matrimonios.length + defunciones.length;
  const fechaGen = format(new Date(), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });

  ws.columns = [
    { width: 24 }, { width: 16 }, { width: 18 }, { width: 16 }, { width: 16 }, { width: 14 }, { width: 13 },
  ];

  // Fila 1 vacía
  ws.addRow([]);

  // Fila 2: título
  const r2 = ws.addRow([`INFORME PARROQUIAL ANUAL — ${PARROQUIA_CONFIG.nombre.toUpperCase()}`]);
  ws.mergeCells(2, 1, 2, 7);
  estiloTituloPrincipal(r2, 7);

  // Fila 3: subtítulo
  const r3 = ws.addRow([`Año ${anio}   ·   ${PARROQUIA_CONFIG.diocesis}   ·   Generado el ${fechaGen}`]);
  ws.mergeCells(3, 1, 3, 7);
  estiloSubtitulo(r3);

  // Fila 4 vacía
  ws.addRow([]);

  // Sección resumen
  const r5 = ws.addRow(['RESUMEN DE SACRAMENTOS']);
  ws.mergeCells(5, 1, 5, 7);
  r5.height = 20;
  estiloSeccion(r5.getCell(1));

  const r6 = ws.addRow(['Sacramento', 'Total actas', '% del total', '', '', '', '']);
  estiloEncabezadoTabla(r6);

  const sacramentos = [
    { nombre: 'Bautismos',      n: bautismos.length,      bg: COLOR.azulClaro   },
    { nombre: 'Confirmaciones', n: confirmaciones.length,  bg: COLOR.verdeClaro  },
    { nombre: 'Matrimonios',    n: matrimonios.length,     bg: COLOR.moradoClaro },
    { nombre: 'Defunciones',    n: defunciones.length,     bg: COLOR.rojoClaro   },
  ];

  sacramentos.forEach((s, i) => {
    const row = ws.addRow([s.nombre, s.n, pct(s.n, total)]);
    ws.mergeCells(7 + i, 3, 7 + i, 7);
    row.height = 20;
    row.getCell(1).font = { bold: true, size: 10, color: { argb: COLOR.bordeosOsc } };
    row.getCell(1).fill = fillSolid(s.bg);
    row.getCell(2).fill = fillSolid(s.bg);
    row.getCell(2).font = { bold: true, size: 12, color: { argb: COLOR.bordeosOsc } };
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(3).fill = fillSolid(s.bg);
    row.getCell(3).font = { size: 10, color: { argb: COLOR.textoMed } };
    row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
    [1,2,3].forEach(c => row.getCell(c).border = borderFino('FFE0D6CC'));
  });

  // Fila TOTAL
  const rTot = ws.addRow(['TOTAL', total, '100.0%']);
  ws.mergeCells(11, 3, 11, 7);
  estiloTotal(rTot);

  // Separador
  ws.addRow([]);

  // Sección distribución mensual
  const r13 = ws.addRow(['DISTRIBUCIÓN POR MES']);
  ws.mergeCells(13, 1, 13, 7);
  r13.height = 20;
  estiloSeccion(r13.getCell(1));

  const r14 = ws.addRow(['Mes', 'Bautismos', 'Confirmaciones', 'Matrimonios', 'Defunciones', 'Total mes', '% del año']);
  estiloEncabezadoTabla(r14);

  MESES.forEach((mes, i) => {
    const t = bxMes[i] + cxMes[i] + mxMes[i] + dxMes[i];
    const row = ws.addRow([mes, bxMes[i], cxMes[i], mxMes[i], dxMes[i], t, pct(t, total)]);
    estiloFilaDatos(row, i % 2 === 0);
    row.getCell(6).font = { bold: true, size: 10, color: { argb: COLOR.bordeosOsc } };
  });

  // Total mensual
  const rTotM = ws.addRow(['TOTAL', bautismos.length, confirmaciones.length, matrimonios.length, defunciones.length, total, '100.0%']);
  estiloTotal(rTotM);

  // Separador
  ws.addRow([]);

  // Observaciones automáticas
  const rObs = ws.addRow(['OBSERVACIONES AUTOMÁTICAS']);
  ws.mergeCells(28, 1, 28, 7);
  rObs.height = 20;
  estiloSeccion(rObs.getCell(1));

  const obs = [
    `Mes con mayor actividad: ${mesMaximo(bxMes, cxMes, mxMes, dxMes, MESES)}`,
    `Sacramento más frecuente: ${masFrequente(bautismos.length, confirmaciones.length, matrimonios.length, defunciones.length)}`,
    `Promedio mensual de registros: ${(total / 12).toFixed(1)}`,
    `Total de actas registradas en ${anio}: ${total}`,
  ];

  obs.forEach((texto, i) => {
    const row = ws.addRow([texto]);
    ws.mergeCells(29 + i, 1, 29 + i, 7);
    row.height = 18;
    row.getCell(1).font = { size: 10, color: { argb: COLOR.textoOsc } };
    row.getCell(1).fill = fillSolid(i % 2 === 0 ? COLOR.blanco : COLOR.grisClaro);
    row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
  });

  ws.views = [{ state: 'frozen', ySplit: 3 }];
}

// ── HOJA genérica de datos ───────────────────────────────────────
interface ColDef { key: string; header: string; width: number; isDate?: boolean; }

function crearHojaDatos(
  wb: ExcelJS.Workbook,
  anio: number,
  data: any[],
  nombreHoja: string,
  titulo: string,
  cols: ColDef[],
  _campoFechaOrden: string
) {
  const ws = wb.addWorksheet(nombreHoja);
  const fechaGen = format(new Date(), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });

  ws.columns = cols.map(c => ({ width: c.width }));

  // Fila 1: título combinado
  const r1 = ws.addRow([`${titulo} — AÑO ${anio}`]);
  ws.mergeCells(1, 1, 1, cols.length);
  estiloTituloPrincipal(r1, cols.length);

  // Fila 2: subtítulo
  const r2 = ws.addRow([`${PARROQUIA_CONFIG.nombre} · ${PARROQUIA_CONFIG.diocesis} · Generado el ${fechaGen} · Total: ${data.length} registros`]);
  ws.mergeCells(2, 1, 2, cols.length);
  estiloSubtitulo(r2);

  // Fila 3: vacía
  ws.addRow([]);

  // Fila 4: encabezados de columnas
  const rHead = ws.addRow(cols.map(c => c.header));
  estiloEncabezadoTabla(rHead);

  // Filas de datos
  data.forEach((item, idx) => {
    const values = cols.map(col => {
      const v = item[col.key];
      if (col.isDate && v) return formatFecha(v);
      return v ?? '';
    });
    const row = ws.addRow(values);
    estiloFilaDatos(row, idx % 2 === 0);
    // Centrar columnas de libro/folio/número
    [1, 2, 3].forEach(c => {
      row.getCell(c).alignment = { horizontal: 'center', vertical: 'middle' };
    });
  });

  // Fila vacía + total
  ws.addRow([]);
  const rTotal = ws.addRow([`Total de registros: ${data.length}`]);
  ws.mergeCells(data.length + 6, 1, data.length + 6, cols.length);
  rTotal.getCell(1).font = { bold: true, italic: true, size: 10, color: { argb: COLOR.burdeos } };
  rTotal.getCell(1).alignment = { horizontal: 'right' };

  // Congelar las 4 primeras filas (encabezados)
  ws.views = [{ state: 'frozen', ySplit: 4 }];

  // Filtro automático en la fila de encabezados
  ws.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4, column: cols.length } };
}

// ── HOJA 6: Comparativo mensual ──────────────────────────────────
function crearHojaComparativo(
  wb: ExcelJS.Workbook,
  anio: number,
  bx: number[], cx: number[], mx: number[], dx: number[]
) {
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio',
                 'Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const ws = wb.addWorksheet('Comparativo Mensual');

  const totalBx = bx.reduce((a, b) => a + b, 0);
  const totalCx = cx.reduce((a, b) => a + b, 0);
  const totalMx = mx.reduce((a, b) => a + b, 0);
  const totalDx = dx.reduce((a, b) => a + b, 0);
  const grand = totalBx + totalCx + totalMx + totalDx;

  ws.columns = [
    { width: 18 }, { width: 14 }, { width: 18 }, { width: 14 }, { width: 14 }, { width: 12 }, { width: 13 },
  ];

  ws.addRow([]);

  const r2 = ws.addRow([`Comparativo mensual de sacramentos — ${PARROQUIA_CONFIG.nombre} — Año ${anio}`]);
  ws.mergeCells(2, 1, 2, 7);
  estiloTituloPrincipal(r2, 7);

  ws.addRow([]);

  const rH = ws.addRow(['Mes', 'Bautismos', 'Confirmaciones', 'Matrimonios', 'Defunciones', 'Total', '% del año']);
  estiloEncabezadoTabla(rH);

  // Colores por sacramento para resaltar el mayor de cada fila
  MESES.forEach((mes, i) => {
    const t = bx[i] + cx[i] + mx[i] + dx[i];
    const row = ws.addRow([mes, bx[i], cx[i], mx[i], dx[i], t, pct(t, grand)]);
    estiloFilaDatos(row, i % 2 === 0);

    // Resaltar celda con valor máximo de la fila
    const vals = [bx[i], cx[i], mx[i], dx[i]];
    const maxVal = Math.max(...vals);
    const maxCol = vals.indexOf(maxVal) + 2; // columnas 2-5
    if (maxVal > 0) {
      row.getCell(maxCol).fill = fillSolid(COLOR.doradoClaro);
      row.getCell(maxCol).font = { bold: true, size: 10, color: { argb: COLOR.bordeosOsc } };
    }

    row.getCell(6).font = { bold: true, size: 10, color: { argb: COLOR.bordeosOsc } };
    row.getCell(7).font = { italic: true, size: 10, color: { argb: COLOR.textoMed } };
  });

  const rTot = ws.addRow(['TOTAL', totalBx, totalCx, totalMx, totalDx, grand, '100.0%']);
  estiloTotal(rTot);

  ws.views = [{ state: 'frozen', ySplit: 4 }];
}

// ── Definición de columnas por sacramento ────────────────────────
const COLS_BAUTISMOS: ColDef[] = [
  { key: 'libro',               header: 'Libro',               width: 8  },
  { key: 'folio',               header: 'Folio',               width: 8  },
  { key: 'numero',              header: 'N°',                  width: 6  },
  { key: 'apellidos_bautizado', header: 'Apellidos',           width: 22 },
  { key: 'nombre_bautizado',    header: 'Nombre',              width: 20 },
  { key: 'fecha_bautismo',      header: 'Fecha de Bautismo',   width: 22, isDate: true },
  { key: 'fecha_nacimiento',    header: 'Fecha de Nacimiento', width: 22, isDate: true },
  { key: 'lugar_nacimiento',    header: 'Lugar de Nacimiento', width: 24 },
  { key: 'ministro',            header: 'Ministro',            width: 24 },
  { key: 'nombre_padre',        header: 'Padre',               width: 24 },
  { key: 'nombre_madre',        header: 'Madre',               width: 24 },
  { key: 'abuelos_paternos',    header: 'Abuelos Paternos',    width: 28 },
  { key: 'abuelos_maternos',    header: 'Abuelos Maternos',    width: 28 },
  { key: 'padrino',             header: 'Padrino',             width: 22 },
  { key: 'madrina',             header: 'Madrina',             width: 22 },
  { key: 'parroquia',           header: 'Parroquia',           width: 26 },
  { key: 'estado',              header: 'Estado',              width: 12 },
  { key: 'anotaciones',         header: 'Anotaciones',         width: 40 },
];

const COLS_CONFIRMACIONES: ColDef[] = [
  { key: 'libro',                header: 'Libro',                   width: 8  },
  { key: 'folio',                header: 'Folio',                   width: 8  },
  { key: 'numero',               header: 'N°',                      width: 6  },
  { key: 'apellidos_confirmado', header: 'Apellidos',               width: 22 },
  { key: 'nombre_confirmado',    header: 'Nombre',                  width: 20 },
  { key: 'fecha_confirmacion',   header: 'Fecha de Confirmación',   width: 24, isDate: true },
  { key: 'ministro',             header: 'Ministro',                width: 24 },
  { key: 'obispo',               header: 'Obispo',                  width: 24 },
  { key: 'lugar_confirmacion',   header: 'Lugar',                   width: 22 },
  { key: 'nombre_padre',         header: 'Padre',                   width: 24 },
  { key: 'nombre_madre',         header: 'Madre',                   width: 24 },
  { key: 'padrino_madrina',      header: 'Padrino / Madrina',       width: 24 },
  { key: 'parroquia_bautismo',   header: 'Parroquia de Bautismo',   width: 26 },
  { key: 'diocesis',             header: 'Diócesis',                width: 22 },
  { key: 'estado',               header: 'Estado',                  width: 12 },
  { key: 'anotaciones',          header: 'Anotaciones',             width: 40 },
];

const COLS_MATRIMONIOS: ColDef[] = [
  { key: 'libro',             header: 'Libro',               width: 8  },
  { key: 'folio',             header: 'Folio',               width: 8  },
  { key: 'numero',            header: 'N°',                  width: 6  },
  { key: 'apellidos_esposo',  header: 'Apellidos Esposo',    width: 22 },
  { key: 'nombre_esposo',     header: 'Nombre Esposo',       width: 20 },
  { key: 'apellidos_esposa',  header: 'Apellidos Esposa',    width: 22 },
  { key: 'nombre_esposa',     header: 'Nombre Esposa',       width: 20 },
  { key: 'fecha_matrimonio',  header: 'Fecha de Matrimonio', width: 24, isDate: true },
  { key: 'padre_esposo',      header: 'Padre del Esposo',    width: 24 },
  { key: 'madre_esposo',      header: 'Madre del Esposo',    width: 24 },
  { key: 'padre_esposa',      header: 'Padre de la Esposa',  width: 24 },
  { key: 'madre_esposa',      header: 'Madre de la Esposa',  width: 24 },
  { key: 'testigo1',          header: 'Testigo 1',           width: 22 },
  { key: 'testigo2',          header: 'Testigo 2',           width: 22 },
  { key: 'presencio',         header: 'Presenció',           width: 24 },
  { key: 'estado',            header: 'Estado',              width: 12 },
  { key: 'anotaciones',       header: 'Anotaciones',         width: 40 },
];

const COLS_DEFUNCIONES: ColDef[] = [
  { key: 'libro',            header: 'Libro',               width: 8  },
  { key: 'folio',            header: 'Folio',               width: 8  },
  { key: 'numero',           header: 'N°',                  width: 6  },
  { key: 'apellidos_difunto',header: 'Apellidos',           width: 22 },
  { key: 'nombre_difunto',   header: 'Nombre',              width: 20 },
  // En BD el campo es fecha_sepultura; en el SELECT(*) llega como fecha_sepultura
  { key: 'fecha_sepultura',  header: 'Fecha de Defunción',  width: 24, isDate: true },
  { key: 'edad',             header: 'Edad',                width: 8  },
  { key: 'lugar_origen',     header: 'Lugar de Origen',     width: 22 },
  { key: 'estado_civil',     header: 'Estado Civil',        width: 16 },
  { key: 'padre_difunto',    header: 'Padre',               width: 24 },
  { key: 'madre_difunto',    header: 'Madre',               width: 24 },
  { key: 'causa_muerte',     header: 'Causa de Muerte',     width: 28 },
  { key: 'estado',           header: 'Estado',              width: 12 },
  { key: 'anotaciones',      header: 'Anotaciones',         width: 40 },
];

// ── Función principal exportada ───────────────────────────────────
export async function generarInformeAnual(anio: number): Promise<void> {
  // 1. Fetch paralelo de las 4 tablas con paginación
  // ⚠️ Defunciones usa fecha_sepultura en la BD (no fecha_defuncion)
  const [bautismos, confirmaciones, matrimonios, defunciones] = await Promise.all([
    fetchTabla('sacramentos_bautismo',      'fecha_bautismo',    anio),
    fetchTabla('sacramentos_confirmacion',  'fecha_confirmacion', anio),
    fetchTabla('sacramentos_matrimonio',    'fecha_matrimonio',  anio),
    fetchTabla('sacramentos_defuncion',     'fecha_sepultura',   anio),
  ]);

  // 2. Crear workbook
  const wb = new ExcelJS.Workbook();
  wb.creator = PARROQUIA_CONFIG.nombre;
  wb.created = new Date();
  wb.properties.date1904 = false;

  // 3. Crear hojas en orden
  crearHojaResumen(wb, anio, bautismos, confirmaciones, matrimonios, defunciones);
  crearHojaDatos(wb, anio, bautismos,      'Bautismos',      'LIBRO DE BAUTISMOS',      COLS_BAUTISMOS,      'fecha_bautismo');
  crearHojaDatos(wb, anio, confirmaciones, 'Confirmaciones', 'LIBRO DE CONFIRMACIONES', COLS_CONFIRMACIONES, 'fecha_confirmacion');
  crearHojaDatos(wb, anio, matrimonios,    'Matrimonios',    'LIBRO DE MATRIMONIOS',    COLS_MATRIMONIOS,    'fecha_matrimonio');
  crearHojaDatos(wb, anio, defunciones,    'Defunciones',    'LIBRO DE DEFUNCIONES',    COLS_DEFUNCIONES,    'fecha_sepultura');

  const bxMes = contarPorMes(bautismos,      'fecha_bautismo');
  const cxMes = contarPorMes(confirmaciones, 'fecha_confirmacion');
  const mxMes = contarPorMes(matrimonios,    'fecha_matrimonio');
  const dxMes = contarPorMes(defunciones,    'fecha_sepultura');
  crearHojaComparativo(wb, anio, bxMes, cxMes, mxMes, dxMes);

  // 4. Descargar
  const fechaStr = format(new Date(), 'yyyyMMdd_HHmmss');
  const buffer = await wb.xlsx.writeBuffer();
  descargarBuffer(buffer, `informe_parroquial_${anio}_${fechaStr}.xlsx`);

  // 5. Auditoría — silenciar error sin interrumpir la descarga
  supabase.from('audit_log').insert({
    tabla: 'todas',
    operacion: 'INSERT',
    registro_id: '00000000-0000-0000-0000-000000000000',
    datos_nuevos: { operacion_real: 'GENERACION_INFORME_ANUAL', anio }
  }).catch(() => {});
}
