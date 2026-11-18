import { avatar, responsive, version } from '@/test/fixtures/media'
import { avatarUrl, responsiveUrl, responsiveVersion } from './images'

describe('responsiveUrl', () => {
  it('returns null for null/undefined', () => {
    expect(responsiveUrl(null)).toBeNull()
    expect(responsiveUrl(undefined)).toBeNull()
  })

  it('prefers optimized', () => {
    const image = { ...responsive('https://x/a.jpg', 1, 1), optimized: version('https://x/opt.jpg', 1, 1) }
    expect(responsiveUrl(image)).toBe('https://x/opt.jpg')
  })

  it('falls back down the density order, skipping null urls', () => {
    expect(responsiveUrl({ optimized: { url: null }, xhdpi: null, hdpi: version('https://x/h.jpg', 1, 1) })).toBe(
      'https://x/h.jpg',
    )
    expect(responsiveUrl({ original: version('https://x/o.jpg', 1, 1) })).toBe('https://x/o.jpg')
  })

  it('returns null when nothing has a url', () => {
    expect(responsiveUrl({})).toBeNull()
    expect(responsiveUrl({ optimized: { url: null } })).toBeNull()
  })
})

describe('responsiveVersion', () => {
  it('returns the version with metadata', () => {
    expect(responsiveVersion(responsive('https://x/a.jpg', 300, 200))?.metadata?.width).toBe(300)
  })

  it('returns null for missing or empty images', () => {
    expect(responsiveVersion(null)).toBeNull()
    expect(responsiveVersion({ xhdpi: { url: null } })).toBeNull()
  })
})

describe('avatarUrl', () => {
  const a = avatar('ada')

  it('returns null for missing avatars', () => {
    expect(avatarUrl(null)).toBeNull()
    expect(avatarUrl(undefined, 'large')).toBeNull()
  })

  it('defaults to regular and honors size', () => {
    expect(avatarUrl(a)).toBe(a.regular?.url)
    expect(avatarUrl(a, 'small')).toBe(a.small?.url)
    expect(avatarUrl(a, 'large')).toBe(a.large?.url)
  })

  it('falls back to regular, then original, when the size is missing', () => {
    expect(avatarUrl({ regular: version('https://x/r.png', 1, 1) }, 'large')).toBe('https://x/r.png')
    expect(avatarUrl({ original: version('https://x/o.png', 1, 1) }, 'small')).toBe('https://x/o.png')
    expect(avatarUrl({ small: null }, 'small')).toBeNull()
  })
})
