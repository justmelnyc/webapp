/* eslint-disable */
// Invitations and signup: list/send/re-send/revoke what the viewer invited, look up a code, create an account
const express = require('express')
const { db, save, nextId, userById } = require('../db')
const { flatUser } = require('../serialize')
const { usernameAvailable, emailAvailable } = require('../credentials')
const { hashPassword, isAcceptablePassword } = require('../passwords')
const invitations = require('../invitations')
const { viewer, tokenBody } = require('./auth')

const router = express.Router()

const requireViewer = (req, res, next) => {
  req.me = viewer(req)
  return req.me ? next() : res.status(401).json({ error: 'unauthorized' })
}

const flatInvitation = (i) => {
  const out = { id: i.id, email: i.email, code: i.code, createdAt: i.createdAt, acceptedAt: i.acceptedAt }
  if (i.acceptedById) out.links = { acceptedBy: { id: i.acceptedById, type: 'users' } }
  return out
}

const envelope = (me, list) => ({
  invitations: list.map(flatInvitation),
  linked: { users: list.filter(i => i.acceptedById).map(i => flatUser(userById(i.acceptedById), me.id)) },
})

const sendList = (res, me) => {
  const list = invitations.invitationsOf(db, me.id)
  res.set({ 'X-Total-Pages': '1', 'X-Total-Pages-Remaining': '0', 'X-TotalCount': String(list.length) }).json(envelope(me, list))
}

router.get('/api/v2/invitations', requireViewer, (req, res) => sendList(res, req.me))

router.post('/api/v2/invitations', requireViewer, (req, res) => {
  const sent = invitations.invite(db, nextId, req.me.id, (req.body || {}).email)
  save()
  console.log(`  invited ${sent.map(i => `${i.email} (${i.code})`).join(', ') || 'nobody'}`)
  res.json(envelope(req.me, sent))
})

router.post('/api/v2/invitations/:id/resend', requireViewer, (req, res) => {
  const found = invitations.invitationsOf(db, req.me.id).find(i => i.id === req.params.id && !i.acceptedAt)
  if (!found) return res.status(404).json({ error: 'not found' })
  invitations.invite(db, nextId, req.me.id, [found.email])
  save()
  return res.json(envelope(req.me, [found]))
})

router.delete('/api/v2/invitations/:id', requireViewer, (req, res) => {
  if (!invitations.revoke(db, req.me.id, req.params.id)) return res.status(404).json({ error: 'not found' })
  save()
  return res.status(204).end()
})

// The email an invitation code was sent to (public: it is how /join/:code prefills the form)
router.get('/api/v2/invitations/:code', (req, res) => {
  const found = invitations.byCode(db, req.params.code)
  if (!found || found.acceptedAt) return res.status(404).json({ error: 'not found' })
  return res.json({ invitations: { email: found.email } })
})

router.post('/api/v2/signup', (req, res) => {
  const { email, username, password, invitation_code: code } = req.body || {}
  const attrs = {}
  if (!emailAvailable(db, email)) attrs.email = 'is invalid or has already been taken'
  if (!usernameAvailable(db, username)) attrs.username = 'is invalid or has already been taken'
  if (!isAcceptablePassword(password)) attrs.password = 'must be between 8 and 128 characters'
  const invitation = code ? invitations.byCode(db, code) : null
  if (code && (!invitation || invitation.acceptedAt)) attrs.invitation_code = 'is not valid'
  if (Object.keys(attrs).length) return res.status(422).json({ errors: { attrs } })
  const user = {
    id: nextId(), username, name: '', bio: '', location: '', email, links: [], hasCover: false,
    passwordHash: hashPassword(password),
  }
  db.users.push(user)
  const matching = invitation || (db.invitations || []).find(i => !i.acceptedAt && i.email.toLowerCase() === String(email).toLowerCase())
  if (matching) invitations.accept(db, matching, user.id)
  save()
  console.log(`  signed up @${username}`)
  return res.status(201).json(tokenBody(user))
})

module.exports = { router }
