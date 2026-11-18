/* eslint-disable */
const express = require('express')
const newPosts = require('../new-posts')
const { viewerId } = require('./auth')

const router = express.Router()

// POST /mock/simulate-new-posts?count=2 (bearer token): people the viewer follows post just now.
// Reopen a stream (leave and come back) and the navbar shows "New Posts".
router.post('/mock/simulate-new-posts', (req, res) => {
  const count = req.query.count || (req.body && req.body.count)
  return res.json({ created: newPosts.simulate(viewerId(req), count) })
})

module.exports = { router }
