/* eslint-disable */
// GET /api/v2/posts/:id/related?per_page=   (`:id` is an id or `~token`): the related posts under a post's page.
// One page, v2 envelope. The original reads the posts from it; the rewrite reads the tokens and asks `findPosts`.
const express = require('express')
const { db, postByRef } = require('../db')
const { flatPost, flatUser, postRegions } = require('../serialize')
const moderation = require('../moderation')
const { relatedPosts, perPageOf } = require('../related-posts')
const { viewerId } = require('./auth')

const router = express.Router()

router.get('/api/v2/posts/:id/related', (req, res) => {
  const post = postByRef(req.params.id)
  if (!post) return res.status(404).json({ error: 'not found' })
  const viewer = viewerId(req)
  const items = moderation.visiblePosts(db, viewer, relatedPosts(db, post)).slice(0, perPageOf(req.query.per_page))
  const authors = [...new Set(items.map(p => p.authorId))].map(id => flatUser(db.users.find(u => u.id === id), viewer))
  // a single page: the original shows no way to ask for more
  return res
    .set({ 'X-TotalCount': String(items.length), 'X-Total-Pages': '1', 'X-Total-Pages-Remaining': '0' })
    .json({ posts: items.map(p => flatPost(p, viewer)), linked: { users: authors, assets: items.flatMap(p => postRegions(p).assets) } })
})

module.exports = { router }
