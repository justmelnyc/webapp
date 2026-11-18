/* eslint-disable */
// REST people search (the original app reads GET /api/v2/users?terms=; the rewrite reads GraphQL searchUsers).
const express = require('express')
const { db } = require('../db')
const { flatUser } = require('../serialize')
const { viewerId } = require('./auth')

const router = express.Router()

const matchUsers = (terms) => {
  const q = String(terms || '').trim().toLowerCase()
  return q ? db.users.filter(u => u.username.includes(q) || u.name.toLowerCase().includes(q)).slice(0, 10) : []
}

router.get('/api/v2/users', (req, res) => {
  const me = viewerId(req)
  const users = matchUsers(decodeURIComponent(String(req.query.terms || ''))).map(u => flatUser(u, me))
  res.set({ 'X-Total-Pages': '1', 'X-Total-Pages-Remaining': '0', 'X-TotalCount': String(users.length) }).json({ users })
})

module.exports = { router, matchUsers }
