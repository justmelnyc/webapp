/* eslint-disable */
// Pure moderation logic: block/mute, feed hiding, flags, availability, roles, NSFW seed.
// Kept free of express so it can be unit tested.
const { CATEGORIES } = require('./seed')

const FLAG_KINDS = ['spam', 'violence', 'copyright', 'threatening', 'hate_speech', 'adult', 'offensive']
const isFlagKind = kind => FLAG_KINDS.includes(kind)

const blocksOf = db => db.blocks || (db.blocks = [])

// 'block' | 'mute' | null: how `viewerId` has marked `targetId`
const blockKind = (db, viewerId, targetId) => {
  if (!viewerId) return null
  const rec = blocksOf(db).find(b => b.userId === viewerId && b.targetId === targetId)
  return rec ? rec.kind : null
}

const hasBlocked = (db, ownerId, targetId) => blocksOf(db).some(b => b.userId === ownerId && b.targetId === targetId && b.kind === 'block')

const clearBlock = (db, viewerId, targetId) => {
  db.blocks = blocksOf(db).filter(b => !(b.userId === viewerId && b.targetId === targetId))
}

// Set (or with priority 'inactive'/'friend', clear) a block/mute. Returns true when a record was set.
const setBlock = (db, viewerId, targetId, priority) => {
  clearBlock(db, viewerId, targetId)
  if (priority !== 'block' && priority !== 'mute') return false
  blocksOf(db).push({ userId: viewerId, targetId, kind: priority })
  if (priority === 'block') {
    db.follows = db.follows.filter(f => !(
      (f.followerId === viewerId && f.followeeId === targetId) || (f.followerId === targetId && f.followeeId === viewerId)
    ))
  }
  return true
}

// Is a post by `authorId` hidden from the viewer's feeds?
const isHiddenFrom = (db, viewerId, authorId) => {
  if (!viewerId || viewerId === authorId) return false
  return !!blockKind(db, viewerId, authorId) || hasBlocked(db, authorId, viewerId)
}

const visiblePosts = (db, viewerId, posts) => (viewerId ? posts.filter(p => !isHiddenFrom(db, viewerId, p.authorId)) : posts)

const blockedUsers = (db, viewerId, kind) => blocksOf(db)
  .filter(b => b.userId === viewerId && b.kind === kind)
  .map(b => db.users.find(u => u.id === b.targetId))
  .filter(Boolean)

const categoryUsers = (user) => (user.roles || []).map((r, i) => {
  const name = CATEGORIES[Number(r.categoryId) - 1]
  return { id: `${user.id}-role-${i + 1}`, role: r.role, category: { id: r.categoryId, name, slug: String(name).toLowerCase() } }
})

const LONG = {
  grace: ' I spend months with the communities I photograph before the first frame, because the work only holds up when it is made together. Prints, essays and small-run books are all in progress.',
  mara: ' My zines are risograph printed in tiny batches, mostly about food, neighbourhood markets and the stories people tell over a long lunch. Commissions open twice a year, and I trade prints for plants.',
  yuki: ' Most of my comics fit on a single postcard and are painted with a travel kit on the train. I am slowly collecting them into a book about small quiet moments, tea shops, cats and rainy afternoons.',
}

const AVAILABILITY = {
  mara: { hireable: true, collaborateable: true },
  grace: { hireable: false, collaborateable: true },
  jules: { hireable: true, collaborateable: false },
  theo: { hireable: true, collaborateable: true },
}

const ROLES = {
  grace: [{ categoryId: '2', role: 'CURATOR' }],
  jules: [{ categoryId: '3', role: 'FEATURED' }],
  mara: [{ categoryId: '1', role: 'MODERATOR' }, { categoryId: '4', role: 'FEATURED' }],
}

// Indexes into db.posts (newest first). 0 and 3 sit on page 1 of the global feed.
const NSFW_INDEXES = [1, 3, 8, 14]

// Idempotent: runs once per database, then leaves later user edits alone.
const ensureModerationData = (db) => {
  db.blocks = db.blocks || []
  db.flags = db.flags || []
  db.messages = db.messages || []
  if (db.moderationSeeded) return db
  db.users.forEach((u) => {
    const a = AVAILABILITY[u.username]
    if (a) { u.hireable = a.hireable; u.collaborateable = a.collaborateable }
    if (ROLES[u.username]) u.roles = ROLES[u.username]
    if (LONG[u.username]) u.bio = u.bio + LONG[u.username]
  })
  const ada = db.users.find(u => u.username === 'ada')
  const adaPost = db.posts.find(p => ada && p.authorId === ada.id)
  const targets = NSFW_INDEXES.map(i => db.posts[i]).filter(Boolean)
  if (adaPost && !targets.includes(adaPost)) targets.push(adaPost)
  targets.forEach((p) => { p.contentWarning = 'NSFW' })
  db.moderationSeeded = true
  return db
}

module.exports = {
  FLAG_KINDS, isFlagKind, blockKind, hasBlocked, setBlock, clearBlock, isHiddenFrom, visiblePosts,
  blockedUsers, categoryUsers, ensureModerationData,
}
