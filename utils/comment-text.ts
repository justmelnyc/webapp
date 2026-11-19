const ENTITIES: Record<string, string> = { '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&amp;': '&' }

/**
 * The inverse of `commentToHtml`: paragraphs become blank-line separated text, `<br>` a newline,
 * any other tag is dropped and the entities `commentToHtml` escapes are restored.
 */
export const commentHtmlToText = (html: string): string =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&(?:lt|gt|quot|#39|amp);/g, (entity) => ENTITIES[entity] ?? entity)
    .trim()
