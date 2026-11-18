/** The original's `prefixLink`: bare hosts get http://. */
export const prefixLink = (text: string): string =>
  /((ftp|http|https):\/\/.)|mailto(?=:[-.\w]+@)/.test(text) ? text : `http://${text}`

/** True when the editor's HTML holds no visible text (the browser leaves `<br>` behind when it is cleared). */
export const isEditorEmpty = (html: string): boolean =>
  html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length === 0
