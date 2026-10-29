import ExcelJS from 'exceljs';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { PARROQUIA_CONFIG } from '@/utils/constantes';

export interface ColConfig {
  key: string;
  header: string;
  width?: number;
  isDate?: boolean;
}

export const COLUMNAS_SACRAMENTOS: Record<string, Array<{ key: string; label: string }>> = {
  bautismo: [
    { key: 'libro', label: 'Libro' },
    { key: 'folio', label: 'Folio' },
    { key: 'numero', label: 'Número' },
    { key: 'nombre_bautizado', label: 'Nombre(s)' },
    { key: 'apellidos_bautizado', label: 'Apellidos' },
    { key: 'fecha_bautismo', label: 'Fecha de Bautismo' },
    { key: 'fecha_nacimiento', label: 'Fecha de Nacimiento' },
    { key: 'lugar_nacimiento', label: 'Lugar de Nacimiento' },
    { key: 'ministro', label: 'Ministro Celebrante' },
    { key: 'nombre_padre', label: 'Padre' },
    { key: 'nombre_madre', label: 'Madre' },
    { key: 'padrino', label: 'Padrino' },
    { key: 'madrina', label: 'Madrina' },
    { key: 'abuelos_paternos', label: 'Abuelos Paternos' },
    { key: 'abuelos_maternos', label: 'Abuelos Maternos' },
    { key: 'da_fe', label: 'Da Fe' },
    { key: 'anotaciones', label: 'Anotaciones Marginadas' },
    { key: 'parroquia', label: 'Parroquia' },
  ],
  confirmacion: [
    { key: 'libro', label: 'Libro' },
    { key: 'folio', label: 'Folio' },
    { key: 'numero', label: 'Número' },
    { key: 'nombre_confirmado', label: 'Nombre(s)' },
    { key: 'apellidos_confirmado', label: 'Apellidos' },
    { key: 'fecha_confirmacion', label: 'Fecha de Confirmación' },
    { key: 'lugar_confirmacion', label: 'Lugar de Confirmación' },
    { key: 'ministro', label: 'Ministro Celebrante' },
    { key: 'nombre_padre', label: 'Padre' },
    { key: 'nombre_madre', label: 'Madre' },
    { key: 'padrino_madrina', label: 'Padrino / Madrina' },
    { key: 'parroquia_bautismo', label: 'Parroquia de Bautismo' },
    { key: 'numero_libro_bautismo', label: 'Libro de Bautismo' },
    { key: 'diocesis', label: 'Diócesis' },
    { key: 'anotaciones', label: 'Anotaciones Marginadas' },
    { key: 'parroquia', label: 'Parroquia' },
  ],
  matrimonio: [
    { key: 'libro', label: 'Libro' },
    { key: 'folio', label: 'Folio' },
    { key: 'numero', label: 'Número' },
    { key: 'fecha_matrimonio', label: 'Fecha de Matrimonio' },
    { key: 'nombre_esposo', label: 'Nombres Esposo' },
    { key: 'apellidos_esposo', label: 'Apellidos Esposo' },
    { key: 'nombre_esposa', label: 'Nombres Esposa' },
    { key: 'apellidos_esposa', label: 'Apellidos Esposa' },
    { key: 'padre_esposo', label: 'Padre Esposo' },
    { key: 'madre_esposo', label: 'Madre Esposo' },
    { key: 'padre_esposa', label: 'Padre Esposa' },
    { key: 'madre_esposa', label: 'Madre Esposa' },
    { key: 'testigo1', label: 'Testigo 1' },
    { key: 'testigo2', label: 'Testigo 2' },
    { key: 'parroquia_bautismo_esposo', label: 'Parroquia Bautismo Esposo' },
    { key: 'libro_bautismo_esposo', label: 'Libro Bautismo Esposo' },
    { key: 'folio_bautismo_esposo', label: 'Folio Bautismo Esposo' },
    { key: 'parroquia_bautismo_esposa', label: 'Parroquia Bautismo Esposa' },
    { key: 'libro_bautismo_esposa', label: 'Libro Bautismo Esposa' },
    { key: 'folio_bautismo_esposa', label: 'Folio Bautismo Esposa' },
    { key: 'da_fe', label: 'Da Fe' },
    { key: 'anotaciones', label: 'Anotaciones Marginadas' },
    { key: 'parroquia', label: 'Parroquia' },
  ],
  defuncion: [
    { key: 'libro', label: 'Libro' },
    { key: 'folio', label: 'Folio' },
    { key: 'numero', label: 'Número' },
    { key: 'nombre_difunto', label: 'Nombre Difunto' },
    { key: 'apellidos_difunto', label: 'Apellidos Difunto' },
    { key: 'fecha_sepultura', label: 'Fecha Sepultura' },
    { key: 'fecha_muerte', label: 'Fecha Defunción' },
    { key: 'edad', label: 'Edad' },
    { key: 'estado_civil', label: 'Estado Civil' },
    { key: 'causa_muerte', label: 'Causa de Muerte' },
    { key: 'lugar_origen', label: 'Lugar de Origen' },
    { key: 'padre_difunto', label: 'Padre Difunto' },
    { key: 'madre_difunto', label: 'Madre Difunto' },
    { key: 'parroquia_sepultura', label: 'Lugar Sepultura' },
    { key: 'da_fe', label: 'Da Fe' },
    { key: 'anotaciones', label: 'Anotaciones Marginadas' },
    { key: 'parroquia', label: 'Parroquia' },
  ],
};

