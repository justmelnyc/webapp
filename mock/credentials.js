/* eslint-disable */
// Username / email availability and the credential rules PATCH /api/v2/profile enforces. Pure: takes the db.
const { verifyPassword, isAcceptablePassword } = require('./passwords')

const RESERVED = ['admin', 'ello', 'root', 'settings', 'support', 'staff', 'discover', 'enter', 'join', 'search', 'following']
const USERNAME = /^[a-zA-Z0-9\-_]+$/
const EMAIL = /(.+)@(.+)\.([a-z]{2,})/i

const same = (a, b) => String(a).toLowerCase() === String(b).toLowerCase()

const usernameAvailable = (db, username, selfId) => (
  typeof username === 'string' && USERNAME.test(username) && username.length <= 50
  && !RESERVED.includes(username.toLowerCase())
  && !db.users.some(u => u.id !== selfId && same(u.username, username))
)

const emailAvailable = (db, email, selfId) => (
  typeof email === 'string' && EMAIL.test(email) && !db.users.some(u => u.id !== selfId && same(u.email, email))
)

// Up to three free alternatives, like the API's `suggestions.username`
const suggestUsernames = (db, username, selfId) => {
  const base = String(username).replace(/[^a-zA-Z0-9\-_]/g, '').slice(0, 44) || 'user'
  const out = []
  for (let n = 1; out.length < 3 && n < 200; n += 1) {
    const candidate = `${base}${n}`
    if (usernameAvailable(db, candidate, selfId)) out.push(candidate)
  }
  return out
}

// Body of POST /api/v2/availability: { username } or { email } -> { availability }
const availability = (db, body, selfId) => {
  const out = { suggestions: {} }
  if ('username' in body) {
    out.username = usernameAvailable(db, body.username, selfId)
    if (!out.username) out.suggestions.username = suggestUsernames(db, body.username, selfId)
  }
  if ('email' in body) {
    out.email = emailAvailable(db, body.email, selfId)
    out.suggestions.email = { full: null }
  }
  return { availability: out }
}

const taken = 'has already been taken'

// The 422 `attrs` for a profile PATCH, or null when it is fine. Credentials are username, email and password:
// changing any of them needs the current password.
const credentialErrors = (db, me, body) => {
  const attrs = {}
  const wantsUsername = typeof body.username === 'string' && body.username !== '' && body.username !== me.username
  const wantsEmail = typeof body.email === 'string' && body.email !== '' && body.email !== me.email
  const wantsPassword = typeof body.password === 'string' && body.password !== ''
  if (!wantsUsername && !wantsEmail && !wantsPassword) return null
  if (!verifyPassword(me, body.current_password)) attrs.current_password = 'is incorrect'
  if (wantsUsername && !usernameAvailable(db, body.username, me.id)) attrs.username = taken
  if (wantsEmail && !emailAvailable(db, body.email, me.id)) attrs.email = taken
  if (wantsPassword && !isAcceptablePassword(body.password)) attrs.password = 'must be between 8 and 128 characters'
  return Object.keys(attrs).length ? attrs : null
}

module.exports = { availability, credentialErrors, usernameAvailable, emailAvailable, suggestUsernames }
