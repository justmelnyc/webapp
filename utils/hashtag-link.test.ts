import { hashtagPath } from './hashtag-link'

const span = (attrs: string): Element => {
  document.body.innerHTML = `<p><span ${attrs}><b>#film</b></span></p>`
  return document.querySelector('b') as Element
}

describe('hashtagPath', () => {
  it('reads the data-href of the enclosing hashtag span', () => {
    expect(hashtagPath(span('class="hashtag-link" data-href="/search?terms=%23film"'))).toBe('/search?terms=%23film')
  })

  it('ignores other elements, missing hrefs and off-site hrefs', () => {
    expect(hashtagPath(span('class="other" data-href="/search"'))).toBeNull()
    expect(hashtagPath(span('class="hashtag-link"'))).toBeNull()
    expect(hashtagPath(span('class="hashtag-link" data-href="//evil.example"'))).toBeNull()
    expect(hashtagPath(span('class="hashtag-link" data-href="https://evil.example"'))).toBeNull()
    expect(hashtagPath(null)).toBeNull()
  })
})
