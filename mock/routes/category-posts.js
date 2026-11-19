/* eslint-disable */
// Curators feature and unfeature a post in a category (the `actions` of a categoryPost)
const express = require('express')
const { db, save, postById, userById } = require('../db')
const cp = require('../category-posts')
const { viewerId } = require('./auth')

const router = express.Router()

router.put('/api/v2/category_posts/:id/:action', (req, res) => {
  const ids = cp.parseId(req.params.id)
  const post = ids && postById(ids.postId)
  const viewer = viewerId(req)
  if (!post || !(post.categoryIds || []).includes(ids.categoryId)) return res.status(404).json({ error: 'not found' })
  if (!cp.canCurate(db, viewer, ids.categoryId)) return res.status(403).json({ error: 'forbidden' })
  const next = cp.applyAction(db, post, ids.categoryId, req.params.action, viewer)
  if (!next) return res.status(422).json({ error: 'invalid action' })
  save()
  const name = uid => (uid ? (userById(uid) || {}).username : null)
  return res.json({
    categoryPosts: {
      id: req.params.id,
      status: next.status,
      submittedByUsername: name(next.submittedById),
      featuredByUsername: name(next.featuredById),
      actions: cp.actionsFor(db, req.params.id, next.status, viewer, ids.categoryId),
    },
  })
})

module.exports = { router }
