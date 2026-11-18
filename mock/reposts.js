/* eslint-disable */
// Reposts. A repost is a post record with `repostOfId` pointing at the original; its own `regions`
// hold what the reposter added (may be empty). Counts and the viewer's `reposted` flag are derived,
// so deleting a repost (or the original) keeps everything consistent. Persisted with the posts.
const { db, save, nextId, postById } = require('./db')

const repostsOf = postId => db.posts.filter(p => p.repostOfId === String(postId))

const repostCount = postId => repostsOf(postId).length

const viewerRepost = (postId, viewerId) => (
  viewerId ? repostsOf(postId).find(p => p.authorId === viewerId) || null : null
)

// You can't repost your own post or a repost (reposts always point at the original), and only once.
const canRepost = (source, viewerId) => !!source && source.authorId !== viewerId && !viewerRepost(source.id, viewerId)

const originalOf = post => (post && post.repostOfId ? postById(post.repostOfId) : null)

const createRepost = (source, authorId, regions = [], extra = {}) => {
  const original = originalOf(source) || source
  if (!canRepost(original, authorId)) return null
  const post = {
    id: nextId(), token: `r${Date.now().toString(36)}${db.seq}`, authorId,
    createdAt: new Date().toISOString(), regions, categoryIds: [], views: 0,
    repostOfId: original.id, ...extra,
  }
  db.posts.unshift(post)
  save()
  // tell the original's author right away (sync derives `repost:<id>` from the post, keeps it while it exists)
  require('./notifications').sync()
  return post
}

const removeRepost = (postId, viewerId) => {
  const repost = viewerRepost(postId, viewerId)
  if (!repost) return false
  db.posts = db.posts.filter(p => p.id !== repost.id)
  save()
  return true
}

// Remove reposts whose original is gone (called when a post is deleted).
const dropOrphans = () => {
  db.posts = db.posts.filter(p => !p.repostOfId || postById(p.repostOfId))
}

const SEED_NOTES = [
  '<p>Needed to share this one.</p>',
  '',
  '<p>Look at that light.</p>',
  '',
  '<p>Saving this for later. So good.</p>',
]

// Existing databases get a handful of reposts once (the seed's own run adds them for fresh ones).
const seedReposts = () => {
  if (db.repostsSeeded) return false
  db.repostsSeeded = true
  const originals = db.posts.filter(p => !p.repostOfId)
  SEED_NOTES.forEach((note, i) => {
    const source = originals[i * 3 + 1]
    if (!source) return
    const author = db.users.find(u => u.id !== source.authorId && u.id !== '1' && !viewerRepost(source.id, u.id)
      && db.users.indexOf(u) >= (i % 5) + 1)
    if (!author) return
    const post = createRepost(source, author.id, note ? [{ kind: 'text', data: note }] : [])
    if (post) post.createdAt = new Date(Date.parse(source.createdAt) + (2 + i) * 3600000).toISOString()
  })
  save()
  return true
}

module.exports = { repostsOf, repostCount, viewerRepost, canRepost, originalOf, createRepost, removeRepost, dropOrphans, seedReposts }
