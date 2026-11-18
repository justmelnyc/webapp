import sanitizeHtml from 'sanitize-html'

const ALLOWED = {
  allowedTags: ['span', 'p', 'br', 'strong', 'b', 'em', 'i', 'a', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3'],
  // `span.hashtag-link[data-href]` is the API's hashtag "link" (the original has no <a> for it)
  allowedAttributes: { a: ['href', 'target', 'rel'], span: ['class', 'data-href'] },
  allowedClasses: { span: ['hashtag-link'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow', target: '_blank' }) },
} satisfies sanitizeHtml.IOptions

/** Post and comment text is user-authored HTML: strip everything but simple formatting. */
export const cleanHtml = (html: string): string => sanitizeHtml(html, ALLOWED)

/** Plain text of an HTML snippet (for previews and empty checks). */
export const htmlToText = (html: string): string =>
  sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim()
