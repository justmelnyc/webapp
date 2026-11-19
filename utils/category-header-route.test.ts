import { showsCategoryHeader } from './category-header-route'

describe('showsCategoryHeader', () => {
  it.each(['/', '/discover', '/discover/featured', '/discover/recommended', '/discover/trending', '/discover/recent', '/discover/shop', '/discover/subscribed', '/discover/subscribed/shop'])(
    'is true on %s',
    (pathname) => expect(showsCategoryHeader(pathname)).toBe(true),
  )

  it.each(['/discover/fashion', '/discover/fashion/trending', '/ada', '/ada/post/abc', '/following', '/search'])(
    'is false on %s',
    (pathname) => expect(showsCategoryHeader(pathname)).toBe(false),
  )
})
