import { isProfileTabChange, profileOf, routeLoading } from './route-loading'

describe('routeLoading', () => {
  it('gives the stream views their own loading view', () => {
    expect(routeLoading('/')).toEqual({ kind: 'editorial' })
    expect(routeLoading('/following')).toEqual({ kind: 'following' })
    expect(routeLoading('/following/trending')).toEqual({ kind: 'following' })
    expect(routeLoading('/invites')).toEqual({ kind: 'invites' })
    expect(routeLoading('/search')).toEqual({ kind: 'search' })
  })

  it('knows the discover streams from the categories', () => {
    expect(routeLoading('/discover')).toEqual({ kind: 'discover', slug: null, section: 'featured' })
    expect(routeLoading('/discover/recent')).toEqual({ kind: 'discover', slug: null, section: 'recent' })
    expect(routeLoading('/discover/art')).toEqual({ kind: 'discover', slug: 'art', section: 'featured' })
    expect(routeLoading('/discover/art/shop')).toEqual({ kind: 'discover', slug: 'art', section: 'shop' })
    expect(routeLoading('/discover/all')).toBeNull()
    expect(routeLoading('/discover/art/nope')).toBeNull()
  })

  it('keeps the tab of the notifications page', () => {
    expect(routeLoading('/notifications')).toEqual({ kind: 'notifications', tab: 'all' })
    expect(routeLoading('/notifications/loves')).toEqual({ kind: 'notifications', tab: 'loves' })
    expect(routeLoading('/notifications/nope')).toBeNull()
  })

  it('keeps the open page for detail views, whose record this app cannot draw before it arrives', () => {
    for (const path of ['/ada', '/ada/loves', '/ada/post/abc', '/invites/neon-nights']) expect(routeLoading(path)).toBeNull()
  })

  it('knows a change of tab on one profile', () => {
    expect(isProfileTabChange('/ada/loves', '/ada')).toBe(true)
    expect(isProfileTabChange('/ada', '/Ada/followers')).toBe(true)
    expect(isProfileTabChange('/grace', '/ada')).toBe(false)
    expect(isProfileTabChange('/ada', '/ada')).toBe(false)
    expect(isProfileTabChange('/ada/post/abc', '/ada')).toBe(false)
  })

  it('keeps the open page for views the original had nothing to load for', () => {
    for (const path of ['/settings', '/invitations', '/enter', '/join', '/onboarding/categories', '/ada/post', '/ada/post/a/b'])
      expect(routeLoading(path)).toBeNull()
  })

  it('does not take app pages for usernames', () => {
    expect(profileOf('/settings')).toBeNull()
    expect(profileOf('/ada/post/abc')).toBeNull()
    expect(profileOf('/Ada/followers')).toBe('ada')
  })
})
