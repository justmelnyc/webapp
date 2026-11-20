/* eslint-disable */
// Seed data for a fresh database. Deterministic apart from one thing: `now`, the moment the database is
// created. Every date is relative to it (see clock.js), so a new database reads like a live site, and the
// same people, posts, tokens, comments and loves come out of every run.
//   people.js         who is here            world-posts.js   what they posted
//   world-social.js   follows, comments, loves, reposts       copy-*.js   what they wrote
const clock = require('./clock')
const social = require('./world-social')
const { addPosts } = require('./world-posts')

const CATEGORIES = ['Art', 'Photography', 'Design', 'Fashion']
// 1: the first cast of twelve, dated from a fixed calendar. 2: this one. Databases without it are version 1.
const SEED_VERSION = 2

// small seeded PRNG so seed data is stable
const rng = (seed) => () => {
  seed = (seed + 0x6D2B79F5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const newestFirst = (a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0)
const hasImage = post => post.regions.some(r => r.kind === 'image')

const build = (now = Date.now()) => {
  const rand = rng(42)
  const db = { seq: 1000, users: [], posts: [], comments: [], loves: [], watches: [], follows: [] }
  const nextId = () => String(++db.seq)
  const context = { rand, now, nextId }

  social.addPeople(db)
  social.addFollows(db, rand)

  // The older seeders keep their posts and tokens (shop*, emb*, srch*). They run first because each one
  // skips itself once its kind of post exists; here they are dated from `now` instead of their fixed dates.
  db.posts.push(...require('./products').buildProducts(db.users, nextId, now - 5 * clock.HOUR))
  require('./embeds').seedEmbedPosts(db, nextId, now - 9 * clock.HOUR)
  require('./post-search').seedSearchPosts(db, nextId, now - 36 * clock.HOUR)
  const older = db.posts.slice()

  const heat = addPosts(db, context)
  older.forEach(post => heat.set(post.id, rand() ** 3 * 0.8))
  social.addComments(db, context, heat)
  social.addLoves(db, context, heat)
  social.addReposts(db, context, heat)
  db.posts.sort(newestFirst)

  require('./invitations').seedInvitations(db, nextId, now - clock.DAY)
  // a spread of picture posts is submitted to the artist invites, not simply the newest ones
  const submittable = db.posts.filter((post, i) => !post.repostOfId && hasImage(post) && i % 3 === 1)
  require('./artist-invites').seedArtistInvites(db, nextId, now, submittable)
  // curators and category post states; server.js applies it to older db files too
  require('./category-posts').seedCategoryPosts(db)

  db.seededAt = now
  db.seedVersion = SEED_VERSION
  return db
}

module.exports = { build, CATEGORIES, SEED_VERSION, rng }
