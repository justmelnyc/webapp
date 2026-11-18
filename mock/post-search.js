/* eslint-disable */
// Post search (the Posts tab of /search): word matching, `#hashtag` support, recency order, paging, seed posts.
// The original reads REST (GET /api/v2/posts?terms=), the rewrite reads GraphQL (searchPosts).

const HASHTAG = /#([\p{L}\p{N}_]+)/gu

// Text of a post: its text regions without markup (image alt text counts too)
const stripTags = html => String(html || '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
const postText = post => post.regions
  .map(r => (r.kind === 'text' ? stripTags(r.data) : (r.kind === 'image' && r.data && r.data.alt) || ''))
  .join(' ')

const hashtagsOf = text => [...text.matchAll(HASHTAG)].map(m => m[1].toLowerCase())
const wordsOf = text => text.toLowerCase().match(/[\p{L}\p{N}_']+/gu) || []

// `#tag` becomes the span the real API returns (the original has no <a>; it pushes the span's data-href)
const hashtagHref = tag => `/search?terms=${encodeURIComponent(`#${tag}`)}`
const linkHashtags = html => String(html).replace(/(<[^>]*>)|#([\p{L}\p{N}_]+)/gu, (all, tag, name) => (
  tag || `<span class="hashtag-link" data-href="${hashtagHref(name)}">#${name}</span>`
))
const unlinkHashtags = html => String(html).replace(/<span class="hashtag-link"[^>]*>(.*?)<\/span>/g, '$1')

// "light #film" -> [{ tag: false, word: 'light' }, { tag: true, word: 'film' }]
const parseTerms = (terms) => {
  let raw = String(terms || '')
  try { raw = decodeURIComponent(raw) } catch (e) { /* already decoded */ }
  return raw.trim().toLowerCase().split(/\s+/).filter(Boolean).map(t => (
    t.startsWith('#') ? { tag: true, word: t.slice(1) } : { tag: false, word: t.replace(/^@/, '') }
  )).filter(t => t.word.length > 0)
}

// Every term must match. A plain word is the start of a word in the text or of the author's username;
// a `#tag` is exactly one of the post's hashtags.
const matches = (post, author, terms) => {
  const text = postText(post)
  const words = wordsOf(text)
  const tags = hashtagsOf(text)
  const username = author ? author.username.toLowerCase() : ''
  return terms.every(t => (t.tag
    ? tags.includes(t.word)
    : words.some(w => w.startsWith(t.word)) || username.startsWith(t.word)))
}

const byRecency = (a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0)

const searchPosts = (db, terms) => {
  const parsed = parseTerms(terms)
  if (!parsed.length) return []
  const author = post => db.users.find(u => u.id === post.authorId)
  return db.posts.filter(p => matches(p, author(p), parsed)).sort(byRecency)
}

// Offset cursor, like the GraphQL streams: `next` is where the following page starts
const pageOf = (list, before, perPage) => {
  const start = parseInt(before, 10) || 0
  const end = start + perPage
  return { items: list.slice(start, end), next: end < list.length ? String(end) : null, isLastPage: end >= list.length }
}

// Varied text so searches have something to find. Older than every other seeded post, so feeds keep their top.
const SEED_POSTS = [
  ['mara', 'Zine layout for the spring fair. #zine #print', 1],
  ['jules', 'Sketching a new serif. Every curve is a negotiation. #typography #lettering', 0],
  ['theo', 'Night walk through Dotonbori with the Leica. #film #streetphotography', 1],
  ['yuki', 'Tiny comic about a tired cat. #comics #watercolor', 1],
  ['saoirse', 'Fresh from the kiln: glaze test number nine. #ceramics', 1],
  ['luca', 'Clay render of a lemon squeezer, because why not. #3d #clay', 1],
  ['noor', 'Loop animation, eight frames, endless coffee. #motion #animation', 0],
  ['ines', 'Collage from old magazines and a lot of glue. #collage #fashion', 1],
  ['kofi', 'Brutalist stairwell, golden hour. #architecture #concrete', 1],
  ['amara', 'Mural wall is done. Thank you to everyone who helped paint! #mural #brand', 1],
  ['grace', 'Portraits from the market, shot on a warm afternoon. #photography #documentary', 2],
  ['ada', 'Plotter drawing number forty. Pen on paper, pure geometry. #generative #plotter', 1],
  ['ada', 'Light study with a handmade lens. #generative #light', 1],
  ['mara', 'Coffee, ink and a deadline. #illustration', 0],
  ['theo', 'Developing film at home for the first time. #film', 1],
  ['jules', 'Poster for the type specimen. #typography #print', 1],
  ['yuki', 'Cherry blossoms in my sketchbook. #watercolor #spring', 1],
  ['noor', 'Color palette exploration for a short film. #motion #color', 0],
  ['kofi', 'Concrete texture study, close up. #concrete #texture', 1],
  ['ines', 'Editorial shoot behind the scenes. #fashion #editorial', 2],
  ['luca', 'Soft shadows and warm light on a tiny clay house. #clay #light', 1],
  ['saoirse', 'Printmaking weekend: linocut, ink and patience. #printmaking #print', 1],
  ['amara', 'Brand refresh for a bakery, sneak peek. #brand #design', 1],
  ['grace', 'A quiet street in Lagos before the rain. #streetphotography', 1],
  ['ada', 'Thank you @grace for the feedback on the last series.', 0],
  ['theo', 'Rainy day, empty platform, one frame left. #film #rain', 1],
  ['mara', 'Everything I drew this week in one pile.', 1],
  ['jules', 'Lettering practice with a broad nib. #lettering', 0],
  ['noor', 'Nothing beats a good storyboard. #animation', 1],
  ['yuki', 'New sticker pack is almost ready! #comics #stickers', 1],
]

const SIZES = [[1200, 800], [900, 1200], [1000, 1000], [1400, 700]]

// Idempotent: skipped once the seed tokens exist
const seedSearchPosts = (db, nextId, newest = Date.parse('2026-10-20T20:00:00Z')) => {
  if (db.posts.some(p => String(p.token).startsWith('srch'))) return 0
  SEED_POSTS.forEach(([username, caption, images], n) => {
    const author = db.users.find(u => u.username === username)
    if (!author) return
    const regions = [{ kind: 'text', data: `<p>${caption}</p>` }]
    for (let i = 0; i < images; i += 1) {
      const [width, height] = SIZES[(n + i) % SIZES.length]
      regions.push({ kind: 'image', data: { url: null, seed: `${username}-srch-${n}-${i}` }, width, height })
    }
    db.posts.push({
      id: nextId(), token: `srch${n}x${3000 + n * 7}`, authorId: author.id,
      createdAt: new Date(newest - n * 7 * 3600000).toISOString(),
      regions, categoryIds: [String(1 + (n % 4))], views: 40 + n * 13,
    })
  })
  return SEED_POSTS.length
}

module.exports = { parseTerms, matches, searchPosts, pageOf, linkHashtags, unlinkHashtags, hashtagsOf, seedSearchPosts, SEED_POSTS }
