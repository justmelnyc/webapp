import { authOrigin, legacyRedirects } from './legacy-redirects'

describe('legacyRedirects', () => {
  it('prefers AUTH_DOMAIN, then API_ORIGIN, then ello.co, without a trailing slash', () => {
    expect(authOrigin({ AUTH_DOMAIN: 'http://a.test/', API_ORIGIN: 'http://b.test' })).toBe('http://a.test')
    expect(authOrigin({ API_ORIGIN: 'http://localhost:7770' })).toBe('http://localhost:7770')
    expect(authOrigin({})).toBe('https://ello.co')
  })

  it('sends /find to /search and /wtf pages to the auth domain', () => {
    const rules = legacyRedirects({ API_ORIGIN: 'http://localhost:7770' })
    expect(rules).toContainEqual({ source: '/find', destination: '/search', permanent: false })
    expect(rules).toContainEqual({
      source: '/wtf/:path*',
      destination: 'http://localhost:7770/wtf/:path*',
      permanent: false,
    })
  })

  it('moves /artist-invites to /invites, keeping the slug', () => {
    const rules = legacyRedirects({})
    expect(rules).toContainEqual({ source: '/artist-invites', destination: '/invites', permanent: false })
    expect(rules).toContainEqual({ source: '/artist-invites/:slug', destination: '/invites/:slug', permanent: false })
  })
})
