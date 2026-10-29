/**
 * Toma una imagen en Base64 (o URL) y remueve el fondo claro (papel),
 * dejando únicamente los trazos de la firma con fondo transparente (PNG).
 */
export function procesarFirmaTransparente(base64: string, threshold = 180): Promise<string> {
    return new Promise((resolve) => {
        if (!base64 || !base64.startsWith('data:image')) {
            resolve(base64);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(base64);
                return;
            }

            ctx.drawImage(img, 0, 0);
            try {
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imgData.data;

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Luminosidad del píxel
                    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

                    // Si el píxel es claro (fondo blanco/gris), lo hacemos transparente
                    if (brightness > threshold) {
                        data[i + 3] = 0; // Alpha = 0 (transparente)
                    } else {
                        // Hacemos el trazo más oscuro y nítido (lapicero oscuro)
                        const factor = brightness / threshold;
                        data[i] = Math.floor(r * factor * 0.7);
                        data[i + 1] = Math.floor(g * factor * 0.7);
                        data[i + 2] = Math.floor(b * factor * 0.8); // Toque azulado sutil
                    }
                }
                ctx.putImageData(imgData, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } catch (e) {
                // Si hay error de CORS u otro, retornamos la original
                resolve(base64);
            }
        };
        img.onerror = () => resolve(base64);
        img.src = base64;
    });
}
