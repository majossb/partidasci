import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ImageRun,
  BorderStyle,
  UnderlineType,
} from 'docx';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { PARROQUIA_CONFIG } from '@/utils/constantes';

export async function exportarPartidaWord(
  partida: any,
  tipo: 'bautismo' | 'confirmacion' | 'matrimonio' | 'defuncion',
  textoExpedicion?: string,
  incluirFirma: boolean = false,
  firmaUrl?: string | null
): Promise<Blob> {
  const getBase64Image = async (url: string): Promise<Uint8Array | null> => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      const arrayBuffer = await blob.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (e) {
      return null;
    }
  };

  const santaClaraImage = await getBase64Image(PARROQUIA_CONFIG.logoUrl);
  let firmaImage: Uint8Array | null = null;

  if (incluirFirma && firmaUrl) {
    try {
      if (firmaUrl.startsWith('data:image')) {
        const res = await fetch(firmaUrl);
        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();
        firmaImage = new Uint8Array(arrayBuffer);
      } else {
        firmaImage = await getBase64Image(firmaUrl);
      }
    } catch (e) {
      console.error('Error cargando firma para Word:', e);
      firmaImage = null;
    }
  }

  const expText =
    textoExpedicion ||
    `ES FIEL COPIA DEL ORIGINAL EXPEDIDA EN ${PARROQUIA_CONFIG.ciudad.toUpperCase()} A LOS ${format(new Date(), "d 'DIAS DEL MES DE' MMMM 'DE' yyyy", { locale: es }).toUpperCase()}.`;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 pulgada (2.54 cm)
          },
        },
        children: [
          ...generarEncabezado(tipo, santaClaraImage),
          ...generarCuerpo(tipo, partida),
          generarPieDePagina(expText),
          ...generarFirma(firmaImage),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}

// ── Encabezado Parroquial ────────────────────────────────────────────────
function generarEncabezado(tipo: string, santaClaraImage: Uint8Array | null) {
  const children: Paragraph[] = [];

  let direncionText = PARROQUIA_CONFIG.direccion;
  let telefonoText = `TELEFONO: ${PARROQUIA_CONFIG.telefono}`;

  if (tipo === 'defuncion') {
    direncionText = 'NIT. 900.000.000-1';
    telefonoText = '';
  }

  const cellChildren: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: PARROQUIA_CONFIG.diocesis.toUpperCase(), bold: true, italics: true, size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: PARROQUIA_CONFIG.nombre.toUpperCase(), bold: true, italics: true, size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: direncionText, italics: true, size: 18 })],
    }),
  ];

  if (telefonoText) {
    cellChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: telefonoText, italics: true, size: 18 })],
      })
    );
  }

  const tableRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 80, type: WidthType.PERCENTAGE },
          borders: borderNone(),
          children: cellChildren,
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          borders: borderNone(),
          children: santaClaraImage
            ? [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new ImageRun({
                      data: santaClaraImage,
                      transformation: { width: 75, height: 95 },
                    }),
                  ],
                }),
              ]
            : [new Paragraph({ text: '' })],
        }),
      ],
    }),
  ];

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: borderNone(),
    rows: tableRows,
  });

  children.push(headerTable as any);
  children.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  let titulo = 'PARTIDA DE BAUTISMO';
  if (tipo === 'confirmacion') titulo = 'ACTA DE CONFIRMACIÓN';
  if (tipo === 'matrimonio') titulo = 'PARTIDA DE MATRIMONIO';
  if (tipo === 'defuncion') titulo = 'ACTA DE DEFUNCIÓN';

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: titulo,
          bold: true,
          italics: true,
          size: 26,
          underline: tipo === 'defuncion' ? { type: UnderlineType.SINGLE } : undefined,
        }),
      ],
      spacing: { after: 300 },
    })
  );

  return children;
}

// ── Generar Cuerpo ──────────────────────────────────────────────────────
function generarCuerpo(tipo: string, data: any) {
  if (tipo === 'bautismo') return cuerpoBautismo(data);
  if (tipo === 'confirmacion') return cuerpoConfirmacion(data);
  if (tipo === 'matrimonio') return cuerpoMatrimonio(data);
  return cuerpoDefuncion(data);
}

function borderNone() {
  return {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  };
}

function borderBox() {
  return {
    top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  };
}

function createCampoLinea(label: string, val: string) {
  return new Paragraph({
    spacing: { before: 100, after: 100 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, italics: true, size: 20 }),
      new TextRun({ text: val ? val.toUpperCase() : 'NO REGISTRA', bold: true, size: 20 }),
    ],
  });
}

