/* eslint-disable */
// Mock Ello API. Run: yarn mock  (listens on :7770)
// Point AUTH_DOMAIN in .env at http://localhost:7770; dev.js proxies /api here.
// State persists in mock/.data (delete it, or `yarn mock:reset`, to start over). MOCK_PORT and MOCK_DATA_DIR
// run a second instance next to it. `yarn mock:static` (MOCK_LIVE=0) turns background activity and latency off.
const express = require('express')
const { db, save, nextId } = require('./db')
const { PORT } = require('./media')
require('./reposts').seedReposts()

// Shop products (idempotent): see products.js
if (require('./products').seedProducts(db, nextId)) save()

// Posts with video / audio embeds (idempotent): see embeds.js
if (require('./embeds').seedEmbedPosts(db, nextId)) save()

// Posts with a video attachment (idempotent): see video.js
{
  const anchor = require('./clock').anchorOf(db)
  if (require('./video').seedVideoPosts(db, nextId, anchor ? anchor - 7 * require('./clock').HOUR : undefined)) save()
}

// Posts for the search tab to find (idempotent): see post-search.js
if (require('./post-search').seedSearchPosts(db, nextId)) save()

// Artist invites (idempotent): see artist-invites.js
if (require('./artist-invites').seedArtistInvites(db, nextId, require('./clock').anchorOf(db) || undefined)) save()

// Category curators and post states (idempotent): see category-posts.js
if (require('./category-posts').seedCategoryPosts(db)) save()

// The staff user (one-time): see staff.js
if (require('./staff').seedStaff(db)) save()

// Invitations (idempotent): see invitations.js
if (require('./invitations').seedInvitations(db, nextId)) save()

const app = express()

app.use(express.json({ limit: '2mb' }))
app.use((req, res, next) => {
  // CORS, with the paging headers exposed: see cors.js
  if (require('./cors').apply(req, res)) return undefined
  if (!req.path.startsWith('/img/') && !req.path.startsWith('/mock-s3/')) console.log(req.method, req.originalUrl)
  return next()
})

// Live mode: honest latency and people doing things on their own (latency.js, live-runner.js)
const live = require('./routes/live')
app.use(live.latency.middleware)
app.use(live.router)

;['auth', 'notifications', 'media', 'upload', 'graphql', 'related-posts', 'rest', 'embeds', 'moderation', 'reposts', 'mutations', 'account', 'invitations', 'artist-invites', 'onboarding', 'search', 'new-posts', 'post-search', 'category-posts', 'category-users', 'video'].forEach((name) => {
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
  live.runner.start()
  console.log(live.runner.enabled
    ? `Live: someone does something about every ${live.runner.status().intervalSeconds}s, answers are delayed a little. Static: yarn mock:static`
    : `Static: no background activity, no latency${process.env.MOCK_LIVE === '0' ? '' : ' (this database is from the old seed; yarn mock:reset for the living one)'}`)
})
