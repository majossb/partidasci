export function fechaEnLetras(fechaDate: Date): string {
    const dia = fechaDate.getDate();
    const mes = fechaDate.getMonth();
    const anio = fechaDate.getFullYear();

    const meses = [
        "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
        "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    ];

    const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
    const especiales = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
    const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
    const centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

    function numeroALetras(n: number): string {
        if (n === 0) return "CERO";
        if (n === 100) return "CIEN";
        if (n < 10) return unidades[n] === "UN" && n !== 1 ? unidades[n] : (n === 1 ? "UNO" : unidades[n]);
        if (n < 20) return especiales[n - 10];
        if (n < 30) return n === 20 ? "VEINTE" : "VEINTI" + (n - 20 === 1 ? "UNO" : unidades[n - 20]);
        if (n < 100) {
            const dec = Math.floor(n / 10);
            const uni = n % 10;
            return decenas[dec] + (uni > 0 ? " Y " + (uni === 1 ? "UNO" : unidades[uni]) : "");
        }
        if (n < 1000) {
            const cen = Math.floor(n / 100);
            const resto = n % 100;
            return centenas[cen] + (resto > 0 ? " " + numeroALetras(resto) : "");
        }
        if (n < 2000) {
            const resto = n % 1000;
            return "MIL" + (resto > 0 ? " " + numeroALetras(resto) : "");
        }
        if (n < 10000) {
            const mil = Math.floor(n / 1000);
            const resto = n % 1000;
            return unidades[mil] + " MIL" + (resto > 0 ? " " + numeroALetras(resto) : "");
        }
        return n.toString();
    }

    const diaStr = dia === 1 ? "AL PRIMERO" : `A LOS ${numeroALetras(dia)}`;
    const mesStr = meses[mes];
    const anioStr = numeroALetras(anio);

    return `${diaStr} DIAS DEL MES DE ${mesStr} DE ${anioStr} (${anio})`;
}

export function parseExcelDate(dateValue: any): Date | null {
    if (!dateValue) return null;
    
    // Si ya es un objeto Date
    if (dateValue instanceof Date) {
        return isNaN(dateValue.getTime()) ? null : dateValue;
    }

    // Si es un string como "DD/MM/YYYY" o "YYYY-MM-DD"
    if (typeof dateValue === 'string') {
        const parts = dateValue.split('/');
        if (parts.length === 3) {
            const d = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            // Manejar años de 2 dígitos
            let y = parseInt(parts[2], 10);
            if (y < 100) {
                y += y < 50 ? 2000 : 1900;
            }
            const parsed = new Date(y, m, d);
            if (!isNaN(parsed.getTime())) return parsed;
        }
        
        // Intenta ISO
        const parsed = new Date(dateValue);
        if (!isNaN(parsed.getTime())) return parsed;
    }

    // Si es un número serial de Excel
    if (typeof dateValue === 'number') {
        const utc_days  = Math.floor(dateValue - 25569);
        const utc_value = utc_days * 86400;                                        
        const date_info = new Date(utc_value * 1000);
        
        const fractional_day = dateValue - Math.floor(dateValue) + 0.0000001;
        let total_seconds = Math.floor(86400 * fractional_day);
        
        const seconds = total_seconds % 60;
        total_seconds -= seconds;
        
        const hours = Math.floor(total_seconds / (60 * 60));
        const minutes = Math.floor(total_seconds / 60) % 60;
        
        const parsed = new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
        if (!isNaN(parsed.getTime())) return parsed;
    }

    return null;
}
