/* eslint-disable */
// Background activity: one thing a seeded person does on their own (love, comment, post, follow, repost).
// Pure logic over a db with an injected clock, random source and id counter, so it can be unit tested;
// live-runner.js calls it on a timer. Whatever it adds goes through the same records as a real action,
// so counts, feeds and (through notifications.sync) notifications follow in both apps.
const { buildPost, LINES } = require('./new-posts')
const { PEOPLE } = require('./people')
const { weighted, shuffled } = require('./world-posts')
const moderation = require('./moderation')
const general = require('./copy-general')
const comments = require('./copy-comments')

const PERSONAL = { ...require('./copy-people-a'), ...require('./copy-people-b') }
// [action, weight]
const KINDS = [['love', 50], ['comment', 26], ['post', 14], ['follow', 6], ['repost', 4]]
const AIM = 0.35 // share of actions aimed at the people who are logged in right now
const RECENT = 40 // other actions land on the newest posts
const SIZES = [[1200, 800], [900, 1200], [1000, 1000], [1400, 700]]
const CAPS = { maxPosts: 200, maxComments: 600 }

const newestFirst = (a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0)
const stripTags = html => String(html || '').replace(/<[^>]*>/g, '')
const textOf = post => post.regions.filter(r => r.kind === 'text').map(r => stripTags(r.data)).join(' ')

// Only the seeded cast acts on its own (ids 1..n); people who signed up, and whoever is logged in, do not
const actorsOf = (db, viewerIds) => db.users.filter(u => Number(u.id) <= PEOPLE.length && !viewerIds.includes(u.id))

const context = (db, { now, rand, nextId, viewerIds = [] }) => {
  const pick = list => list[Math.floor(rand() * list.length)]
  const posts = [...db.posts].sort(newestFirst)
  const aimed = viewerIds.length > 0 && rand() < AIM
  const name = id => (db.users.find(u => u.id === id) || {}).username
  // nobody acts on someone they blocked or muted, or who blocked them
  const strangers = (a, b) => !moderation.isHiddenFrom(db, a, b)
  // where an action lands: a logged-in person's recent posts, or the top of the feed
  const targets = () => shuffled(rand, aimed ? posts.filter(p => viewerIds.includes(p.authorId)).slice(0, 10) : posts.slice(0, RECENT))
  return { db, now, rand, nextId, viewerIds, pick, posts, aimed, name, strangers, targets, actors: shuffled(rand, actorsOf(db, viewerIds)) }
}

const love = (c) => {
  for (const post of c.targets()) {
    const actor = c.actors.find(a => a.id !== post.authorId && c.strangers(a.id, post.authorId)
      && !c.db.loves.some(l => l.userId === a.id && l.postId === post.id))
    if (actor) {
      c.db.loves.push({ userId: actor.id, postId: post.id })
      return { kind: 'love', by: actor.username, post: post.token, of: c.name(post.authorId) }
    }
  }
  return null
}

const comment = (c) => {
  const post = c.targets()[0]
  if (!post) return null
  const thread = c.db.comments.filter(x => x.postId === post.id)
  const author = c.actors.find(a => a.id === post.authorId)
  const replying = author && thread.length > 0 && thread[thread.length - 1].authorId !== author.id && c.rand() < 0.25
  const actor = replying ? author : c.actors.find(a => a.id !== post.authorId && c.strangers(a.id, post.authorId))
  if (!actor) return null
  const pool = replying ? comments.REPLIES : c.rand() < 0.15 ? comments.REACTIONS : comments.COMMENTS
  const said = new Set(thread.map(x => x.text))
  const text = shuffled(c.rand, pool).find(line => !said.has(line))
  if (!text) return null
  c.db.comments.push({ id: c.nextId(), postId: post.id, authorId: actor.id, createdAt: new Date(c.now).toISOString(), text, live: true })
  return { kind: 'comment', by: actor.username, post: post.token, of: c.name(post.authorId), text, ...(replying ? { reply: true } : {}) }
}

