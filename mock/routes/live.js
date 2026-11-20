/* eslint-disable */
// Background activity (live-runner.js): notes who is asking, and two helper endpoints.
//   GET  /mock/live                 settings, who counts as logged in, the last actions
//   POST /mock/live/step?count=3    make that many things happen right now (works in static mode too)
//   POST /mock/latency?ms=3000      a fixed delay for every API answer, set while running (see latency.js)
const express = require('express')
const { db, save, nextId } = require('../db')
const { viewerId } = require('./auth')

const runner = require('../live-runner').create({ db, save, nextId, sync: () => require('../notifications').sync() })
const latency = require('../latency').create(runner.enabled)
const router = express.Router()
const MAX_STEPS = 50

router.use((req, res, next) => {
  if (!req.path.startsWith('/mock/live')) runner.touch(viewerId(req))
  next()
})

router.get('/mock/live', (req, res) => res.json({ ...runner.status(), latency: latency.status() }))

// POST /mock/latency?ms=3000: every API answer waits exactly that long from now on; without `ms` back to normal
router.post('/mock/latency', (req, res) => {
  latency.set(req.query.ms !== undefined ? req.query.ms : req.body && req.body.ms)
  res.json(latency.status())
})

router.post('/mock/live/step', (req, res) => {
  const count = Math.min(Math.max(parseInt(req.query.count || (req.body && req.body.count), 10) || 1, 1), MAX_STEPS)
  const me = viewerId(req)
  if (me) runner.touch(me)
  res.json({ actions: Array.from({ length: count }, () => runner.act()).filter(Boolean) })
})

module.exports = { router, runner, latency }
