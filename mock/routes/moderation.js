/* eslint-disable */
// Block / mute, flags, collab + hire messages. Mounted before `mutations` so it can intercept relationships.
const express = require('express')
const { db, save, postByRef, userById, userByName } = require('../db')
const { flatUser } = require('../serialize')
const mod = require('../moderation')
const { viewer } = require('./auth')

mod.ensureModerationData(db)
save()

const router = express.Router()

const requireViewer = (req, res, next) => {
  req.me = viewer(req)
  if (!req.me) return res.status(401).json({ error: 'unauthorized' })
  return next()
}
const target = id => userById(id) || userByName(id)
const page = (res, body) => res.set({ 'X-Total-Pages': '1', 'X-Total-Pages-Remaining': '0', 'X-TotalCount': '0' }).json(body)

router.post('/api/v2/users/:id/add/:priority', requireViewer, (req, res, next) => {
  const user = target(req.params.id)
  if (!user) return res.status(404).json({ error: 'not found' })
  const { priority } = req.params
  const set = mod.setBlock(db, req.me.id, user.id, priority)
  save()
  if (!set) return next()
  return res.json({
    relationship: { id: `${req.me.id}-${user.id}`, priority },
    owner: flatUser(req.me, req.me.id),
    subject: flatUser(user, req.me.id),
  })
})

;['blocked', 'muted'].forEach((name) => {
  router.get(`/api/v2/profile/${name}`, requireViewer, (req, res) => (
    page(res, { users: mod.blockedUsers(db, req.me.id, name === 'blocked' ? 'block' : 'mute').map(u => flatUser(u, req.me.id)) })
  ))
})

// --- flags ---
const flag = (type, find) => (req, res) => {
  const { kind } = req.params
  if (!mod.isFlagKind(kind)) return res.status(422).json({ error: { message: `Unknown flag kind: ${kind}` } })
  const subject = find(req)
  if (!subject) return res.status(404).json({ error: 'not found' })
  db.flags.push({ viewerId: req.me.id, type, targetId: subject.id, kind, createdAt: new Date().toISOString() })
  save()
  return res.status(200).json({})
}
router.post('/api/v2/posts/:id/flag/:kind', requireViewer, flag('post', req => postByRef(req.params.id)))
router.post('/api/v2/users/:id/flag/:kind', requireViewer, flag('user', req => target(req.params.id)))
router.post('/api/v2/posts/:id/comments/:cid/flag/:kind', requireViewer, flag('comment', req => db.comments.find(c => c.id === req.params.cid)))

// --- collab / hire messages ---
const message = kind => (req, res) => {
  const user = target(req.params.id)
  if (!user) return res.status(404).json({ error: 'not found' })
  db.messages.push({ fromId: req.me.id, toId: user.id, kind, message: String((req.body || {}).message || ''), createdAt: new Date().toISOString() })
  save()
  return res.status(200).json({})
}
router.post('/api/v2/users/:id/collaborate', requireViewer, message('collaborate'))
router.post('/api/v2/users/:id/hire_me', requireViewer, message('hire'))

module.exports = { router }
