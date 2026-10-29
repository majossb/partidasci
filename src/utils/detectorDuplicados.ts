export function normalizarTexto(texto: string | null | undefined): string {
    if (!texto) return '';
    return texto
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, ' ');
}

export function sonSimilares(nombre1: string | null | undefined, nombre2: string | null | undefined): boolean {
    if (!nombre1 || !nombre2) return false;
    
    const n1 = normalizarTexto(nombre1);
    const n2 = normalizarTexto(nombre2);
    
    if (n1 === n2) return true;
    
    if (n1.length > 5 && n2.length > 5) {
        if (n1.includes(n2) || n2.includes(n1)) return true;
    }
    
    return false;
}

export function fechasCercanas(fecha1: string | Date | null | undefined, fecha2: string | Date | null | undefined, maxDiasDiferencia: number): boolean {
    if (!fecha1 || !fecha2) return false;
    
    const d1 = typeof fecha1 === 'string' ? new Date(fecha1).getTime() : fecha1.getTime();
    const d2 = typeof fecha2 === 'string' ? new Date(fecha2).getTime() : fecha2.getTime();
    
    if (isNaN(d1) || isNaN(d2)) return false;
    
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    return diffDays <= maxDiasDiferencia;
}
