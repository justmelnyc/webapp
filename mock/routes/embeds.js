/* eslint-disable */
// POST /api/v2/post_previews: resolve a pasted link into an embed block (what the editor asks on paste).
// GET  /api/v2/oembed?url=: the oEmbed-style document behind it.
const express = require('express')
const embeds = require('../embeds')

const router = express.Router()

router.post('/api/v2/post_previews', (req, res) => {
  const blocks = (req.body && req.body.body) || []
  const body = blocks
    .filter(b => b && b.kind === 'embed' && b.data)
    .map(b => embeds.resolve(b.data.url))
    .filter(Boolean)
    .map(doc => ({ kind: 'embed', data: doc.region }))
  if (!body.length) return res.status(422).json({ error: { message: 'That link can not be embedded' } })
  return res.json({ postPreviews: { body } })
})

router.get('/api/v2/oembed', (req, res) => {
  const doc = embeds.resolve(req.query.url)
  if (!doc) return res.status(404).json({ error: 'not found' })
  const { region, ...oembed } = doc
  return res.json(oembed)
})

module.exports = { router }
