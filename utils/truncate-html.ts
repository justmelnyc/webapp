import sanitizeHtml from 'sanitize-html'

const ELLIPSIS = '…'

/** trunc-text: cut at the last space before `limit` and append an ellipsis; a single long word becomes just the ellipsis. */
const truncateText = (text: string, limit: number): string => {
  if (text.length <= limit) return text
  const cut = text.slice(0, limit)
  const space = cut.lastIndexOf(' ')
  return space === -1 ? ELLIPSIS : `${cut.slice(0, space)} ${ELLIPSIS}`
}

export interface TruncatedHtml {
  html: string
  text: string
}

/**
 * The `trunc-html` package the original used (selectUserTruncatedShortBio): keeps the markup but stops
 * after `limit` characters of text, dropping what is left. `html` must already be sanitised.
 */
export const truncateHtml = (html: string, limit: number): TruncatedHtml => {
  let remaining = limit
  let text = ''
  const out = sanitizeHtml(html, {
    allowedTags: false,
    allowedAttributes: false,
    textFilter: (chunk) => {
      if (remaining <= 0) return ''
      const cut = truncateText(chunk, remaining)
      remaining = cut.endsWith(ELLIPSIS) ? 0 : remaining - cut.length
      text += cut
      return cut
    },
    exclusiveFilter: (frame) => remaining <= 0 && !frame.text.trim(),
  })
  return { html: out, text }
}
