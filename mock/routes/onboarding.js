/* eslint-disable */
// Onboarding and password reset endpoints: followed categories, forgot / reset password, the reset link helper.
const express = require('express')
const { db, save } = require('../db')
const { followCategories } = require('../onboarding')
const { createReset, consumeReset } = require('../resets')
const { viewer } = require('./auth')

const router = express.Router()
const APP_ORIGIN = process.env.MOCK_APP_ORIGIN || 'http://localhost:6660'
let lastReset = null

router.put('/api/v2/profile/followed_categories', (req, res) => {
  const me = viewer(req)
  if (!me) return res.status(401).json({ error: 'unauthorized' })
  const { followedCategoryIds, followed } = followCategories(db, me, req.body)
  save()
  console.log(`  @${me.username} follows categories [${followedCategoryIds}] and ${followed.length} people`)
  return res.json({ followedCategoryIds })
})

// Always 200, like the real API, so nobody can probe which emails exist
router.post('/api/v2/forgot-password', (req, res) => {
  const reset = createReset(db, (req.body || {}).email)
  if (reset) {
    save()
    const link = `${APP_ORIGIN}/auth/reset-my-password?reset_password_token=${reset.token}`
    lastReset = { email: reset.email, token: reset.token, link, createdAt: new Date(reset.createdAt).toISOString() }
    console.log(`  password reset link for ${reset.email}: ${link}`)
  }
  res.json({})
})

router.put('/api/v2/reset_password', (req, res) => {
  const { password, reset_password_token: token } = req.body || {}
  const { status, user } = consumeReset(db, token, password)
  if (status === 'expired') return res.status(404).json({ error: { message: 'Reset password token is invalid or has expired' } })
  if (status === 'invalid') return res.status(422).json({ errors: { attrs: { password: 'must be between 8 and 128 characters' } } })
  save()
  console.log(`  password reset for @${user.username}`)
  return res.json({ username: user.username })
})

router.get('/mock/last-reset-link', (req, res) => (
  lastReset ? res.json(lastReset) : res.status(404).json({ error: 'no reset link has been requested yet' })
))

module.exports = { router }
