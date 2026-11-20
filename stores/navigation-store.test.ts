import { beginNavigation, isRouteChange, useNavigationStore } from './navigation-store'

const here = { href: 'http://localhost:6660/following?x=1', pathname: '/following', search: '?x=1' }
const pending = () => useNavigationStore.getState().pending

describe('beginNavigation', () => {
  beforeEach(() => useNavigationStore.getState().finish())

  it('remembers where a navigation goes and where it started', () => {
    beginNavigation('/discover/art?before=3', 'push', here)
    expect(pending()).toEqual({ to: '/discover/art', from: '/following', toSearch: '?before=3', fromSearch: '?x=1' })
    beginNavigation('http://localhost:6660/ada', 'replace', here)
    expect(pending()).toEqual({ to: '/ada', from: '/following', toSearch: '', fromSearch: '?x=1' })
  })

  it('keeps a new query on the same page apart from a change of route', () => {
    beginNavigation('/following?x=2', 'replace', here)
    expect(pending()).toEqual({ to: '/following', from: '/following', toSearch: '?x=2', fromSearch: '?x=1' })
    expect(isRouteChange(pending()!)).toBe(false)
    beginNavigation('/discover', 'push', here)
    expect(isRouteChange(pending()!)).toBe(true)
  })

  it('is not pending for back / forward, the same page or another site', () => {
    beginNavigation('/discover', 'push', here)
    beginNavigation('/discover', 'traverse', here)
    expect(pending()).toBeNull()
    beginNavigation('/following?x=1', 'push', here)
    expect(pending()).toBeNull()
    beginNavigation('https://example.com/a', 'push', here)
    expect(pending()).toBeNull()
  })
})
