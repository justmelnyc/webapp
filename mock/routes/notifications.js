/* eslint-disable */
// REST side of notifications: the legacy HEAD check, mark-as-read, and a dev helper to fake activity.
const express = require('express')
const notifications = require('../notifications')
const { viewerId } = require('./auth')

const router = express.Router()

// HEAD /api/v2/notifications: 204 when there is something new, 304 otherwise (legacy contract)
router.head('/api/v2/notifications', (req, res) => res.sendStatus(notifications.newContent(viewerId(req)) ? 204 : 304))

// GET /api/v2/notifications?category=: the original app's feed (also marks everything as seen)
router.get('/api/v2/notifications', (req, res) => {
  const me = viewerId(req)
  if (!me) return res.status(401).json({ error: 'unauthorized' })
  const body = notifications.activities(me, req.query.category)
  notifications.markRead(me)
  return res.set({ 'X-Total-Pages': '1', 'X-Total-Pages-Remaining': '0', 'X-TotalCount': String(body.activities.length) }).json(body)
})

// POST /api/v2/notifications/read: mark everything as seen
router.post('/api/v2/notifications/read', (req, res) => {
  if (!viewerId(req)) return res.sendStatus(401)
  notifications.markRead(viewerId(req))
  return res.sendStatus(204)
})

// POST /mock/notifications/simulate: somebody loves the viewer's newest post (the unread dot lights up)
router.post('/mock/notifications/simulate', (req, res) => {
  if (!viewerId(req)) return res.sendStatus(401)
  return res.json(notifications.simulate(viewerId(req)) || {})
})

module.exports = { router }
