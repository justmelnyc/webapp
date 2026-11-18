/* eslint-disable */
// Repost endpoints. Mounted before `mutations` so a POST /api/v2/posts carrying `repost_id`
// (the original's createPost(repostId)) is handled here; everything else falls through.
const express = require('express')
const { postByRef } = require('../db')
const { postEnvelope } = require('../serialize')
const reposts = require('../reposts')
const { viewer } = require('./auth')

const router = express.Router()

const toRegions = (body = []) => body
  .filter(b => b && b.kind === 'text' && String(b.data || '').replace(/<[^>]*>/g, '').trim())
  .map(b => ({ kind: 'text', data: b.data }))

router.post('/api/v2/posts', (req, res, next) => {
  const sourceRef = req.query.repost_id || req.body.repost_id
  if (!sourceRef) return next()
  const me = viewer(req)
  if (!me) return res.status(401).json({ error: 'unauthorized' })
  const source = postByRef(sourceRef)
  if (!source) return res.status(404).json({ error: 'not found' })
  const post = reposts.createRepost(source, me.id, toRegions(req.body.body))
  if (!post) return res.status(422).json({ error: { message: 'You can not repost this post' } })
  console.log(`  post ${post.id}: @${me.username} reposted ${source.id}`)
  return res.status(201).json(postEnvelope(post, me.id))
})

// Undo the viewer's repost of a post
router.delete('/api/v2/posts/:id/repost', (req, res) => {
  const me = viewer(req)
  if (!me) return res.status(401).json({ error: 'unauthorized' })
  const source = postByRef(req.params.id)
  if (!source || !reposts.removeRepost(source.id, me.id)) return res.status(404).json({ error: 'not found' })
  return res.status(204).end()
})

module.exports = { router }
