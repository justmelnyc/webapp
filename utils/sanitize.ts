import sanitizeHtml from 'sanitize-html'

const ALLOWED = {
  allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'a', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3'],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow', target: '_blank' }) },
} satisfies sanitizeHtml.IOptions

/** Post and comment text is user-authored HTML: strip everything but simple formatting. */
export const cleanHtml = (html: string): string => sanitizeHtml(html, ALLOWED)

/** Plain text of an HTML snippet (for previews and empty checks). */
export const htmlToText = (html: string): string =>
  sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim()
