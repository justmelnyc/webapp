/* eslint-disable */
// Adding and removing a category's curators and moderators (see ../category-users.js).
// Both apps call these two REST endpoints; they read the lists through the GraphQL `category` query.
const express = require('express')
const { db, save, userById } = require('../db')
const cu = require('../category-users')
const profileRoles = require('../profile-roles')
const { flatUser, gqlAuthor } = require('../serialize')
const { viewerId } = require('./auth')

const router = express.Router()
const ERRORS = { forbidden: [403, 'forbidden'], invalid: [422, 'unknown user, category or role'], missing: [404, 'not found'] }
const fail = (res, status) => res.status(ERRORS[status][0]).json({ error: ERRORS[status][1] })

// { user_id, category_id, role: 'curator' | 'moderator' | 'featured' }
router.post('/api/v2/category_users', (req, res) => {
  const viewer = viewerId(req)
  if (!viewer) return res.status(401).json({ error: 'unauthorized' })
  const { user_id: userId, category_id: categoryId, role } = req.body || {}
  // 'featured' comes from the profile's Community Roles form (profile-roles.js)
  const { status, record } = profileRoles.isFeaturedRole(role)
    ? profileRoles.addFeatured(db, viewer, { userId, categoryId })
    : cu.addRole(db, viewer, { userId, categoryId, role })
  if (status !== 'ok') return fail(res, status)
  save()
  console.log(`  @${userById(record.userId).username} is now ${record.role} of category ${record.categoryId}`)
  return res.status(201).json({
    categoryUsers: cu.restCategoryUser(record),
    linked: { users: [flatUser(userById(record.userId), viewer)] },
  })
})

router.delete('/api/v2/category_users/:id', (req, res) => {
  const viewer = viewerId(req)
  if (!viewer) return res.status(401).json({ error: 'unauthorized' })
  const status = profileRoles.parseFeaturedId(req.params.id)
    ? profileRoles.removeFeatured(db, viewer, req.params.id)
    : cu.removeRole(db, viewer, req.params.id)
  if (status !== 'ok') return fail(res, status)
  save()
  return res.status(204).end()
})

// GraphQL `category(slug)`: the category with its `categoryUsers(roles)`
const resolvers = {
  category: (v, viewer) => {
    const { categories } = require('../content')
    const category = categories.find(c => c.slug === v.slug) || categories[0]
    const categoryUsers = cu.rolesIn(db, category.id, v.roles)
      .filter(r => userById(r.userId))
      .map(r => cu.gqlCategoryUser(r, gqlAuthor(userById(r.userId), viewer)))
    return { category: { ...category, categoryUsers } }
  },
}

module.exports = { router, resolvers }
