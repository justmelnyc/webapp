/* eslint-disable */
// Static-ish endpoints: generated SVG placeholders (offline mode) and the emoji list
const express = require('express')
const media = require('../media')

const router = express.Router()

router.get('/img/:size/:label.svg', (req, res) => {
  const [w, h] = req.params.size.split('x').map(n => Math.min(Number(n) || 100, 4000))
  const label = req.params.label.replace(/[<>&"]/g, '')
  res.type('image/svg+xml').send(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#222"/>` +
    `<text x="50%" y="50%" fill="#888" font-family="sans-serif" font-size="${Math.max(12, Math.min(w, h) / 8)}" text-anchor="middle">${label}</text></svg>`,
  )
})

router.get('/emojis.json', (req, res) => res.json({
  emojis: ['smile', 'tada', 'heart', 'fire', 'eyes', 'rocket', 'sparkles', 'wave'].map(name => ({
    name, image_url: media.placeholder(32, 32, name),
  })),
}))

module.exports = { router }
