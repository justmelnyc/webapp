/* eslint-disable */
// Write endpoints: posts, uploads-backed profile images, loves, watches, comments, follows
const express = require('express')
const { db, save, nextId, postByRef, userById, userByName } = require('../db')
const { flatUser, postEnvelope, commentEnvelope } = require('../serialize')
const { dimensionsOf } = require('./upload')
const { KEYS } = require('../settings')
const { viewer, viewerId } = require('./auth')
const { credentialErrors } = require('../credentials')
const { hashPassword } = require('../passwords')

const ai = require('../artist-invites')

const router = express.Router()

const requireViewer = (req, res, next) => {
  req.me = viewer(req)
  if (!req.me) return res.status(401).json({ error: 'unauthorized' })
  return next()
}

router.use(['/api/v2/posts', '/api/v2/profile', '/api/v2/users', '/api/v2/relationships'], (req, res, next) => (
  req.method === 'GET' || req.method === 'HEAD' ? next() : requireViewer(req, res, next)
))

// Editor blocks -> stored regions. Uploaded images get their real dimensions.
const toRegions = (body = []) => body.map((block) => {
  if (block.kind === 'image') {
    const url = block.data && block.data.url
    const dims = dimensionsOf(url) || { width: 1200, height: 800 }
    return { kind: 'image', data: { url, alt: (block.data && block.data.alt) || '' }, linkUrl: block.link_url || null, ...dims }
  }
  if (block.kind === 'embed' && block.data) {
    return { kind: 'embed', data: block.data, linkUrl: block.link_url || null }
  }
  return { kind: 'text', data: block.data }
}).filter(r => r.kind === 'image' || r.kind === 'embed' || String(r.data || '').replace(/<[^>]*>/g, '').trim())

// --- posts ---
router.post('/api/v2/posts', (req, res) => {
  const regions = toRegions(req.body.body)
  console.log(`  post body: ${JSON.stringify((req.body.body || []).map(b => ({ kind: b.kind, data: b.kind === 'image' ? (b.data || {}).url : String(b.data).slice(0, 50) })))}`)
  if (!regions.length) return res.status(422).json({ error: { message: 'Post can not be empty' } })
  const invite = req.body.artist_invite_id ? db.artistInvites.find(i => i.id === String(req.body.artist_invite_id)) : null
  const inviteError = req.body.artist_invite_id ? ai.submitError(invite) : null
  if (inviteError) return res.status(422).json({ error: { message: inviteError } })
  const post = {
    id: nextId(), token: `m${Date.now().toString(36)}`, authorId: req.me.id,
    createdAt: new Date().toISOString(), regions, categoryIds: (req.body.category_ids || []).map(String), views: 0,
  }
  db.posts.unshift(post)
  if (invite) ai.createSubmission(db, nextId, invite, post)
  save()
  console.log(`  post ${post.id} created by @${req.me.username} (${regions.length} blocks)`)
  return res.status(201).json(postEnvelope(post, req.me.id))
})

router.patch('/api/v2/posts/:id', (req, res) => {
  const post = postByRef(req.params.id)
  if (!post || post.authorId !== req.me.id) return res.status(404).json({ error: 'not found' })
  post.regions = toRegions(req.body.body)
  save()
  return res.json(postEnvelope(post, req.me.id))
})

router.get('/api/v2/posts/:id', (req, res) => {
  const post = postByRef(req.params.id)
  return post ? res.json(postEnvelope(post, viewerId(req))) : res.status(404).json({ error: 'not found' })
})

router.delete('/api/v2/posts/:id', (req, res) => {
  const post = postByRef(req.params.id)
  if (!post || post.authorId !== req.me.id) return res.status(404).json({ error: 'not found' })
  db.posts = db.posts.filter(p => p.id !== post.id)
  db.comments = db.comments.filter(c => c.postId !== post.id)
  ai.dropPostSubmissions(db, post.id)
  require('../reposts').dropOrphans()
  save()
  return res.status(204).end()
})

// --- loves & watches ---
const toggle = (list, kind) => (req, res) => {
  const post = postByRef(req.params.id)
  if (!post) return res.status(404).json({ error: 'not found' })
  const has = db[list].some(x => x.userId === req.me.id && x.postId === post.id)
  if (req.method === 'POST' && !has) db[list].push({ userId: req.me.id, postId: post.id })
  if (req.method === 'DELETE') db[list] = db[list].filter(x => !(x.userId === req.me.id && x.postId === post.id))
  save()
  return req.method === 'DELETE'
    ? res.status(204).end()
    : res.status(201).json({ [kind]: { id: `${req.me.id}-${post.id}`, postId: post.id, userId: req.me.id, createdAt: new Date().toISOString() } })
}
router.post('/api/v2/posts/:id/loves', toggle('loves', 'loves'))
router.delete('/api/v2/posts/:id/love', toggle('loves', 'loves'))
router.post('/api/v2/posts/:id/watches', toggle('watches', 'watches'))
router.delete('/api/v2/posts/:id/watch', toggle('watches', 'watches'))

