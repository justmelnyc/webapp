/* eslint-disable */
// Category curation: who curates which category and where a post stands in a category.
// db.categoryRoles: [{ categoryId, userId, role: 'curator' | 'moderator' }] (both may feature and unfeature).
// db.categoryPostStates: { '<categoryId>-<postId>': { status, submittedById, featuredById } }; a post
// with no entry counts as `featured` by nobody in particular, which the apps show as "Featured by @ello.".
const SEED_VERSION = 2

// The original app stores `featuredBy { username }` as a user record without an id, and later finds that
// empty record when it opens that person's profile (hero gone, zero counts). So the seed never lets someone
// feature a post their own profile shows: not their own, not one they reposted, and not the newest post of
// its author, which the notification seed (notification-extras.js) makes ada and grace repost later.
const mayBeFeaturedBy = (db, post, userId) => post.authorId !== userId
  && !db.posts.some(p => p.repostOfId === post.id && p.authorId === userId)
  && db.posts.find(p => !p.repostOfId && p.authorId === post.authorId) !== post

// [category slug, username, role]
const ROLES = [['art', 'ada', 'curator'], ['design', 'ada', 'curator'], ['photography', 'grace', 'moderator']]

const seedCategoryPosts = (db) => {
  if (db.categoryPostsSeed === SEED_VERSION) return 0
  const names = require('./seed').CATEGORIES
  const categoryId = slug => String(names.findIndex(n => n.toLowerCase() === slug) + 1)
  const seedRoles = ROLES.flatMap(([slug, username, role]) => {
    const user = db.users.find(u => u.username === username)
    return user ? [{ categoryId: categoryId(slug), userId: user.id, role }] : []
  })
  // A database seeded by version 1 keeps its roles and states (people may have changed them); only the
  // states that break the rule above are dropped and replaced.
  const upgrade = db.categoryPostsSeed === 1 && !!db.categoryRoles && !!db.categoryPostStates
  if (!upgrade) {
    db.categoryRoles = seedRoles
    db.categoryPostStates = {}
  }
  const states = db.categoryPostStates
  const postOf = key => db.posts.find(p => p.id === key.slice(key.indexOf('-') + 1))
  Object.keys(states).forEach((key) => {
    const post = postOf(key)
    if (states[key].featuredById && post && !mayBeFeaturedBy(db, post, states[key].featuredById)) delete states[key]
  })
  seedRoles.forEach(({ categoryId: cid, userId }) => {
    const posts = db.posts.filter(p => !p.repostOfId && (p.categoryIds || []).includes(cid))
    // the first post waits for a curator, the next one the curator may feature was featured by them
    if (!upgrade && posts[0]) states[`${cid}-${posts[0].id}`] = { status: 'submitted', submittedById: posts[0].authorId }
    if (Object.keys(states).some(key => key.startsWith(`${cid}-`) && states[key].featuredById === userId)) return
    const featured = posts.find(p => !states[`${cid}-${p.id}`] && mayBeFeaturedBy(db, p, userId))
    if (featured) states[`${cid}-${featured.id}`] = { status: 'featured', submittedById: featured.authorId, featuredById: userId }
  })
  db.categoryPostsSeed = SEED_VERSION
  return seedRoles.length
}

const canCurate = (db, viewerId, categoryId) => !!viewerId
  && (db.categoryRoles || []).some(r => r.userId === viewerId && r.categoryId === categoryId)

const stateOf = (db, categoryId, post) => (db.categoryPostStates || {})[`${categoryId}-${post.id}`]
  || { status: 'featured' }

const hrefFor = (id, action) => `/api/v2/category_posts/${id}/${action}`

// What the viewer may do: feature a submitted post, unfeature a featured one
const actionsFor = (db, id, status, viewerId, categoryId) => {
  if (!canCurate(db, viewerId, categoryId)) return null
  return {
    feature: status === 'submitted' ? { method: 'PUT', href: hrefFor(id, 'feature') } : null,
    unfeature: status === 'featured' ? { method: 'PUT', href: hrefFor(id, 'unfeature') } : null,
  }
}

// Ids look like `<categoryId>-<postId>`
const parseId = (id) => {
  const m = /^(\d+)-(\d+)$/.exec(String(id))
  return m ? { categoryId: m[1], postId: m[2] } : null
}

// Returns the new state, or null when the viewer may not do that (or it does not apply to the status)
const applyAction = (db, post, categoryId, action, viewerId) => {
  if (!canCurate(db, viewerId, categoryId)) return null
  const current = stateOf(db, categoryId, post)
  const base = { submittedById: post.authorId, ...current }
  let next = null
  if (action === 'feature' && current.status === 'submitted') next = { ...base, status: 'featured', featuredById: viewerId }
  if (action === 'unfeature' && current.status === 'featured') {
    const { featuredById, ...rest } = base
    next = { ...rest, status: 'submitted' }
  }
  if (!next) return null
  db.categoryPostStates = { ...(db.categoryPostStates || {}), [`${categoryId}-${post.id}`]: next }
  return next
}

module.exports = { seedCategoryPosts, mayBeFeaturedBy, canCurate, stateOf, actionsFor, parseId, applyAction, ROLES }
