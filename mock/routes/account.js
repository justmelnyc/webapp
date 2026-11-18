/* eslint-disable */
// Account endpoints: availability checks, data export (+ download) and account deletion
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const express = require('express')
const { db, save } = require('../db')
const { availability } = require('../credentials')
const { exportFor, removeUser } = require('../export')
const { viewer } = require('./auth')

const router = express.Router()
const EXPORTS = path.join(__dirname, '..', '.data', 'exports')
fs.mkdirSync(EXPORTS, { recursive: true })

const requireViewer = (req, res, next) => {
  req.me = viewer(req)
  return req.me ? next() : res.status(401).json({ error: 'unauthorized' })
}

// Signed-out visitors check usernames too (the join form), so this one is open
router.post('/api/v2/availability', (req, res) => {
  const me = viewer(req)
  res.json(availability(db, req.body || {}, me && me.id))
})

router.post('/api/v2/profile/export', requireViewer, (req, res) => {
  const name = `ello-export-${req.me.username}-${crypto.randomBytes(8).toString('hex')}.json`
  fs.writeFileSync(path.join(EXPORTS, name), JSON.stringify(exportFor(db, req.me), null, 2))
  res.json({ exportUrl: `${req.protocol}://${req.get('host')}/exports/${name}` })
})

// The unguessable file name is the credential, like the emailed link of the real service
router.get('/exports/:name', (req, res) => {
  const name = path.basename(req.params.name)
  const file = path.join(EXPORTS, name)
  if (!/^ello-export-[\w-]+\.json$/.test(name) || !fs.existsSync(file)) return res.status(404).json({ error: 'not found' })
  return res.download(file, name)
})

router.delete('/api/v2/profile', requireViewer, (req, res) => {
  removeUser(db, req.me)
  save()
  console.log(`  account @${req.me.username} deleted`)
  res.status(204).end()
})

module.exports = { router }
