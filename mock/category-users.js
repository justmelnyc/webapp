/* eslint-disable */
// Category curators and moderators: who they are, who may change them, adding and removing one.
// Pure: takes the db. Records live in db.categoryRoles (seeded by category-posts.js):
//   [{ categoryId, userId, role: 'curator' | 'moderator' }]
// The apps know a role as a "category user" with an id; ids here look like `<categoryId>-<userId>-<role>`.
const ROLES = ['curator', 'moderator']

const rolesOf = db => db.categoryRoles || (db.categoryRoles = [])
const idOf = r => `${r.categoryId}-${r.userId}-${r.role}`

const parseId = (id) => {
  const m = /^(\d+)-(\d+)-(curator|moderator)$/.exec(String(id))
  return m ? { categoryId: m[1], userId: m[2], role: m[3] } : null
}

const same = (a, b) => a.categoryId === b.categoryId && a.userId === b.userId && a.role === b.role

// The roles of a category, optionally only some kinds (GraphQL `categoryUsers(roles: [CURATOR, MODERATOR])`)
const rolesIn = (db, categoryId, kinds) => {
  const wanted = Array.isArray(kinds) && kinds.length ? kinds.map(k => String(k).toLowerCase()) : ROLES
  return rolesOf(db).filter(r => r.categoryId === String(categoryId) && wanted.includes(r.role))
}

// Categories whose roles this user may change: the ones where they are a curator or a moderator.
// The profile reports them as `links.categories`, which is what the original reads to show the buttons.
const administeredCategoryIds = (db, userId) => (userId
  ? [...new Set(rolesOf(db).filter(r => r.userId === userId).map(r => r.categoryId))]
  : [])

// Staff (staff.js) may change the roles of every category.
const canManage = (db, viewerId, categoryId) => require('./staff').isStaff(db, viewerId) || administeredCategoryIds(db, viewerId).includes(String(categoryId))

// -> { status: 'ok' | 'forbidden' | 'invalid', record }. Adding a role somebody already has returns it.
const addRole = (db, viewerId, { userId, categoryId, role } = {}) => {
  const record = { categoryId: String(categoryId), userId: String(userId), role: String(role).toLowerCase() }
  const known = ROLES.includes(record.role) && db.users.some(u => u.id === record.userId)
  if (!known) return { status: 'invalid' }
  if (!canManage(db, viewerId, record.categoryId)) return { status: 'forbidden' }
  const existing = rolesOf(db).find(r => same(r, record))
  if (existing) return { status: 'ok', record: existing }
  db.categoryRoles = [...rolesOf(db), record]
  return { status: 'ok', record }
}

// -> 'ok' | 'forbidden' | 'missing'
const removeRole = (db, viewerId, id) => {
  const target = parseId(id)
  if (!target || !rolesOf(db).some(r => same(r, target))) return 'missing'
  if (!canManage(db, viewerId, target.categoryId)) return 'forbidden'
  db.categoryRoles = rolesOf(db).filter(r => !same(r, target))
  return 'ok'
}

// What GET /api/v2/profile adds for the viewer: the categories they administer and the ones they subscribed to
const profileFields = (db, user) => ({
  links: { categories: administeredCategoryIds(db, user.id) },
  followedCategoryIds: user.followedCategoryIds || [],
})

// GraphQL shape (the `category` query): role upper case, the user nested
const gqlCategoryUser = (r, user) => ({ id: idOf(r), role: r.role.toUpperCase(), user })

// v2 REST shape (the answer to POST /api/v2/category_users): role lower case, ids under `links`
const restCategoryUser = r => ({
  id: idOf(r),
  role: r.role,
  links: { category: { id: r.categoryId, type: 'categories' }, user: { id: r.userId, type: 'users' } },
})

module.exports = {
  ROLES, idOf, parseId, rolesIn, administeredCategoryIds, canManage, addRole, removeRole,
  profileFields, gqlCategoryUser, restCategoryUser,
}
