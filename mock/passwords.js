/* eslint-disable */
// Salted scrypt password hashes for the mock. Seeded users have no hash: they accept any 8+ character
// password (as the mock always has) until one is set through /settings.
const crypto = require('crypto')

const KEYLEN = 32
const MIN = 8
const MAX = 128

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) =>
  `scrypt$${salt}$${crypto.scryptSync(String(password), salt, KEYLEN).toString('hex')}`

const hasPassword = user => !!(user && user.passwordHash)

const isAcceptablePassword = password => typeof password === 'string' && password.length >= MIN && password.length <= MAX

const verifyPassword = (user, password) => {
  if (!hasPassword(user)) return isAcceptablePassword(password)
  const [scheme, salt, hash] = user.passwordHash.split('$')
  if (scheme !== 'scrypt' || !salt || !hash || typeof password !== 'string') return false
  const expected = Buffer.from(hash, 'hex')
  const actual = crypto.scryptSync(password, salt, KEYLEN)
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
}

module.exports = { hashPassword, verifyPassword, hasPassword, isAcceptablePassword, MIN, MAX }
