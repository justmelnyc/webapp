import { editorHtmlToPostHtml } from './editor-post-html'

describe('editorHtmlToPostHtml', () => {
  it('splits on blank lines and keeps inline formatting', () => {
    expect(editorHtmlToPostHtml('one <b>two</b>\n\nthree<br>four')).toBe('<p>one <b>two</b></p><p>three<br>four</p>')
  })
  it('splits on double <br> (Firefox) and drops empty paragraphs', () => {
    expect(editorHtmlToPostHtml('a<br><br>b<br><br>')).toBe('<p>a</p><p>b</p>')
    expect(editorHtmlToPostHtml('<br>')).toBe('')
  })
  it('strips scripts and unsafe attributes', () => {
    const out = editorHtmlToPostHtml('<a href="javascript:alert(1)" onclick="x()">x</a><script>bad()</script>')
    expect(out).not.toMatch(/script|onclick|javascript/)
  })
  it('accepts editor text that already holds paragraphs', () => {
    expect(editorHtmlToPostHtml('<p>first <em>line</em></p><p>second</p>')).toBe('<p>first <em>line</em></p><p>second</p>')
  })
})