function formatFechaLarga(fechaStr: string | null | undefined): string {
  if (!fechaStr) return 'NO REGISTRA';
  try {
    return format(parseISO(fechaStr), "d 'de' MMMM 'de' yyyy", { locale: es }).toUpperCase();
  } catch {
    return String(fechaStr).toUpperCase();
  }
}

// ── 1. BAUTISMO ─────────────────────────────────────────────────────────
function cuerpoBautismo(data: any) {
  const elements: any[] = [];

  // Tabla Identificadores
  const tableIdent = new Table({
    width: { size: 60, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        children: [
          new TableCell({ borders: borderBox(), children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'LIBRO', size: 18 })] })] }),
          new TableCell({ borders: borderBox(), children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'FOLIO', size: 18 })] })] }),
          new TableCell({ borders: borderBox(), children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'PARTIDA', size: 18 })] })] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ borders: borderBox(), children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(data.libro || ''), bold: true, size: 20 })] })] }),
          new TableCell({ borders: borderBox(), children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(data.folio || ''), bold: true, size: 20 })] })] }),
          new TableCell({ borders: borderBox(), children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(data.numero || ''), bold: true, size: 20 })] })] }),
        ],
      }),
    ],
  });

  elements.push(tableIdent);
  elements.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // Cuadro Bautizado
  const nombreCompleto = `${data.nombre_bautizado || ''} ${data.apellidos_bautizado || ''}`.trim().toUpperCase();
  const tableBautizado = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            borders: borderNone(),
            children: [new Paragraph({ children: [new TextRun({ text: 'Bautizado (a):', bold: true, italics: true, size: 20 })] })],
          }),
          new TableCell({
            width: { size: 75, type: WidthType.PERCENTAGE },
            borders: borderBox(),
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: nombreCompleto, bold: true, size: 22 })] })],
          }),
        ],
      }),
    ],
  });

  elements.push(tableBautizado);
  elements.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // Campos
  elements.push(createCampoLinea('Fecha de Bautismo', formatFechaLarga(data.fecha_bautismo)));
  elements.push(createCampoLinea('Celebrante', data.ministro));
  elements.push(createCampoLinea('Fecha de Nacimiento', formatFechaLarga(data.fecha_nacimiento)));
  elements.push(createCampoLinea('Lugar Nacimiento', data.lugar_nacimiento));
  elements.push(createCampoLinea('Nombre de los Padres', [data.nombre_padre, data.nombre_madre].filter(Boolean).join(' y ')));
  elements.push(createCampoLinea('Abuelos Paternos', data.abuelos_paternos));
  elements.push(createCampoLinea('Abuelos Maternos', data.abuelos_maternos));
  elements.push(createCampoLinea('Padrinos', [data.padrino, data.madrina].filter(Boolean).join(' y ')));
  elements.push(createCampoLinea('Doy Fe', data.da_fe || 'El Párroco'));

  // Anotaciones
  elements.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  elements.push(new Paragraph({ children: [new TextRun({ text: 'Anotación (es):', bold: true, size: 20 })] }));
  elements.push(new Paragraph({ children: [new TextRun({ text: (data.anotaciones || '........................................................................................................................').toUpperCase(), size: 18 })] }));

  return elements;
}

