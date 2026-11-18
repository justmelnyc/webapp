import { isEditorEmpty } from '@/utils/editor-html'
import { cleanHtml } from '@/utils/sanitize'

/**
 * The contenteditable's innerHTML -> the HTML stored with a post. Blank lines (the editor inserts
 * "\n\n" on Enter, Firefox a double `<br>`) split paragraphs; bold, italic and links survive the sanitizer.
 */
export const editorHtmlToPostHtml = (html: string): string =>
  cleanHtml(html.replace(/&nbsp;/g, ' ').replace(/\r\n?/g, '\n').replace(/<\/?div>/gi, '\n\n'))
    .replace(/<\/?p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && !isEditorEmpty(part))
    .map((part) => `<p>${part.replace(/\n/g, '<br>')}</p>`)
    .join('')
