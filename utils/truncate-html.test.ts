import { truncateHtml } from '@/utils/truncate-html'

describe('truncateHtml', () => {
  it('returns short text unchanged', () => {
    expect(truncateHtml('<p>Hello there</p>', 160)).toEqual({ html: '<p>Hello there</p>', text: 'Hello there' })
  })

  it('cuts at the last space and adds an ellipsis', () => {
    const { html, text } = truncateHtml('<p>one two three four five</p>', 14)
    expect(text).toBe('one two three …')
    expect(html).toBe('<p>one two three …</p>')
  })

  it('keeps markup and drops what follows the limit', () => {
    const { html } = truncateHtml('<p>aaa bbb ccc <a href="/x">ddd eee</a></p><p>later</p>', 9)
    expect(html).toContain('aaa bbb …')
    expect(html).not.toContain('later')
    expect(html).not.toContain('ddd')
  })

  it('reports the plain text length used for the See More threshold', () => {
    const long = `<p>${'word '.repeat(60)}</p>`
    expect(truncateHtml(long, 160).text.length).toBeGreaterThanOrEqual(150)
  })
})
