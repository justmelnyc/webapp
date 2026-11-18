/* eslint-disable */
const express = require('express')
const { db, userById } = require('../db')
const { hasPassword, verifyPassword } = require('../passwords')
const { onboardingVersion } = require('../onboarding')

const router = express.Router()
const FAR_FUTURE = 4102444800

const b64 = obj => Buffer.from(JSON.stringify(obj)).toString('base64')
  .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

const jwt = data => `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ data, exp: FAR_FUTURE })}.sig`

// The viewer is whoever the bearer token (a JWT from /oauth/token) says it is
const viewerId = (req) => {
  const token = (req.get('Authorization') || '').replace(/^Bearer /i, '')
  const part = token.split('.')[1]
  if (!part) return null
  try {
    const { data } = JSON.parse(Buffer.from(part, 'base64').toString('utf8'))
    return data && userById(data.id) ? data.id : null
  } catch (e) { return null }
}

const viewer = req => userById(viewerId(req))

const tokenBody = (user) => ({
  access_token: user
    ? jwt({
      id: user.id, username: user.username, email: user.email, is_staff: false,
      web_onboarding_version: onboardingVersion(user), allows_analytics: false, analytics_id: `mock-${user.id}`,
      created_at: '2018-01-01T00:00:00Z',
    })
    : 'public-token',
  token_type: 'bearer',
  expires_in: 315360000,
  created_at: Math.floor(Date.now() / 1000),
  refresh_token: user ? `rt-${user.id}` : 'public-refresh',
})

router.get('/api/webapp-token', (req, res) => res.json({ token: tokenBody(null) }))

// Log in as any seeded user: email or username, any password
router.post('/api/oauth/token', (req, res) => {
  const { grant_type: grant, email, password, refresh_token: refresh } = req.body || {}
  const user = grant === 'refresh_token'
    ? userById(String(refresh || '').replace('rt-', ''))
    : db.users.find(u => u.email === email || u.username === email)
  // a user who set a password through /settings must use it; seeded users still take any 8+ characters
  if (user && grant !== 'refresh_token' && hasPassword(user) && !verifyPassword(user, password)) {
    return res.status(401).json({ error: 'invalid_grant', error_description: 'Wrong password' })
  }
  if (!user) return res.status(401).json({ error: 'invalid_grant', error_description: 'Unknown user' })
  return res.json(tokenBody(user))
})

router.delete('/api/oauth/logout', (req, res) => res.json({}))

module.exports = { router, viewerId, viewer, tokenBody }
