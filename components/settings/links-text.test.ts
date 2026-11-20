import { linksToText, textToLinks } from '@/components/settings/links-text'

const known = [
  { url: 'https://adalindqvist.example.com', text: 'adalindqvist.example.com' },
  { url: 'https://github.example.com/adal', text: 'github.example.com/adal' },
]

describe('linksToText', () => {
  it('joins the link texts with ", " like the original', () => {
    expect(linksToText(known)).toBe('adalindqvist.example.com, github.example.com/adal')
  })

  it('falls back to the url when a link has no text', () => {
    expect(linksToText([{ url: 'https://x.example.com', text: '' }])).toBe('https://x.example.com')
  })
})

describe('textToLinks', () => {
  it('round-trips the shown text back to the known links', () => {
    expect(textToLinks(linksToText(known), known)).toEqual(known)
  })

  it('gives a new bare domain a scheme and keeps full urls', () => {
    expect(textToLinks('new.example.com https://b.example.com', known)).toEqual([
      { url: 'http://new.example.com', text: 'new.example.com' },
      { url: 'https://b.example.com', text: 'https://b.example.com' },
    ])
  })
})
