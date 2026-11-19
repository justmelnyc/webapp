const MIRRORED = [
  'boxSizing',
  'width',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'letterSpacing',
  'lineHeight',
  'textTransform',
  'wordSpacing',
  'textIndent',
  'tabSize',
] as const

/**
 * Where the characters `start..end` of a textarea sit in the viewport: what `Range.getBoundingClientRect()`
 * gives the original's contenteditable. Lays the text out in a hidden copy of the textarea and measures a span.
 */
export interface TextRangeRect {
  top: number
  left: number
  width: number
  height: number
}

export const textRangeRect = (
  field: HTMLTextAreaElement,
  start: number,
  end: number,
): TextRangeRect => {
  const box = field.getBoundingClientRect()
  const style = window.getComputedStyle(field)
  const mirror = document.createElement('div')
  mirror.setAttribute('aria-hidden', 'true')
  MIRRORED.forEach((property) => {
    mirror.style[property] = style[property]
  })
  Object.assign(mirror.style, {
    position: 'fixed',
    top: `${box.top}px`,
    left: `${box.left}px`,
    visibility: 'hidden',
    pointerEvents: 'none',
    overflow: 'hidden',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  })
  const span = document.createElement('span')
  span.textContent = field.value.slice(start, end) || '​'
  mirror.append(document.createTextNode(field.value.slice(0, start)), span)
  document.body.append(mirror)
  const rect = span.getBoundingClientRect()
  mirror.remove()
  return {
    left: rect.left,
    top: rect.top - field.scrollTop,
    width: rect.width,
    height: rect.height,
  }
}