// ── 2. CONFIRMACIÓN ─────────────────────────────────────────────────────
function cuerpoConfirmacion(data: any) {
  const elements: any[] = [];

  // Tabla Identificadores
  const tableIdent = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: borderBox(),
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'LIBRO No. ', bold: true, italics: true, size: 20 }),
                  new TextRun({ text: String(data.libro || ''), bold: true, size: 20 }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: borderBox(),
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'FOLIO No. ', bold: true, italics: true, size: 20 }),
                  new TextRun({ text: String(data.folio || ''), bold: true, size: 20 }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: borderBox(),
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'ACTA No. ', bold: true, italics: true, size: 20 }),
                  new TextRun({ text: String(data.numero || ''), bold: true, size: 20 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  elements.push(tableIdent);
  elements.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  const fechaConf = data.fecha_confirmacion
    ? formatFechaLarga(data.fecha_confirmacion)
    : data.anio_confirmacion
    ? `AÑO ${data.anio_confirmacion}`
    : 'NO REGISTRA';

  let edadStr = 'NO REGISTRA';
  if (data.fecha_nacimiento && data.fecha_confirmacion) {
    const diff = Math.floor((new Date(data.fecha_confirmacion).getTime() - new Date(data.fecha_nacimiento).getTime()) / 31557600000);
    edadStr = `${diff} AÑOS`;
  } else if (data.fecha_nacimiento && data.anio_confirmacion) {
    const diff = Number(data.anio_confirmacion) - new Date(data.fecha_nacimiento).getFullYear();
    edadStr = `${diff} AÑOS (APROX.)`;
  }

  let bautizadoEn = data.parroquia_bautismo || 'NO REGISTRA';
  if (data.numero_libro_bautismo || data.folio_bautismo || data.numero_bautismo) {
    bautizadoEn += ` (LIBRO: ${data.numero_libro_bautismo || 'N/R'}, FOLIO: ${data.folio_bautismo || 'N/R'}, NÚMERO: ${data.numero_bautismo || 'N/R'})`;
  }

  elements.push(createCampoLinea('FECHA DE CONFIRMACIÓN', fechaConf));
  elements.push(createCampoLinea('PARROQUIA', data.parroquia || PARROQUIA_CONFIG.nombre));
  elements.push(createCampoLinea('LUGAR DE CONFIRMACIÓN', data.lugar_confirmacion || data.parroquia || PARROQUIA_CONFIG.nombre));
  elements.push(createCampoLinea('CONFIRMADO', `${data.nombre_confirmado || ''} ${data.apellidos_confirmado || ''}`));
  elements.push(createCampoLinea('EDAD', edadStr));
  elements.push(createCampoLinea('BAUTIZADO EN', bautizadoEn));
  elements.push(createCampoLinea('NOMBRE DEL PADRE', data.nombre_padre));
  elements.push(createCampoLinea('NOMBRE DE LA MADRE', data.nombre_madre));
  elements.push(createCampoLinea('PADRINO/MADRINA', data.padrino_madrina));
  elements.push(createCampoLinea('MINISTRO', data.ministro));
  if (data.obispo) elements.push(createCampoLinea('OBISPO', data.obispo));
  elements.push(createCampoLinea('DOY FE', data.da_fe || 'El Párroco'));

  return elements;
}

// ── 3. MATRIMONIO ───────────────────────────────────────────────────────
function cuerpoMatrimonio(data: any) {
  const elements: any[] = [];

  const tableIdent = new Table({
    width: { size: 60, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        children: [
          new TableCell({ borders: borderBox(), children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'LIBRO', size: 18 })] })] }),
          new TableCell({ borders: borderBox(), children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'FOLIO', size: 18 })] })] }),
          new TableCell({ borders: borderBox(), children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'PARTIDA', size: 18 })] })] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ borders: borderBox(), children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(data.libro || ''), bold: true, size: 20 })] })] }),
          new TableCell({ borders: borderBox(), children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(data.folio || ''), bold: true, size: 20 })] })] }),
          new TableCell({ borders: borderBox(), children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(data.numero || ''), bold: true, size: 20 })] })] }),
        ],
      }),
    ],
  });

  elements.push(tableIdent);
  elements.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // Nombres Esposo y Esposa
  const nombresMatrimonio = `${data.nombre_esposo || ''} ${data.apellidos_esposo || ''} y ${data.nombre_esposa || ''} ${data.apellidos_esposa || ''}`.trim().toUpperCase();

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'Matrimonio de: ', bold: true, italics: true, size: 20 }),
        new TextRun({ text: nombresMatrimonio, bold: true, size: 22 }),
      ],
      spacing: { after: 200 },
    })
  );

  elements.push(createCampoLinea('En la Parroquia de', data.parroquia || PARROQUIA_CONFIG.nombre));
  elements.push(createCampoLinea('Fecha de Matrimonio', formatFechaLarga(data.fecha_matrimonio)));
  elements.push(createCampoLinea('Celebrante', data.presencio));

  elements.push(new Paragraph({ children: [new TextRun({ text: 'Datos del Esposo:', bold: true, italics: true, size: 20 })], spacing: { before: 150, after: 50 } }));
  elements.push(createCampoLinea('   Nombre de los Padres', [data.padre_esposo, data.madre_esposo].filter(Boolean).join(' y ')));
  elements.push(createCampoLinea('   Parroquia del bautismo', data.parroquia_bautismo_esposo));
  elements.push(createCampoLinea('   Fecha del Bautismo', formatFechaLarga(data.fecha_bautismo_esposo)));

  elements.push(new Paragraph({ children: [new TextRun({ text: 'Datos de la Esposa:', bold: true, italics: true, size: 20 })], spacing: { before: 150, after: 50 } }));
  elements.push(createCampoLinea('   Nombre de los Padres', [data.padre_esposa, data.madre_esposa].filter(Boolean).join(' y ')));
  elements.push(createCampoLinea('   Parroquia del bautismo', data.parroquia_bautismo_esposa));
  elements.push(createCampoLinea('   Fecha del Bautismo', formatFechaLarga(data.fecha_bautismo_esposa)));

  elements.push(createCampoLinea('Padrinos', [data.testigo1, data.testigo2].filter(Boolean).join(' y ')));
  elements.push(createCampoLinea('Doy Fe', data.da_fe || 'El Párroco'));

  // Anotaciones
  elements.push(new Paragraph({ text: '', spacing: { after: 150 } }));
  elements.push(new Paragraph({ children: [new TextRun({ text: 'Anotación (es):', bold: true, size: 20 })] }));
  elements.push(new Paragraph({ children: [new TextRun({ text: (data.anotaciones || '........................................................................................................................').toUpperCase(), size: 18 })] }));

  return elements;
}

