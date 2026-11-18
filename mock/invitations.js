/* eslint-disable */
// Invitations: who invited whom, with the codes behind /join/:code. Pure logic over the db.
//   db.invitations = [{ id, inviterId, email, code, createdAt, acceptedAt, acceptedById }]
const crypto = require('crypto')

const EMAIL = /^[^\s@,]+@[^\s@,]+\.[a-z]{2,}$/i
const lower = value => String(value).toLowerCase()

// [inviter, email, accepted by (username) or null, code]
const SEEDS = [
  ['ada', 'grace@example.com', 'grace', 'k3Mq9ZtW2x'],
  ['ada', 'mara@example.com', 'mara', 'p7Vd4NsB8c'],
  ['ada', 'sam.rivera@example.com', null, 'welcome1ad'],
  ['ada', 'priya.nair@example.com', null, 'h5Tz2LqY6e'],
  ['ada', 'lee@example.com', null, 'r8Gc1KfX3j'],
  ['jules', 'collab@example.com', null, 'j2Ub7WpA9d'],
]

const newCode = () => crypto.randomBytes(8).toString('base64url').replace(/[-_]/g, 'x').slice(0, 10)

const seedInvitations = (db, nextId, now = Date.parse('2026-11-10T10:00:00Z')) => {
  if (db.invitations) return 0
  db.invitations = []
  SEEDS.forEach(([inviter, email, acceptedBy, code], i) => {
    const inviterUser = db.users.find(u => u.username === inviter)
    const accepted = acceptedBy && db.users.find(u => u.username === acceptedBy)
    if (!inviterUser) return
    const createdAt = new Date(now - (SEEDS.length - i) * 2 * 86400000).toISOString()
    db.invitations.push({
      id: nextId(), inviterId: inviterUser.id, email, code, createdAt,
      acceptedAt: accepted ? new Date(Date.parse(createdAt) + 86400000).toISOString() : null,
      acceptedById: accepted ? accepted.id : null,
    })
  })
  return db.invitations.length
}

const invitationsOf = (db, inviterId) =>
  (db.invitations || []).filter(i => i.inviterId === inviterId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

const byCode = (db, code) => (db.invitations || []).find(i => i.code === code)

// Split a request's `email` (array or comma/space separated string) into unique valid addresses
const parseEmails = (input) => {
  const list = Array.isArray(input) ? input : String(input || '').split(/[,\s]+/)
  const seen = new Set()
  return list.map(e => String(e).trim()).filter((e) => {
    if (!EMAIL.test(e) || seen.has(lower(e))) return false
    seen.add(lower(e))
    return true
  })
}

// Invite addresses. An address the viewer already invited and who has not joined is re-sent: same code, fresh date.
// Returns the invitations that were created or re-sent.
const invite = (db, nextId, inviterId, input, now = new Date()) => {
  db.invitations = db.invitations || []
  return parseEmails(input).flatMap((email) => {
    if (db.users.some(u => lower(u.email) === lower(email))) return []
    const existing = db.invitations.find(i => i.inviterId === inviterId && lower(i.email) === lower(email))
    if (existing && existing.acceptedAt) return []
    if (existing) {
      existing.createdAt = now.toISOString()
      return [existing]
    }
    const created = { id: nextId(), inviterId, email, code: newCode(), createdAt: now.toISOString(), acceptedAt: null, acceptedById: null }
    db.invitations.push(created)
    return [created]
  })
}

// Only the inviter can revoke, and only before it is accepted
const revoke = (db, inviterId, id) => {
  const index = (db.invitations || []).findIndex(i => i.id === String(id) && i.inviterId === inviterId && !i.acceptedAt)
  if (index === -1) return false
  db.invitations.splice(index, 1)
  return true
}

const accept = (db, invitation, userId, now = new Date()) => {
  invitation.acceptedAt = now.toISOString()
  invitation.acceptedById = userId
}

module.exports = { seedInvitations, invitationsOf, byCode, parseEmails, invite, revoke, accept, SEEDS }
