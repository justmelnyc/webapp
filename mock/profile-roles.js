/* eslint-disable */
// What the profile's "Community Roles" panel needs on top of category-users.js:
//  - the categories the viewer administers, with their role there (GraphQL `searchCategories(administered: true)`)
//  - FEATURED roles. Those are not in db.categoryRoles (a featured user administers nothing): they live on the
//    user as `user.roles = [{ categoryId, role: 'FEATURED' }]`, with the id `<categoryId>-<userId>-featured`.
// Pure: takes the db.
const cu = require('./category-users')

const RANK = { curator: 1, moderator: 2 }
const featuredId = (categoryId, userId) => `${categoryId}-${userId}-featured`
const parseFeaturedId = (id) => {
  const m = /^(\d+)-(\d+)-featured$/.exec(String(id))
  return m ? { categoryId: m[1], userId: m[2] } : null
}
const isFeaturedRole = role => String(role).toLowerCase() === 'featured'
const isFeatured = categoryId => r => r.role === 'FEATURED' && r.categoryId === categoryId

// The viewer's highest role in a category: 'MODERATOR' | 'CURATOR' | null
const roleIn = (db, viewerId, categoryId) => {
  const mine = cu.rolesIn(db, categoryId).filter(r => r.userId === viewerId).map(r => r.role)
  if (!mine.length) return null
  return mine.sort((a, b) => RANK[b] - RANK[a])[0].toUpperCase()
}

// `categories` are the serialized categories (content.categories); `query` filters by name like the real search.
// Staff (staff.js) administer every category, with a role of null where they hold none.
const administeredCategories = (db, viewerId, categories, query) => {
  if (!viewerId) return []
  const q = String(query || '').trim().toLowerCase()
  const all = require('./staff').isStaff(db, viewerId)
  return categories
    .map(c => ({ ...c, currentUserState: { role: roleIn(db, viewerId, c.id) } }))
    .filter(c => (all || c.currentUserState.role) && (!q || c.name.toLowerCase().includes(q)))
}

// -> { status: 'ok' | 'forbidden' | 'invalid', record } with record { categoryId, userId, role: 'featured' }
const addFeatured = (db, viewerId, { userId, categoryId } = {}) => {
  const record = { categoryId: String(categoryId), userId: String(userId), role: 'featured' }
  const user = db.users.find(u => u.id === record.userId)
  if (!user || !/^\d+$/.test(record.categoryId)) return { status: 'invalid' }
  if (!cu.canManage(db, viewerId, record.categoryId)) return { status: 'forbidden' }
  const roles = user.roles || []
  if (!roles.some(isFeatured(record.categoryId))) user.roles = [...roles, { categoryId: record.categoryId, role: 'FEATURED' }]
  return { status: 'ok', record }
}

// -> 'ok' | 'forbidden' | 'missing'
const removeFeatured = (db, viewerId, id) => {
  const target = parseFeaturedId(id)
  const user = target && db.users.find(u => u.id === target.userId)
  if (!user || !(user.roles || []).some(isFeatured(target.categoryId))) return 'missing'
  if (!cu.canManage(db, viewerId, target.categoryId)) return 'forbidden'
  user.roles = user.roles.filter(r => !isFeatured(target.categoryId)(r))
  return 'ok'
}

module.exports = { featuredId, parseFeaturedId, isFeaturedRole, roleIn, administeredCategories, addFeatured, removeFeatured }
