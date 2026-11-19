/* eslint-disable */
// Category curation: who curates which category and where a post stands in a category.
// db.categoryRoles: [{ categoryId, userId, role: 'curator' | 'moderator' }] (both may feature and unfeature).
// db.categoryPostStates: { '<categoryId>-<postId>': { status, submittedById, featuredById } }; a post
// with no entry counts as `featured` by nobody in particular, which the apps show as "Featured by @ello.".
const SEED_VERSION = 1

// [category slug, username, role]
const ROLES = [['art', 'ada', 'curator'], ['design', 'ada', 'curator'], ['photography', 'grace', 'moderator']]

const seedCategoryPosts = (db) => {
  if (db.categoryPostsSeed === SEED_VERSION) return 0
  const names = require('./seed').CATEGORIES
  const categoryId = slug => String(names.findIndex(n => n.toLowerCase() === slug) + 1)
  db.categoryRoles = ROLES.flatMap(([slug, username, role]) => {
    const user = db.users.find(u => u.username === username)
    return user ? [{ categoryId: categoryId(slug), userId: user.id, role }] : []
  })
  db.categoryPostStates = {}
  db.categoryRoles.forEach(({ categoryId: cid, userId }) => {
    const posts = db.posts.filter(p => !p.repostOfId && (p.categoryIds || []).includes(cid))
    // the first post waits for a curator, the second was featured by one
    if (posts[0]) db.categoryPostStates[`${cid}-${posts[0].id}`] = { status: 'submitted', submittedById: posts[0].authorId }
    if (posts[1]) db.categoryPostStates[`${cid}-${posts[1].id}`] = { status: 'featured', submittedById: posts[1].authorId, featuredById: userId }
  })
  db.categoryPostsSeed = SEED_VERSION
  return db.categoryRoles.length
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

module.exports = { seedCategoryPosts, canCurate, stateOf, actionsFor, parseId, applyAction, ROLES }
