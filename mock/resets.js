/* eslint-disable */
// Password reset tokens for the mock (stored in db.resetTokens so they survive a restart). Pure: takes the db.
const crypto = require('crypto')
const { hashPassword, isAcceptablePassword } = require('./passwords')

const TTL_MS = 60 * 60 * 1000

const same = (a, b) => String(a).toLowerCase() === String(b).toLowerCase()

// A new token for the user with this email, or null (the API answers the same either way).
const createReset = (db, email, now = Date.now()) => {
  const user = db.users.find(u => same(u.email, email))
  if (!user) return null
  db.resetTokens = (db.resetTokens || []).filter(t => t.userId !== user.id && t.expiresAt > now)
  const reset = { token: crypto.randomBytes(16).toString('hex'), userId: user.id, email: user.email, createdAt: now, expiresAt: now + TTL_MS }
  db.resetTokens.push(reset)
  return reset
}

// Set the password with a token: 'ok', 'expired' (unknown, used or too old) or 'invalid' (password rules).
const consumeReset = (db, token, password, now = Date.now()) => {
  const reset = (db.resetTokens || []).find(t => t.token === token)
  if (!reset || reset.expiresAt <= now) return { status: 'expired' }
  if (!isAcceptablePassword(password)) return { status: 'invalid' }
  const user = db.users.find(u => u.id === reset.userId)
  if (!user) return { status: 'expired' }
  user.passwordHash = hashPassword(password)
  db.resetTokens = db.resetTokens.filter(t => t.token !== token)
  return { status: 'ok', user }
}

module.exports = { createReset, consumeReset, TTL_MS }
