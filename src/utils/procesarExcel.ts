import ExcelJS from 'exceljs';
import { parseExcelDate } from './fechas';
import { bautismoSchema } from '@/features/bautismos/bautismos.schema';
import { confirmacionSchema } from '@/features/confirmaciones/confirmaciones.schema';
import { matrimonioSchema } from '@/features/matrimonios/matrimonios.schema';
import { defuncionSchema } from '@/features/defunciones/defunciones.schema';
import { PARROQUIA_CONFIG } from './constantes';

function formatDateToString(d: Date | null): string | null {
    if (!d || isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export interface FilaError {
    fila: number;
    mensaje: string;
}

export interface FilaAdvertencia {
    fila: number;
    mensaje: string;
    posibleDuplicadoCon?: any;
}

export interface ResultadoProcesamiento {
    datosValidos: any[];
    errores: FilaError[];
    advertencias: FilaAdvertencia[];
    totalAnalizadas: number;
}

export async function leerExcelMasivo(file: File, tipoSacramento: string): Promise<ResultadoProcesamiento> {
    try {
        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
            throw new Error('El archivo Excel está vacío o no contiene hojas de trabajo.');
        }

        const jsonData: any[] = [];
        let headers: string[] = [];

        worksheet.eachRow((row, rowNumber) => {
            const rawValues = row.values as any[];
            if (rowNumber === 1) {
                headers = rawValues.map(v => (v !== null && v !== undefined ? String(v).trim().toUpperCase() : ''));
            } else {
                const rowObj: any = {};
                let tieneDatos = false;

                headers.forEach((header, colIdx) => {
                    if (header) {
                        let val = rawValues[colIdx];
                        if (val && typeof val === 'object') {
                            if ('result' in val) val = val.result;
                            else if ('richText' in val) val = val.richText.map((r: any) => r.text).join('');
                            else if ('text' in val) val = val.text;
                        }
                        if (val !== null && val !== undefined && String(val).trim() !== '') {
                            tieneDatos = true;
                        }
                        rowObj[header] = val ?? null;
                    }
                });

                if (tieneDatos) {
                    jsonData.push(rowObj);
                }
            }
        });

        return validarEstructura(jsonData, tipoSacramento);
    } catch (err: any) {
        throw new Error(err.message || 'El archivo no es un Excel válido o está corrupto.');
    }
}

function validarEstructura(filas: any[], tipoSacramento: string): ResultadoProcesamiento {
    const errores: FilaError[] = [];
    const advertencias: FilaAdvertencia[] = [];
    const datosValidos: any[] = [];
    
    // Set para detectar duplicados dentro del mismo archivo
    const foliosUnicos = new Set<string>();

    filas.forEach((fila, index) => {
        // Ignorar filas totalmente vacías
        const valores = Object.values(fila).filter(v => v !== null && v !== '');
        if (valores.length === 0) return;

        const numFila = index + 2; // +1 por ser 0-indexed, +1 por el encabezado en Excel

        // Validación genérica obligatoria
        if (!fila.LIBRO || !fila.FOLIO || !fila.NUMERO) {
            errores.push({ fila: numFila, mensaje: 'Faltan campos obligatorios: LIBRO, FOLIO o NUMERO.' });
            return;
        }

        const libroStr = String(fila.LIBRO).trim();
        const folioNum = parseInt(String(fila.FOLIO), 10);
        const numeroNum = parseInt(String(fila.NUMERO), 10);

        if (isNaN(folioNum) || folioNum <= 0) {
            errores.push({ fila: numFila, mensaje: 'El FOLIO debe ser un número entero mayor a 0.' });
            return;
        }

        if (isNaN(numeroNum) || numeroNum <= 0) {
            errores.push({ fila: numFila, mensaje: 'El NUMERO debe ser un número entero mayor a 0.' });
            return;
        }

        const claveFolio = `${libroStr}-${folioNum}-${numeroNum}`;
        if (foliosUnicos.has(claveFolio)) {
            errores.push({ fila: numFila, mensaje: `El registro Libro ${libroStr}, Folio ${folioNum}, Número ${numeroNum} está duplicado en este mismo archivo.` });
            return;
        }
        foliosUnicos.add(claveFolio);

        try {
            let registroValido: any = null;
            let esquemaValidacion: any = null;

            if (tipoSacramento === 'bautismo') {
                esquemaValidacion = bautismoSchema;
                const nombres = fila.NOMBRES || fila['NOMBRE BAUTIZADO'] || fila['NOMBRES BAUTIZADO'];
                const apellidos = fila.APELLIDOS || fila['APELLIDOS BAUTIZADO'];
                if (!nombres || !apellidos) throw new Error('Falta NOMBRES o APELLIDOS del bautizado.');
                
                const fechaBautismoDate = parseExcelDate(fila['FECHA BAUTISMO'] || fila['FECHA']);
                if (!fechaBautismoDate) throw new Error('FECHA BAUTISMO inválida o vacía.');
                
                registroValido = {
                    libro: libroStr,
                    folio: folioNum,
                    numero: numeroNum,
                    parroquia: fila.PARROQUIA || PARROQUIA_CONFIG.nombre,
                    nombre_bautizado: String(nombres).trim(),
                    apellidos_bautizado: String(apellidos).trim(),
                    fecha_bautismo: formatDateToString(fechaBautismoDate),
                    ministro: fila.MINISTRO || fila.CELEBRANTE || null,
                    fecha_nacimiento: formatDateToString(parseExcelDate(fila['FECHA NACIMIENTO'])),
                    lugar_nacimiento: fila['LUGAR NACIMIENTO'] || null,
                    nombre_padre: fila['NOMBRE PADRE'] || fila['PADRE'] || null,
                    nombre_madre: fila['NOMBRE MADRE'] || fila['MADRE'] || null,
                    abuelos_paternos: fila['ABUELOS PATERNOS'] || null,
                    abuelos_maternos: fila['ABUELOS MATERNOS'] || null,
                    padrino: fila['PADRINO'] || null,
                    madrina: fila['MADRINA'] || null,
                    da_fe: fila['DA FE'] || null,
                    anotaciones: fila['NOTAS'] || fila['ANOTACIONES'] || '',
                    estado: 'activo'
                };
            } 
            else if (tipoSacramento === 'confirmacion') {
                esquemaValidacion = confirmacionSchema;
                const nombres = fila['NOMBRES'] || fila['NOMBRE CONFIRMADO'] || fila['NOMBRES CONFIRMADO'];
                const apellidos = fila['APELLIDOS'] || fila['APELLIDOS CONFIRMADO'];
                if (!nombres || !apellidos) throw new Error('Faltan NOMBRES o APELLIDOS del confirmado.');

                const fechaConfDate = parseExcelDate(fila['FECHA CONFIRMACION'] || fila['FECHA']);
                const anioRaw = fila['AÑO CONFIRMACION'] || fila['ANIO CONFIRMACION'] || fila['AÑO'] || fila['ANIO'];
                const anioConf = anioRaw ? parseInt(String(anioRaw), 10) : (fechaConfDate ? fechaConfDate.getFullYear() : null);

                registroValido = {
                    libro: libroStr,
                    folio: folioNum,
                    numero: numeroNum,
                    parroquia: fila.PARROQUIA || PARROQUIA_CONFIG.nombre,
                    nombre_confirmado: String(nombres).trim(),
                    apellidos_confirmado: String(apellidos).trim(),
                    fecha_confirmacion: formatDateToString(fechaConfDate),
                    anio_confirmacion: anioConf && !isNaN(anioConf) ? anioConf : null,
                    ministro: fila.MINISTRO || fila.CELEBRANTE || null,
                    obispo: fila.OBISPO || null,
                    padrino_madrina: fila['PADRINO'] || fila['MADRINA'] || fila['PADRINO_MADRINA'] || null,
                    nombre_padre: fila['NOMBRE PADRE'] || fila['PADRE'] || null,
                    nombre_madre: fila['NOMBRE MADRE'] || fila['MADRE'] || null,
                    lugar_confirmacion: fila['LUGAR CONFIRMACION'] || fila['LUGAR'] || null,
                    fecha_nacimiento: formatDateToString(parseExcelDate(fila['FECHA NACIMIENTO'])),
                    lugar_nacimiento: fila['LUGAR NACIMIENTO'] || null,
                    da_fe: fila['DA FE'] || null,
                    anotaciones: fila['NOTAS'] || fila['ANOTACIONES'] || '',
                    estado: 'activo'
                };
            }
            else if (tipoSacramento === 'matrimonio') {
                esquemaValidacion = matrimonioSchema;
                const nombresEsposo = fila['NOMBRES ESPOSO'] || fila['ESPOSO'];
                const apellidosEsposo = fila['APELLIDOS ESPOSO'] || '';
                const nombresEsposa = fila['NOMBRES ESPOSA'] || fila['ESPOSA'];
                const apellidosEsposa = fila['APELLIDOS ESPOSA'] || '';
                if (!nombresEsposo || !nombresEsposa) throw new Error('Faltan nombres de los esposos.');
                
                const fechaMatrimonioDate = parseExcelDate(fila['FECHA MATRIMONIO'] || fila['FECHA']);
                if (!fechaMatrimonioDate) throw new Error('FECHA MATRIMONIO inválida o vacía.');

                registroValido = {
                    libro: libroStr,
                    folio: folioNum,
                    numero: numeroNum,
                    parroquia: fila.PARROQUIA || PARROQUIA_CONFIG.nombre,
                    nombre_esposo: String(nombresEsposo).trim(),
                    apellidos_esposo: String(apellidosEsposo).trim(),
                    nombre_esposa: String(nombresEsposa).trim(),
                    apellidos_esposa: String(apellidosEsposa).trim(),
                    fecha_matrimonio: formatDateToString(fechaMatrimonioDate),
                    presencio: fila.PRESENCIO || fila.MINISTRO || fila.CELEBRANTE || null,
                    testigo1: fila['TESTIGO 1'] || fila['TESTIGO 1 NOMBRE'] || null,
                    testigo2: fila['TESTIGO 2'] || fila['TESTIGO 2 NOMBRE'] || null,
                    padre_esposo: fila['PADRE ESPOSO'] || null,
                    madre_esposo: fila['MADRE ESPOSO'] || null,
                    padre_esposa: fila['PADRE ESPOSA'] || null,
                    madre_esposa: fila['MADRE ESPOSA'] || null,
                    da_fe: fila['DA FE'] || null,
                    anotaciones: fila['NOTAS'] || fila['ANOTACIONES'] || '',
                    estado: 'activo'
                };
            }
            else if (tipoSacramento === 'defuncion') {
                esquemaValidacion = defuncionSchema;
                const nombres = fila['NOMBRES DIFUNTO'] || fila['NOMBRES'] || fila['DIFUNTO'];
                const apellidos = fila['APELLIDOS DIFUNTO'] || fila['APELLIDOS'] || '';
                if (!nombres) throw new Error('Falta el nombre del difunto.');

                const fechaDefDate = parseExcelDate(fila['FECHA DEFUNCION'] || fila['FECHA SEPULTURA'] || fila['FECHA']);

                registroValido = {
                    libro: libroStr,
                    folio: folioNum,
                    numero: numeroNum,
                    parroquia: fila.PARROQUIA || PARROQUIA_CONFIG.nombre,
                    nombre_difunto: String(nombres).trim(),
                    apellidos_difunto: String(apellidos).trim(),
                    fecha_defuncion: formatDateToString(fechaDefDate),
                    edad: fila.EDAD !== null && fila.EDAD !== undefined ? String(fila.EDAD).trim() : null,
                    causa_muerte: fila['CAUSA MUERTE'] || fila['CAUSA DE MUERTE'] || fila['CAUSA'] || null,
                    padre_difunto: fila['PADRE'] || fila['NOMBRE PADRE'] || null,
                    madre_difunto: fila['MADRE'] || fila['NOMBRE MADRE'] || null,
                    estado_civil: fila['ESTADO CIVIL'] || null,
                    lugar_origen: fila['LUGAR ORIGEN'] || fila['ORIGEN'] || null,
                    da_fe: fila['DA FE'] || null,
                    anotaciones: fila['NOTAS'] || fila['ANOTACIONES'] || '',
                    estado: 'activo'
                };
            }
            else {
                registroValido = {
                    libro: libroStr,
                    folio: folioNum,
                    numero: numeroNum,
                    estado: 'activo'
                };
            }

            // Validación con Zod si hay esquema asociado
            if (esquemaValidacion && registroValido) {
                const parseResult = esquemaValidacion.safeParse(registroValido);
                if (!parseResult.success) {
                    const primerError = parseResult.error.errors[0]?.message || 'Datos con formato o valores no válidos';
                    errores.push({ fila: numFila, mensaje: primerError });
                    return;
                }
            }

            datosValidos.push({ fila: numFila, data: registroValido });

        } catch (e: any) {
            errores.push({ fila: numFila, mensaje: e.message });
        }
    });

    return {
        datosValidos: datosValidos.map(d => d.data),
        errores,
        advertencias,
        totalAnalizadas: filas.length
    };
}
