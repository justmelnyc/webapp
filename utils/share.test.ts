import { htmlToText, postShareContent, shareUrl, userShareContent, SHARE_TYPES } from './share'

const post = {
  token: 'abc',
  author: { username: 'ada' },
  summary: [
    { kind: 'text' as const, data: '<p>Light &amp; shadow</p>' },
    { kind: 'image' as const, data: { url: '//cdn.example/a.jpg' } },
  ],
}

describe('share', () => {
  it('strips tags and decodes entities', () => {
    expect(htmlToText('<p>a &amp; b &lt;c&gt;</p>')).toBe('a & b <c>')
  })

  it('builds a post link, summary and image', () => {
    const c = postShareContent('https://ello.co', post)
    expect(c.link).toBe('https://ello.co/ada/post/abc')
    expect(decodeURIComponent(c.summarySafe)).toBe('Light & shadow')
    expect(c.image).toBe('http://cdn.example/a.jpg')
    expect(decodeURIComponent(c.emailSubjectSafe)).toBe('Check out this post on Ello, via @ada')
  })

  it('falls back to the default summary when the post has no text', () => {
    const c = postShareContent('https://ello.co', { ...post, summary: [] })
    expect(decodeURIComponent(c.summarySafe)).toBe('Check out this post on Ello')
    expect(c.image).toBeNull()
  })

  it('cuts the tweet at a word boundary so text plus link fits 139 characters', () => {
    const long = `<p>${'word '.repeat(60)}</p>`
    const c = postShareContent('https://ello.co', { ...post, summary: [{ kind: 'text', data: long }] })
    const tweet = decodeURIComponent(c.tweetSummarySafe)
    expect(tweet.length + c.link.length).toBeLessThanOrEqual(139)
    expect(tweet.endsWith('word')).toBe(true)
  })

  it('builds a url for every channel', () => {
    const c = postShareContent('https://ello.co', post)
    SHARE_TYPES.forEach((type) => expect(shareUrl(type, c)).toContain(type === 'email' ? 'mailto:' : 'http'))
    expect(shareUrl('twitter', c)).toBe(`https://twitter.com/intent/tweet?url=${c.linkSafe}&text=${c.tweetSummarySafe}`)
    expect(shareUrl('email', c).startsWith('mailto:?subject=')).toBe(true)
    expect(shareUrl('pinterest', c)).toContain('media=http://cdn.example/a.jpg')
  })

  it('shares a profile', () => {
    const c = userShareContent('https://ello.co', 'ada')
    expect(c.link).toBe('https://ello.co/ada')
    expect(shareUrl('facebook', c)).toBe(`https://www.facebook.com/sharer/sharer.php?u=${c.linkSafe}`)
  })
})
