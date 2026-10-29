import DOMPurify from 'dompurify';

// Sanitiza texto libre antes de renderizar o guardar.
// Elimina cualquier HTML/JS malicioso pero preserva el texto plano.
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return '';
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
