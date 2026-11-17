/* eslint-disable */
// Mock Ello API. Run: node mock/server.js  (listens on :7770)
// Point AUTH_DOMAIN in .env at http://localhost:7770; dev.js proxies /api here.
const express = require('express')
const f = require('./fixtures')

const app = express()
const PORT = process.env.MOCK_PORT || 7770
const FAR_FUTURE = 4102444800

app.use(express.json({ limit: '1mb' }))
app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, If-Modified-Since',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS',
  })
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  console.log(req.method, req.originalUrl)
  return next()
})

const b64 = obj => Buffer.from(JSON.stringify(obj)).toString('base64')
  .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

const jwt = userData => `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ data: userData, exp: FAR_FUTURE })}.sig`

const tokenBody = userData => ({
  access_token: userData ? jwt(userData) : 'public-token',
  token_type: 'bearer',
  expires_in: 315360000,
  created_at: Math.floor(Date.now() / 1000),
  refresh_token: 'mock-refresh-token',
})

const ME = {
  id: '1', username: 'ada', email: 'ada@example.com', is_staff: false,
  web_onboarding_version: 3, allows_analytics: false, analytics_id: 'mock', created_at: '2018-01-01T00:00:00Z',
}

// --- images ---
app.get('/img/:size/:label.svg', (req, res) => {
  const [w, h] = req.params.size.split('x').map(Number)
  res.type('image/svg+xml').send(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#222"/>` +
    `<text x="50%" y="50%" fill="#888" font-family="sans-serif" font-size="${Math.max(12, Math.min(w, h) / 8)}" text-anchor="middle">${req.params.label.replace(/[<>&]/g, '')}</text></svg>`,
  )
})

// --- auth ---
app.get('/api/webapp-token', (req, res) => res.json({ token: tokenBody(null) }))
app.post('/api/oauth/token', (req, res) => res.json(tokenBody(ME)))
app.delete('/api/oauth/logout', (req, res) => res.json({}))
app.get('/emojis.json', (req, res) => res.json({
  emojis: [{ name: 'smile', image_url: f.img(32, 32, ':)') }, { name: 'tada', image_url: f.img(32, 32, 'tada') }],
}))

// --- v2 (REST) ---
const page = (res, body) => res.set({ 'X-Total-Pages': '1', 'X-Total-Pages-Remaining': '0', 'X-TotalCount': '0' }).json(body)

app.get('/api/v2/badges.json', (req, res) => res.json({ badges: [] }))
app.get('/api/v2/profile', (req, res) => res.json({
  users: {
    ...f.user('ada'),
    email: ME.email,
    relationshipPriority: 'self',
    hasAutoWatchEnabled: true,
    viewsAdultContent: false,
    webOnboardingVersion: 3,
    creatorTypeCategoryIds: [],
    links: { categories: [] },
  },
  linked: { categories: [] },
}))
app.get('/api/v2/most_recent_announcements', (req, res) => res.status(204).end())
app.head('/api/v2/notifications', (req, res) => res.status(204).end())
app.get('/api/v2/notifications', (req, res) => page(res, { activities: [] }))
app.get('/api/v2/posts/:id/related', (req, res) => page(res, { posts: [] }))
app.get('/api/v2/users/:id/:resource', (req, res) => page(res, { users: [] }))

// --- v3 (GraphQL) ---
// Strip fragment definitions, then the first field inside the operation is the root.
const stripFragments = (q) => {
  let out = q
  let idx = out.indexOf('fragment ')
  while (idx !== -1) {
    const open = out.indexOf('{', idx)
    let depth = 0
    let end = open
    for (; end < out.length; end += 1) {
      if (out[end] === '{') depth += 1
      if (out[end] === '}') { depth -= 1; if (depth === 0) break }
    }
    out = out.slice(0, idx) + out.slice(end + 1)
    idx = out.indexOf('fragment ')
  }
  return out
}

const rootField = (query) => {
  const m = stripFragments(query).match(/\{\s*([A-Za-z]+)/)
  return m ? m[1] : null
}

const stream = (key, posts) => ({ [key]: { next: null, isLastPage: true, posts } })

const resolvers = {
  categoryNav: () => ({ categoryNav: f.CATEGORIES }),
  allCategories: () => ({ allCategories: f.CATEGORIES }),
  searchCategories: () => ({ searchCategories: f.CATEGORIES }),
  category: v => ({ category: { ...(f.CATEGORIES.find(c => c.slug === v.slug) || f.CATEGORIES[0]), categoryUsers: [] } }),
  pageHeaders: v => ({ pageHeaders: [f.pageHeader(v.kind || 'GENERIC', v.slug)] }),
  editorialStream: () => ({ editorialStream: { next: null, isLastPage: true, editorials: f.editorials() } }),
  findPosts: v => ({ findPosts: f.POSTS.filter(p => (v.tokens || []).includes(p.token)) }),
  post: v => ({ post: f.POSTS.find(p => p.token === v.token) || f.POSTS[0] }),
  findUser: v => ({ findUser: f.user(String(v.username || 'ada').replace(/^~/, '')) }),
  globalPostStream: () => stream('globalPostStream', f.POSTS),
  subscribedPostStream: () => stream('subscribedPostStream', f.POSTS),
  categoryPostStream: () => stream('categoryPostStream', f.POSTS),
  followingPostStream: () => stream('followingPostStream', f.POSTS),
  userPostStream: () => stream('userPostStream', f.POSTS),
  userLoveStream: () => ({ userLoveStream: { next: null, isLastPage: true, loves: f.POSTS.slice(0, 4).map(post => ({ post })) } }),
  commentStream: () => ({ commentStream: { next: null, isLastPage: true, comments: [] } }),
  notificationStream: () => ({ notificationStream: { next: null, isLastPage: true, notifications: [] } }),
  newNotificationStreamContent: () => ({ newNotificationStreamContent: { newContent: false } }),
  searchUsers: () => ({ searchUsers: { next: null, isLastPage: true, users: [] } }),
}

app.post('/api/v3/graphql', (req, res) => {
  const { query = '', variables = {} } = req.body || {}
  const root = rootField(query)
  const resolve = resolvers[root]
  if (!resolve) {
    console.warn(`  !! unmocked graphql root: ${root}`)
    return res.json({ data: {} })
  }
  return res.json({ data: resolve(variables) })
})

// Anything else under /api: log it and return an empty JSON body.
app.all('/api/*', (req, res) => {
  console.warn(`  !! unmocked REST: ${req.method} ${req.originalUrl}`)
  res.json({})
})

app.listen(PORT, () => console.log(`Mock Ello API on http://localhost:${PORT}`))
