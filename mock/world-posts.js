/* eslint-disable */
// The seeded feed: a few hundred posts in the shapes real accounts post (a picture and a caption, a bare
// picture, a set, a question, a long text, a link, something to listen to, work for sale, a mention),
// by people who post at different rates. Deterministic for a given `rand`; dated by clock.js from `now`.
const { PEOPLE } = require('./people')
const clock = require('./clock')
const copy = require('./copy-general')
const embeds = require('./embeds')
const { buyUrl } = require('./products')

const PERSONAL = { ...require('./copy-people-a'), ...require('./copy-people-b') }
const POSTS = 250
const SIZES = [[1200, 800], [900, 1200], [1000, 1000], [1400, 700], [800, 1100], [1600, 900]]
const EMBEDS = [
  'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'https://vimeo.com/22439234', 'https://soundcloud.com/forss/sets/ecclesia',
  'https://www.youtube.com/watch?v=jNQXAC9IVRw', 'https://vimeo.com/1084537',
]
// [shape, weight]
const SHAPES = [['photo', 36], ['bare', 12], ['set', 15], ['text', 12], ['long', 4], ['link', 6], ['embed', 3], ['sale', 4], ['mention', 8]]

const weighted = (rand, pairs) => {
  let roll = rand() * pairs.reduce((sum, [, w]) => sum + w, 0)
  return (pairs.find(([, w]) => (roll -= w) < 0) || pairs[pairs.length - 1])[0]
}

const shuffled = (rand, list) => {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const paragraphs = lines => lines.map(line => `<p>${line}</p>`).join('')
const mention = username => `<a href="/${username}" class="user-mention">@${username}</a>`
const anchor = site => `<a href="https://${site}" rel="nofollow noopener" target="_blank">${site}</a>`
const text = html => ({ kind: 'text', data: html })

// Every line is used once: a deck hands out its lines until it is empty
const deck = (rand, lines) => {
  const left = shuffled(rand, lines)
  return () => left.pop() || null
}

const addPosts = (db, { rand, now, nextId }) => {
  const heat = new Map()
  const authors = db.users.map((user, i) => [user, PEOPLE[i].posts])
  const own = Object.fromEntries(db.users.map(u => [u.id, deck(rand, (PERSONAL[u.username] || { lines: [] }).lines)]))
  const decks = Object.fromEntries(Object.entries(copy).map(([name, lines]) => [name, deck(rand, lines)]))
  const pick = list => list[Math.floor(rand() * list.length)]
  const count = (min, max) => min + Math.floor(rand() * (max - min + 1))

  const images = (author, n, howMany, extra = () => ({})) => Array.from({ length: howMany }, (_, i) => {
    const [width, height] = pick(SIZES)
    return { kind: 'image', data: { url: null, seed: `${author.username}-w${n}-${i}` }, width, height, ...extra(i) }
  })
  const tagged = (author, line) => {
    const tags = (PERSONAL[author.username] || { tags: [] }).tags
    if (!tags.length || rand() > 0.38) return line
    return `${line} ${shuffled(rand, tags).slice(0, count(1, 3)).map(t => `#${t}`).join(' ')}`
  }
  const caption = author => (rand() < 0.7 && own[author.id]()) || decks.GENERAL() || own[author.id]()
  const followed = author => db.follows.filter(f => f.followerId === author.id).map(f => db.users.find(u => u.id === f.followeeId))

  // regions (and flags) for one post of the given shape; null when its copy has run out
  const shapes = {
    photo: (author, n) => {
      const line = caption(author)
      if (!line) return shapes.bare(author, n)
      const parts = [text(paragraphs([tagged(author, line)])), ...images(author, n, 1)]
      return { regions: rand() < 0.25 ? parts.reverse() : parts }
    },
    bare: (author, n) => ({ regions: images(author, n, count(1, 2)) }),
    set: (author, n) => {
      const line = caption(author)
      return { regions: [...(line ? [text(paragraphs([tagged(author, line)]))] : []), ...images(author, n, count(2, 5))] }
    },
    text: () => {
      const line = decks.TEXT_ONLY()
      return line && { regions: [text(paragraphs([line]))] }
    },
    long: (author, n) => {
      const lines = decks.LONG()
      return lines && { regions: [text(paragraphs(lines)), ...(rand() < 0.5 ? images(author, n, 1) : [])] }
    },
    link: (author, n) => {
      const line = decks.WITH_LINK()
      const site = (author.links[0] || { text: 'journal.example.com' }).text
      return line && { regions: [...images(author, n, 1), text(paragraphs([line, anchor(`${site}/${author.username}-${n}`)]))] }
    },
    embed: () => {
      const line = decks.WITH_EMBED()
      return line && { regions: [text(paragraphs([line])), { kind: 'embed', data: embeds.resolve(pick(EMBEDS)).region }] }
    },
    sale: (author, n) => {
      const line = decks.FOR_SALE()
      const link = i => ({ linkUrl: buyUrl(`${author.username}-${n}-${i + 1}`) })
      return line && { regions: [text(paragraphs([tagged(author, line)])), ...images(author, n, count(1, 3), link)], isProduct: true }
    },
    mention: (author, n) => {
      const line = decks.WITH_MENTION()
      const friends = followed(author)
      if (!line || !friends.length) return null
      return { regions: [text(paragraphs([line.replace('@{m}', mention(pick(friends).username))])), ...images(author, n, 1)] }
    },
  }

  for (let n = 0; n < POSTS; n += 1) {
    const author = weighted(rand, authors)
    const person = PEOPLE[db.users.indexOf(author)]
    const { regions, isProduct } = shapes[weighted(rand, SHAPES)](author, n) || shapes.photo(author, n)
    const age = clock.ageOf(n, POSTS, rand())
    // a long tail: most posts are quiet, a few take off (more easily for well known people)
    const pop = Math.min(1, rand() ** 3 * (0.5 + person.fame * 0.8))
    const settled = Math.min(1, age / (2 * clock.DAY)) ** 0.6
    const post = {
      id: nextId(), token: `p${n}x${Math.floor(rand() * 9000 + 1000)}`, authorId: author.id,
      createdAt: clock.ago(now, age), regions,
      categoryIds: rand() < 0.1 ? [] : [String(rand() < 0.8 ? person.cat : count(1, 4))],
      views: Math.floor((8 + settled * (70 + pop ** 2 * 24000)) * (0.6 + rand() * 0.8)),
    }
    if (isProduct) post.isProduct = true
    if (regions.some(r => r.kind === 'image') && rand() < 0.03) post.contentWarning = 'NSFW'
    heat.set(post.id, pop)
    db.posts.push(post)
  }
  return heat
}

module.exports = { addPosts, POSTS, weighted, shuffled, mention }
