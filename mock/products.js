/* eslint-disable */
// Seeded products for the Shop streams: ordinary posts whose images carry a buy link (`linkUrl`),
// flagged `isProduct`. Injected once at startup; safe to call again (it does nothing if they exist).
const PRODUCTS = [
  ['grace', 'Signed archival print, edition of 25.', 'lagos-prints'],
  ['mara', 'Risograph zine, 32 pages. Ships worldwide.', 'riso-zine'],
  ['jules', 'The Lyon type specimen poster.', 'specimen-poster'],
  ['theo', 'Film scans, set of six postcards.', 'osaka-postcards'],
  ['saoirse', 'Hand-pulled linocut, small batch.', 'linocut'],
  ['ines', 'Collage originals, framed.', 'collage-originals'],
  ['yuki', 'Tiny comics collection vol. 2.', 'tiny-comics'],
  ['amara', 'Mural study prints, A3.', 'mural-prints'],
  ['luca', 'Clay render wallpaper pack.', 'clay-wallpaper'],
  ['ada', 'Plotter drawings, ink on paper.', 'plotter-drawings'],
]
const SIZES = [[1200, 800], [900, 1200], [1000, 1000]]

const buyUrl = slug => `https://shop.example.com/${slug}`

// Pure: build product post records for the given users (an id counter is injected for testing)
const buildProducts = (users, nextId, now = Date.parse('2026-11-02T09:00:00Z')) => PRODUCTS.flatMap(([username, caption, slug], n) => {
  const author = users.find(u => u.username === username)
  if (!author) return []
  const regions = [{ kind: 'text', data: `<p>${caption}</p>` }]
  const count = 1 + (n % 3)
  for (let i = 0; i < count; i += 1) {
    const [w, h] = SIZES[(n + i) % SIZES.length]
    regions.push({ kind: 'image', data: { url: null, seed: `shop-${slug}-${i}` }, width: w, height: h, linkUrl: buyUrl(`${slug}-${i + 1}`) })
  }
  return [{
    id: nextId(), token: `shop${n}x${1000 + n * 7}`, authorId: author.id,
    createdAt: new Date(now - n * 7 * 3600000).toISOString(), regions,
    categoryIds: [String(1 + (n % 4))], views: 40 + n * 13, isProduct: true,
  }]
})

const seedProducts = (db, nextId, now) => {
  if (db.posts.some(p => p.isProduct)) return 0
  const products = buildProducts(db.users, nextId, now)
  db.posts.push(...products)
  return products.length
}

module.exports = { PRODUCTS, buildProducts, seedProducts, buyUrl }
