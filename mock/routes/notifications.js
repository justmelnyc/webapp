/* eslint-disable */
// REST side of notifications: the legacy HEAD check, mark-as-read, and a dev helper to fake activity.
const express = require('express')
const notifications = require('../notifications')
const announcements = require('../announcements')
const { viewerId } = require('./auth')

const router = express.Router()

// HEAD /api/v2/notifications: 204 when there is something new, 304 otherwise (legacy contract)
router.head('/api/v2/notifications', (req, res) => res.sendStatus(notifications.newContent(viewerId(req)) ? 204 : 304))

// GET /api/v2/notifications?category=: the original app's feed (also marks everything as seen)
router.get('/api/v2/notifications', (req, res) => {
  const me = viewerId(req)
  if (!me) return res.status(401).json({ error: 'unauthorized' })
  const page = parseInt(req.query.page, 10) || 1
  const { body, page: current, totalPages, totalCount } = notifications.activities(me, req.query.category, page, parseInt(req.query.per_page, 10) || undefined)
  if (current === 1) notifications.markRead(me)
  const headers = { 'X-Total-Pages': String(totalPages), 'X-Total-Pages-Remaining': String(totalPages - current), 'X-TotalCount': String(totalCount) }
  if (current < totalPages) {
    const next = new URLSearchParams({ ...req.query, page: String(current + 1) })
    headers.Link = `<${req.protocol}://${req.get('host')}${req.path}?${next}>; rel="next"`
  }
  return res.set(headers).json(body)
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

// GET /api/v2/most_recent_announcements: the newest announcement the viewer has not dismissed (204 when none)
router.get('/api/v2/most_recent_announcements', (req, res) => {
  const me = viewerId(req)
  const latest = me && announcements.unread(me)
  return latest ? res.json({ announcements: announcements.serialize(latest) }) : res.sendStatus(204)
})

// PATCH .../mark_last_read_announcement: the viewer closed the banner
router.patch('/api/v2/most_recent_announcements/mark_last_read_announcement', (req, res) => {
  if (!viewerId(req)) return res.sendStatus(401)
  announcements.markRead(viewerId(req))
  return res.sendStatus(204)
})

// POST /mock/announcements/simulate: publish a new announcement for everyone (body: header, body, ctaCaption, ctaHref, imageUrl)
router.post('/mock/announcements/simulate', (req, res) => {
  const { header = 'A new announcement', body = 'Published through /mock/announcements/simulate.', ...rest } = req.body || {}
  return res.json(announcements.serialize(announcements.create({ header, body, ...rest })))
})

module.exports = { router }