// ── 4. DEFUNCIÓN ────────────────────────────────────────────────────────
function cuerpoDefuncion(data: any) {
  const elements: any[] = [];

  const tableIdent = new Table({
    width: { size: 60, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        children: [
          new TableCell({ borders: borderBox(), children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'LIBRO', size: 18 })] })] }),
          new TableCell({ borders: borderBox(), children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'FOLIO', size: 18 })] })] }),
          new TableCell({ borders: borderBox(), children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'NUMERO', size: 18 })] })] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ borders: borderBox(), children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(data.libro || ''), bold: true, size: 20 })] })] }),
          new TableCell({ borders: borderBox(), children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(data.folio || ''), bold: true, size: 20 })] })] }),
          new TableCell({ borders: borderBox(), children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(data.numero || ''), bold: true, size: 20 })] })] }),
        ],
      }),
    ],
  });

  elements.push(tableIdent);
  elements.push(new Paragraph({ text: '', spacing: { after: 150 } }));

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `EN LA ${PARROQUIA_CONFIG.nombre.toUpperCase()}`, bold: true, size: 20 })],
      spacing: { after: 200 },
    })
  );

  let diaMes = 'NO REGISTRA';
  let anio = 'NO REGISTRA';
  if (data.fecha_defuncion) {
    try {
      diaMes = format(parseISO(data.fecha_defuncion), "d 'DE' MMMM", { locale: es }).toUpperCase();
      anio = format(parseISO(data.fecha_defuncion), 'yyyy').toUpperCase();
    } catch {}
  }

  elements.push(createCampoLinea('A', diaMes));
  elements.push(createCampoLinea('DE', anio));
  elements.push(createCampoLinea('NATURAL DE', data.lugar_origen));

  const difunto = `${data.nombre_difunto || ''} ${data.apellidos_difunto || ''}`.trim().toUpperCase();
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'NOMBRES Y APELLIDOS DEL DIFUNTO: ', bold: true, italics: true, size: 20 }),
        new TextRun({ text: difunto, bold: true, size: 24 }),
      ],
      spacing: { before: 150, after: 150 },
    })
  );

  let edadText = data.edad || 'NO REGISTRA';
  if (data.edad && !String(data.edad).toLowerCase().includes('año')) {
    edadText += ' AÑOS DE EDAD';
  }

  elements.push(createCampoLinea('DE', edadText));
  elements.push(createCampoLinea('HIJO(A) DE', [data.padre_difunto, data.madre_difunto].filter(Boolean).join(' y ')));
  elements.push(createCampoLinea('ESTADO CIVIL', data.estado_civil));
  elements.push(createCampoLinea('CAUSA DE MUERTE', data.causa_muerte));
  elements.push(createCampoLinea('DOY FE', data.da_fe || 'EL PÁRROCO'));

  return elements;
}

// ── Pie de Página ──────────────────────────────────────────────────────
function generarPieDePagina(textoExpedicion: string) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 600, after: 400 },
    children: [new TextRun({ text: textoExpedicion.toUpperCase(), size: 18 })],
  });
}

// ── Firma ──────────────────────────────────────────────────────────────
function generarFirma(firmaImage: Uint8Array | null) {
  const children: Paragraph[] = [];

  if (firmaImage) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: firmaImage,
            transformation: { width: 140, height: 60 },
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );
  } else {
    children.push(new Paragraph({ text: '', spacing: { before: 600 } }));
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'PÁRROCO', bold: true, size: 20 })],
    })
  );

  return children;
}
