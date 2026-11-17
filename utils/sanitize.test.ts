import { cleanHtml, htmlToText } from './sanitize'

describe('cleanHtml', () => {
  it('keeps allowed formatting tags', () => {
    const html = '<p>Hi <strong>you</strong> <em>there</em><br></p><ul><li>one</li></ul><blockquote>q</blockquote><h2>t</h2>'
    const out = cleanHtml(html)
    for (const tag of ['<p>', '<strong>', '<em>', '<br />', '<ul>', '<li>', '<blockquote>', '<h2>']) {
      expect(out).toContain(tag)
    }
  })

  it('removes script tags and their contents', () => {
    const out = cleanHtml('<p>ok</p><script>alert(1)</script>')
    expect(out).toBe('<p>ok</p>')
  })

  it('strips event handler attributes', () => {
    const out = cleanHtml('<p onclick="x()">a</p><img src="x" onerror="alert(1)">')
    expect(out).not.toMatch(/onclick|onerror|<img/)
    expect(out).toContain('<p>a</p>')
  })

  it('strips iframes', () => {
    const out = cleanHtml('<iframe src="https://evil.example"></iframe><p>x</p>')
    expect(out).not.toContain('iframe')
    expect(out).toContain('<p>x</p>')
  })

  it('removes javascript: hrefs', () => {
    const out = cleanHtml('<a href="javascript:alert(1)">click</a>')
    expect(out).not.toContain('javascript:')
    expect(out).toContain('click')
  })

  it('adds rel and target to safe links', () => {
    const out = cleanHtml('<a href="https://example.com/x">link</a>')
    expect(out).toContain('href="https://example.com/x"')
    expect(out).toContain('rel="noopener noreferrer nofollow"')
    expect(out).toContain('target="_blank"')
  })

  it('overrides author-supplied rel and target', () => {
    const out = cleanHtml('<a href="https://example.com" target="_self" rel="opener">l</a>')
    expect(out).toContain('target="_blank"')
    expect(out).toContain('rel="noopener noreferrer nofollow"')
    expect(out).not.toContain('opener"')
  })

  it('allows mailto links', () => {
    expect(cleanHtml('<a href="mailto:a@b.co">m</a>')).toContain('href="mailto:a@b.co"')
  })

  it('drops disallowed attributes such as style and class', () => {
    expect(cleanHtml('<p style="color:red" class="x">a</p>')).toBe('<p>a</p>')
  })

  it('returns an empty string for empty input', () => {
    expect(cleanHtml('')).toBe('')
  })
})

describe('htmlToText', () => {
  it('strips tags', () => {
    expect(htmlToText('<p>Hello <strong>world</strong></p>')).toBe('Hello world')
  })

  it('collapses whitespace and trims', () => {
    expect(htmlToText('<p>  a  </p>\n<p>b</p>')).toBe('a b')
  })

  it('drops script content', () => {
    expect(htmlToText('<p>x</p><script>evil()</script>')).toBe('x')
  })

  it('returns empty for tag-only html', () => {
    expect(htmlToText('<p><br></p>')).toBe('')
  })
})
