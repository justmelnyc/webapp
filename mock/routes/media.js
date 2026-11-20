/* eslint-disable */
// Static-ish endpoints: generated SVG placeholders (offline mode) and the emoji list
const zlib = require('zlib')
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

// The avatar of accounts that never uploaded one (users with `noAvatar`)
router.get('/img/default-avatar.svg', (req, res) => {
  res.type('image/svg+xml').send(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect width="240" height="240" fill="#e5e5e5"/>' +
    '<circle cx="120" cy="120" r="78" fill="#aaa"/><path d="M82 134a40 40 0 0 0 76 0" fill="none" stroke="#e5e5e5" stroke-width="12" stroke-linecap="round"/></svg>',
  )
})

// The app loads emoji images from ${AUTH_DOMAIN}/images/emoji/<name>.png; serve a small PNG
const crc = (buf) => {
  let c = ~0
  for (const b of buf) { c ^= b; for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1)) }
  return ~c >>> 0
}
const chunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type), data])
  const out = Buffer.alloc(body.length + 8)
  out.writeUInt32BE(data.length, 0); body.copy(out, 4); out.writeUInt32BE(crc(body), body.length + 4)
  return out
}
const emojiPng = (() => {
  const size = 32
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const o = y * (size * 4 + 1) + 1 + x * 4
      const inside = (x - 16) ** 2 + (y - 16) ** 2 < 14 * 14
      raw[o] = 255; raw[o + 1] = 200; raw[o + 2] = 40; raw[o + 3] = inside ? 255 : 0
    }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
})()
router.get('/images/emoji/:name.png', (req, res) => res.type('image/png').send(emojiPng))

router.get('/emojis.json', (req, res) => res.json({
  emojis: ['smile', 'tada', 'heart', 'fire', 'eyes', 'rocket', 'sparkles', 'wave'].map(name => ({
    name, image_url: `${media.HOST}/images/emoji/${name}.png`,
  })),
}))

module.exports = { router }
