const { buildProducts, seedProducts, PRODUCTS } = require('./products')

const users = PRODUCTS.map(([username], i) => ({ id: String(i + 1), username }))
const counter = () => { let n = 0; return () => String(++n) }

describe('shop products', () => {
  it('builds flagged products whose images all carry a buy link', () => {
    const products = buildProducts(users, counter())
    expect(products).toHaveLength(PRODUCTS.length)
    products.forEach((p) => {
      expect(p.isProduct).toBe(true)
      const images = p.regions.filter(r => r.kind === 'image')
      expect(images.length).toBeGreaterThanOrEqual(1)
      expect(images.length).toBeLessThanOrEqual(3)
      images.forEach(r => expect(r.linkUrl).toMatch(/^https:\/\/shop\.example\.com\//))
    })
  })

  it('skips unknown authors', () => {
    expect(buildProducts([{ id: '1', username: 'grace' }], counter())).toHaveLength(1)
  })

  it('seeds once', () => {
    const db = { users, posts: [] }
    const next = counter()
    expect(seedProducts(db, next)).toBe(PRODUCTS.length)
    expect(seedProducts(db, next)).toBe(0)
    expect(db.posts).toHaveLength(PRODUCTS.length)
  })
})
