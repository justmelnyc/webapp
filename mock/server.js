/* eslint-disable */
// Mock Ello API. Run: yarn mock  (listens on :7770)
// Point AUTH_DOMAIN in .env at http://localhost:7770; dev.js proxies /api here.
// State persists in mock/.data (delete it, or `yarn mock:reset`, to start over).
const express = require('express')
const { db, save, nextId } = require('./db')
const { PORT } = require('./media')
require('./reposts').seedReposts()

// Shop products (idempotent): see products.js
if (require('./products').seedProducts(db, nextId)) save()

// Posts with video / audio embeds (idempotent): see embeds.js
if (require('./embeds').seedEmbedPosts(db, nextId)) save()

const app = express()

app.use(express.json({ limit: '2mb' }))
app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, If-Modified-Since',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS',
  })
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  if (!req.path.startsWith('/img/') && !req.path.startsWith('/mock-s3/')) console.log(req.method, req.originalUrl)
  return next()
})

;['auth', 'notifications', 'media', 'upload', 'graphql', 'rest', 'embeds', 'moderation', 'reposts', 'mutations', 'account'].forEach((name) => {
  app.use(require(`./routes/${name}`).router)
})

// Anything else under /api: log it and return an empty JSON body.
app.all('/api/*', (req, res) => {
  console.warn(`  !! unmocked REST: ${req.method} ${req.originalUrl}`)
  res.json({})
})

app.listen(PORT, () => {
  console.log(`Mock Ello API on http://localhost:${PORT}`)
  console.log(`${db.users.length} users, ${db.posts.length} posts. Log in at /enter with any of:`)
  console.log(`  ${db.users.map(u => u.email).join('  ')}`)
  console.log('  Password: anything with 8+ characters (the form blocks shorter ones), e.g. "password"')
})
