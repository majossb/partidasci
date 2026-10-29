import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportarElementoAPDF(elementId: string, nombreArchivo: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) throw new Error(`Elemento con ID ${elementId} no encontrado`);

    // ── 1. Clonar el elemento y montarlo fuera de pantalla para captura limpia
    const clone = element.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id'); // Evitar IDs duplicados

    const offscreen = document.createElement('div');
    offscreen.style.position = 'absolute';
    offscreen.style.left = '-9999px';
    offscreen.style.top = '0';
    offscreen.style.width = '800px';
    offscreen.style.overflow = 'visible';
    offscreen.style.background = '#FFFFFF';
    offscreen.style.zIndex = '-1';

    // Asegurar que el clon tenga dimensiones correctas sin escala
    clone.style.width = '800px';
    clone.style.transform = 'none';
    clone.style.webkitTransform = 'none';
    clone.style.opacity = '1';
    clone.style.position = 'relative';
    clone.style.margin = '0';

    // ── 2. Restringir imágenes para que no se desborden, pero preservar la firma
    const images = Array.from(clone.querySelectorAll('img'));
    images.forEach(img => {
        // Detectar si es la imagen de la firma (tiene transform con translate/scale en inline style)
        const inlineTransform = img.style.transform || '';
        const isFirma = inlineTransform.includes('translate') || inlineTransform.includes('scale')
            || img.alt?.toLowerCase().includes('firma');

        if (isFirma) {
            // Preservar todos los estilos inline de la firma (height, transform, position, etc.)
            // No tocar nada — el clon ya tiene los estilos correctos del DOM original
            return;
        }

        // Para imágenes normales (logo, etc.), restringir tamaño
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.objectFit = 'contain';
    });

    offscreen.appendChild(clone);
    document.body.appendChild(offscreen);

    try {
        // ── 3. Esperar a que las imágenes del clon carguen
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => setTimeout(resolve, 200));

        const clonedImages = Array.from(clone.querySelectorAll('img'));
        await Promise.all(
            clonedImages.map(img => {
                if (img.complete && img.naturalWidth > 0) return Promise.resolve();
                return new Promise<void>((resolve) => {
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                });
            })
        );

        // ── 4. Renderizar a canvas con html2canvas
        const canvas = await html2canvas(clone, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#FFFFFF',
            width: 800,
            windowWidth: 800,
        });

        const imgData = canvas.toDataURL('image/png');

        // ── 5. Generar el PDF en formato Oficio / Legal (215.9 x 355.6 mm)
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'legal'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        const pageHeight = pdf.internal.pageSize.getHeight();

        if (pdfHeight <= pageHeight) {
            const offsetY = (pageHeight - pdfHeight) / 3;
            pdf.addImage(imgData, 'PNG', 0, offsetY, pdfWidth, pdfHeight);
        } else {
            const scale = pageHeight / pdfHeight;
            const scaledWidth = pdfWidth * scale;
            const offsetX = (pdfWidth - scaledWidth) / 2;
            pdf.addImage(imgData, 'PNG', offsetX, 0, scaledWidth, pageHeight);
        }

        pdf.save(`${nombreArchivo}.pdf`);
    } finally {
        // ── 6. Limpiar el clon del DOM
        document.body.removeChild(offscreen);
    }
}
