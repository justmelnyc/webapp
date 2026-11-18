import { isValidBuyUrl, normalizeBuyLink, withProtocol } from './buy-link'

describe('buy links', () => {
  it('accepts URLs with or without a protocol', () => {
    expect(isValidBuyUrl('https://shop.example.com/print-1')).toBe(true)
    expect(isValidBuyUrl('shop.example.com/print')).toBe(true)
  })

  it('rejects text that is not a URL', () => {
    expect(isValidBuyUrl('')).toBe(false)
    expect(isValidBuyUrl('not a url')).toBe(false)
    expect(isValidBuyUrl('localhost')).toBe(false)
    expect(isValidBuyUrl('ftp://example.com')).toBe(false)
  })

  it('prefixes http:// only when missing', () => {
    expect(withProtocol('example.com')).toBe('http://example.com')
    expect(withProtocol('https://example.com')).toBe('https://example.com')
  })

  it('normalizes or drops', () => {
    expect(normalizeBuyLink(' example.com/x ')).toBe('http://example.com/x')
    expect(normalizeBuyLink('nope')).toBeNull()
    expect(normalizeBuyLink(undefined)).toBeNull()
  })
})
