/* eslint-disable */
// Read-only v2 REST endpoints
const express = require('express')
const { db, userByName } = require('../db')
const { flatUser, gqlUser } = require('../serialize')
const { TOGGLES } = require('../settings')
const { onboardingVersion } = require('../onboarding')
const { viewer, viewerId } = require('./auth')

const router = express.Router()

const page = (res, body) => res.set({ 'X-Total-Pages': '1', 'X-Total-Pages-Remaining': '0', 'X-TotalCount': '0' }).json(body)

router.get('/api/v2/badges.json', (req, res) => res.json({ badges: [] }))
router.get('/api/v2/most_recent_announcements', (req, res) => res.status(204).end())
router.head('/api/v2/notifications', (req, res) => res.status(204).end())
router.get('/api/v2/notifications', (req, res) => page(res, { activities: [] }))
router.get('/api/v2/posts/:id/related', (req, res) => page(res, { posts: [] }))

router.get('/api/v2/profile', (req, res) => {
  const me = viewer(req)
  if (!me) return res.status(401).json({ error: 'unauthorized' })
  return res.json({ users: { ...flatUser(me, me.id), relationshipPriority: 'self', webOnboardingVersion: onboardingVersion(me), creatorTypeCategoryIds: me.creatorTypeCategoryIds || [], hasAvatarPresent: !!me.avatarUrl, hasCoverImagePresent: !!me.coverUrl, ...require('../category-users').profileFields(db, me), ...require('../staff').profileFields(me), ...require('../moderation').blockCounts(db, me.id) }, linked: { categories: [] } })
})

router.get('/api/v2/profile/settings', (req, res) => page(res, { settings: TOGGLES }))

// followers / following lists
router.get('/api/v2/users/:name/:resource', (req, res) => {
  const user = userByName(req.params.name)
  const me = viewerId(req)
  if (!user) return res.status(404).json({ error: 'not found' })
  let ids = []
  if (req.params.resource === 'followers') ids = db.follows.filter(f => f.followeeId === user.id).map(f => f.followerId)
  if (req.params.resource === 'following') ids = db.follows.filter(f => f.followerId === user.id).map(f => f.followeeId)
  return page(res, { users: db.users.filter(u => ids.includes(u.id)).map(u => flatUser(u, me)) })
})

router.get('/api/v2/users/autocomplete', (req, res) => {
  const q = String(req.query.terms || '').toLowerCase()
  res.json({ autocompleteResults: db.users.filter(u => u.username.startsWith(q)).slice(0, 10).map(u => ({ username: u.username, name: u.name })) })
})

module.exports = { router }