// --- comments ---
const textOf = (b) => String(b.data || '').replace(/<[^>]*>/g, '').trim()
const commentImages = (body = []) => body.filter(b => b.kind === 'image' && b.data && b.data.url)
const commentText = (body = []) => body.filter(b => b.kind !== 'image').map(textOf).filter(Boolean).join(' ')
// Editor blocks -> ordered regions (text is stripped of HTML, images get their real dimensions)
const commentRegions = (body = []) => body.flatMap((b) => {
  if (b.kind === 'image') {
    if (!(b.data && b.data.url)) return []
    return [{ kind: 'image', url: b.data.url, alt: b.data.alt || '', ...(dimensionsOf(b.data.url) || { width: 1200, height: 800 }) }]
  }
  const text = textOf(b)
  return text ? [{ kind: 'text', text }] : []
})
// Comments with pictures keep their blocks in order (text-only comments stay a bare `text`).
const applyBody = (comment, body) => {
  if (commentImages(body).length) {
    comment.text = commentText(body)
    comment.regions = commentRegions(body)
  } else {
    delete comment.regions
  }
}
router.post('/api/v2/posts/:id/comments', (req, res) => {
  const post = postByRef(req.params.id)
  if (!post) return res.status(404).json({ error: 'not found' })
  const text = (req.body.body || []).map(b => String(b.data || '').replace(/<[^>]*>/g, '')).join(' ').trim()
  const comment = { id: nextId(), postId: post.id, authorId: req.me.id, createdAt: new Date().toISOString(), text: text || '...' }
  applyBody(comment, req.body.body)
  db.comments.push(comment)
  save()
  return res.status(201).json(commentEnvelope(comment, req.me.id))
})

// Usernames of everyone who commented on the post (the viewer excluded): the editor's "Reply All" button.
router.get('/api/v2/posts/:id/commenters_usernames', (req, res) => {
  const post = postByRef(req.params.id)
  if (!post) return res.status(404).json({ error: 'not found' })
  const me = viewerId(req)
  const ids = [...new Set(db.comments.filter(c => c.postId === post.id && c.authorId !== me).map(c => c.authorId))]
  return res.json({ usernames: ids.map(id => userById(id)).filter(Boolean).map(u => ({ username: u.username })) })
})

const ownComment = (req) => {
  const c = db.comments.find(x => x.id === req.params.cid && x.postId === (postByRef(req.params.id) || {}).id)
  return c && c.authorId === req.me.id ? c : null
}

router.get('/api/v2/posts/:id/comments/:cid', (req, res) => {
  const c = db.comments.find(x => x.id === req.params.cid)
  return c ? res.json(commentEnvelope(c, viewerId(req))) : res.status(404).json({ error: 'not found' })
})

router.patch('/api/v2/posts/:id/comments/:cid', (req, res) => {
  const c = ownComment(req)
  if (!c) return res.status(404).json({ error: 'not found' })
  c.text = (req.body.body || []).map(b => String(b.data || '').replace(/<[^>]*>/g, '')).join(' ').trim() || c.text
  applyBody(c, req.body.body)
  save()
  return res.json(commentEnvelope(c, req.me.id))
})

router.delete('/api/v2/posts/:id/comments/:cid', (req, res) => {
  const c = ownComment(req)
  if (!c) return res.status(404).json({ error: 'not found' })
  db.comments = db.comments.filter(x => x.id !== c.id)
  save()
  return res.status(204).end()
})

// --- follows ---
const setFollow = (me, target, follow) => {
  db.follows = db.follows.filter(f => !(f.followerId === me && f.followeeId === target))
  if (follow) db.follows.push({ followerId: me, followeeId: target })
  save()
}

router.post('/api/v2/users/:id/add/:priority', (req, res) => {
  const target = userById(req.params.id) || userByName(req.params.id)
  if (!target) return res.status(404).json({ error: 'not found' })
  setFollow(req.me.id, target.id, req.params.priority === 'friend')
  return res.json({
    relationship: { id: `${req.me.id}-${target.id}`, priority: req.params.priority },
    owner: flatUser(req.me, req.me.id),
    subject: flatUser(target, req.me.id),
  })
})

router.post('/api/v2/relationships/batches', (req, res) => {
  const { user_ids: ids = [], priority } = req.body || {}
  ids.forEach(id => userById(id) && setFollow(req.me.id, String(id), priority === 'friend'))
  res.status(204).end()
})

// --- profile (name/bio/location + avatar/cover URLs from the upload flow) ---
router.patch('/api/v2/profile', (req, res) => {
  const b = req.body || {}
  const me = req.me
  const attrs = credentialErrors(db, me, b)
  if (attrs) return res.status(422).json({ errors: { message: 'Invalid credentials', attrs } })
  if (typeof b.password === 'string' && b.password) me.passwordHash = hashPassword(b.password)
  if (typeof b.name === 'string') me.name = b.name
  if (typeof b.unsanitized_short_bio === 'string') me.bio = b.unsanitized_short_bio
  if (typeof b.location === 'string') me.location = b.location
  if (Array.isArray(b.external_links)) me.links = b.external_links
  if (typeof b.username === 'string' && b.username) me.username = b.username // uniqueness checked above
  if (typeof b.email === 'string' && b.email) me.email = b.email
  KEYS.forEach((key) => { if (typeof b[key] === 'boolean') me.prefs = { ...me.prefs, [key]: b[key] } })
  if (typeof b.is_hireable === 'boolean') me.hireable = b.is_hireable
  if (typeof b.is_collaborateable === 'boolean') me.collaborateable = b.is_collaborateable
  if (Array.isArray(b.creator_type_category_ids)) me.creatorTypeCategoryIds = b.creator_type_category_ids.map(Number)
  if (b.web_onboarding_version !== undefined) me.webOnboardingVersion = b.web_onboarding_version
  if (b.remote_avatar_url) me.avatarUrl = b.remote_avatar_url
  if (b.remote_cover_image_url) me.coverUrl = b.remote_cover_image_url
  save()
  return res.json({ users: flatUser(me, me.id), linked: {} })
})

module.exports = { router }