const post = (c) => {
  // prolific people post more often here too
  const author = c.actors.length ? weighted(c.rand, c.actors.map(a => [a, PEOPLE[Number(a.id) - 1].posts])) : null
  if (!author) return null
  const person = PEOPLE[Number(author.id) - 1]
  const own = PERSONAL[author.username] || { lines: [], tags: [] }
  // nothing that is already on the first screens of the feed
  const onTop = c.posts.slice(0, 60).map(textOf)
  const fresh = lines => shuffled(c.rand, lines).find(line => !onTop.some(t => t.includes(line)))
  const roll = c.rand()
  const id = c.nextId()
  const image = i => {
    const [width, height] = c.pick(SIZES)
    return { kind: 'image', data: { url: null, seed: `${author.username}-live-${id}-${i}` }, width, height }
  }
  const tags = c.rand() < 0.3 && own.tags.length ? ` ${shuffled(c.rand, own.tags).slice(0, 2).map(t => `#${t}`).join(' ')}` : ''
  const caption = fresh([...own.lines, ...general.GENERAL, ...LINES])
  const question = fresh(general.TEXT_ONLY)
  let regions = []
  if (roll < 0.2 && question) regions = [{ kind: 'text', data: `<p>${question}</p>` }]
  else if (roll < 0.35 || !caption) regions = [image(0)]
  else regions = [{ kind: 'text', data: `<p>${caption}${tags}</p>` }, ...Array.from({ length: roll > 0.85 ? 3 : 1 }, (_, i) => image(i))]
  const record = { ...buildPost({ id, author, now: c.now, regions, categoryIds: c.rand() < 0.6 ? [String(person.cat)] : [] }), live: true }
  c.db.posts.unshift(record)
  return { kind: 'post', by: author.username, post: record.token }
}

const follow = (c) => {
  const follows = (a, b) => c.db.follows.some(f => f.followerId === a && f.followeeId === b)
  const wanted = c.aimed ? c.viewerIds : shuffled(c.rand, c.db.users.map(u => u.id)).slice(0, 6)
  for (const target of wanted) {
    const actor = c.actors.find(a => a.id !== target && !follows(a.id, target) && c.strangers(a.id, target))
    if (actor) {
      c.db.follows.push({ followerId: actor.id, followeeId: target })
      return { kind: 'follow', by: actor.username, of: c.name(target) }
    }
  }
  return null
}

const repost = (c) => {
  const reposted = (userId, postId) => c.db.posts.some(p => p.repostOfId === postId && p.authorId === userId)
  const source = c.targets().find(p => !p.repostOfId)
  const actor = source && c.actors.find(a => a.id !== source.authorId && !reposted(a.id, source.id) && c.strangers(a.id, source.authorId))
  if (!actor) return null
  const note = c.pick(comments.REPOST_NOTES)
  const id = c.nextId()
  c.db.posts.unshift({
    id, token: `r${c.now.toString(36)}${id}`, authorId: actor.id, createdAt: new Date(c.now).toISOString(),
    regions: note ? [{ kind: 'text', data: `<p>${note}</p>` }] : [], categoryIds: [], views: 0, repostOfId: source.id, live: true,
  })
  return { kind: 'repost', by: actor.username, post: source.token, of: c.name(source.authorId) }
}

const ACTIONS = { love, comment, post, follow, repost }

// People keep looking at the newest posts
const bumpViews = (c) => {
  c.posts.slice(0, 30).forEach((p) => { if (c.rand() < 0.15) p.views = (p.views || 0) + 1 + Math.floor(c.rand() * 12) })
}

// One action. Tries the kind it drew first and falls back to the others when that one has nothing left to do
// (everyone already follows everyone, say). Returns what happened, or null when nothing could.
const step = (db, options) => {
  const c = context(db, options)
  bumpViews(c)
  const first = weighted(c.rand, KINDS)
  const order = [first, ...KINDS.map(([kind]) => kind).filter(kind => kind !== first)]
  for (const kind of order) {
    const done = ACTIONS[kind](c)
    if (done) return done
  }
  return null
}

// Keeps a long session bounded: beyond the caps the oldest posts and comments the engine made are removed
// again, with what hangs off them. Loves and follows are bounded by people x posts and people x people.
const prune = (db, { maxPosts = CAPS.maxPosts, maxComments = CAPS.maxComments } = {}) => {
  const livePosts = db.posts.filter(p => p.live).sort(newestFirst)
  const gone = new Set(livePosts.slice(maxPosts).map(p => p.id))
  db.posts.forEach((p) => { if (gone.has(p.repostOfId)) gone.add(p.id) })
  if (gone.size) {
    db.posts = db.posts.filter(p => !gone.has(p.id))
    db.comments = db.comments.filter(x => !gone.has(x.postId))
    db.loves = db.loves.filter(l => !gone.has(l.postId))
    db.watches = (db.watches || []).filter(w => !gone.has(w.postId))
  }
  const extra = new Set(db.comments.filter(x => x.live).sort(newestFirst).slice(maxComments).map(x => x.id))
  if (extra.size) db.comments = db.comments.filter(x => !extra.has(x.id))
  return gone.size + extra.size
}

module.exports = { step, prune, actorsOf, KINDS, CAPS }