function formatearValor(val: any, key: string, isDate?: boolean): string {
  if (val === null || val === undefined || val === '') return '';
  if (isDate || (typeof val === 'string' && (key.startsWith('fecha_') || key.endsWith('_en')))) {
    try {
      if (typeof val === 'string' && val.length >= 10) {
        const fechaClean = val.slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(fechaClean)) {
          const d = parseISO(val);
          return format(d, "d 'de' MMMM 'de' yyyy", { locale: es });
        }
      }
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return format(d, "d 'de' MMMM 'de' yyyy", { locale: es });
      }
    } catch {
      // fallback
    }
  }
  return String(val).trim();
}

export function prepararDatosParaExportacion(rawRows: any[], tipoSacramento: string): Record<string, string>[] {
  if (!rawRows || rawRows.length === 0) return [];

  const def = COLUMNAS_SACRAMENTOS[tipoSacramento];
  if (!def) {
    const keysExcluir = new Set(['id', 'creado_por', 'actualizado_por', 'actualizado_en', 'creado_en', 'estado', 'firma_base64']);
    return rawRows.map(row => {
      const obj: Record<string, string> = {};
      Object.keys(row).forEach(k => {
        if (!keysExcluir.has(k)) {
          obj[k.toUpperCase()] = formatearValor(row[k], k);
        }
      });
      return obj;
    });
  }

  return rawRows.map(row => {
    const obj: Record<string, string> = {};
    def.forEach(col => {
      obj[col.label] = formatearValor(row[col.key], col.key);
    });
    return obj;
  });
}

export async function exportarCSV(
  data: any[],
  filename: string,
  colsOrTipo?: ColConfig[] | string
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = PARROQUIA_CONFIG.nombre;
  wb.created = new Date();

  const ws = wb.addWorksheet('Datos');

  const fechaExport = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });

  if (!data || data.length === 0) {
    ws.addRow(['Sin datos para exportar.']);
    const buffer = await wb.xlsx.writeBuffer();
    descargarBuffer(buffer, `${filename}.xlsx`);
    return;
  }

  let columns: ColConfig[] = [];

  if (typeof colsOrTipo === 'string') {
    const sacDef = COLUMNAS_SACRAMENTOS[colsOrTipo];
    if (sacDef) {
      columns = sacDef.map(c => ({
        key: c.key,
        header: c.label,
        width: 18,
        isDate: c.key.startsWith('fecha_'),
      }));
    }
  } else if (Array.isArray(colsOrTipo)) {
    columns = colsOrTipo;
  }

  if (columns.length === 0) {
    columns = Object.keys(data[0]).map(k => ({
      key: k,
      header: k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      width: 18,
    }));
  }

  // Fila 1: título combinado
  const tituloRow = ws.addRow([`${filename} — Exportado el ${fechaExport}`]);
  ws.mergeCells(1, 1, 1, columns.length);
  tituloRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  tituloRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B1E2E' } };
  tituloRow.alignment = { horizontal: 'center', vertical: 'middle' };
  tituloRow.height = 28;

  // Fila 2: vacía
  ws.addRow([]);

  // Fila 3: encabezados
  const headerRow = ws.addRow(columns.map(c => c.header));
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4A1428' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFD4AF37' } },
    };
  });
  headerRow.height = 22;

  // Filas de datos con filas alternas
  data.forEach((item, idx) => {
    const values = columns.map(col => {
      const v = item[col.key];
      if (col.isDate && v) {
        try { return format(new Date(v), "d 'de' MMMM 'de' yyyy", { locale: es }); }
        catch { return v; }
      }
      return v ?? '';
    });
    const row = ws.addRow(values);
    const bgColor = idx % 2 === 0 ? 'FFFFFFFF' : 'FFFAF7F1';
    row.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      cell.alignment = { vertical: 'middle' };
    });
    row.height = 18;
  });

  // Fila vacía + total
  ws.addRow([]);
  const totalRow = ws.addRow([`Total de registros: ${data.length}`]);
  totalRow.font = { bold: true, italic: true, color: { argb: 'FF6B1E2E' } };

  // Anchos de columna
  ws.columns = columns.map(c => ({ width: c.width || 18 }));

  // Congelar primera fila de encabezados (fila 3)
  ws.views = [{ state: 'frozen', ySplit: 3 }];

  const buffer = await wb.xlsx.writeBuffer();
  descargarBuffer(buffer, `${filename}.xlsx`);
}

function descargarBuffer(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
