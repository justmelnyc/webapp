/* eslint-disable */
// GET /api/v2/posts?terms=&per_page=   (the original's Posts tab: v2 envelope, Link + X-Total-* paging headers)
// GraphQL `searchPosts(query, perPage, before)` is in routes/graphql.js (the rewrite).
const express = require('express')
const { db, postById } = require('../db')
const { flatPost, flatUser, postRegions } = require('../serialize')
const moderation = require('../moderation')
const { searchPosts, pageOf } = require('../post-search')
const { viewerId } = require('./auth')

const router = express.Router()

// A repost, like the v3 reducer reads it: the post's author is the reposter, `repostAuthor` the source's author
const withRepostLinks = (flat, post) => {
  const source = post.repostOfId && postById(post.repostOfId)
  if (!source) return flat
  const links = { ...flat.links, repostAuthor: { id: source.authorId, type: 'users' }, repostedSource: { id: source.id, type: 'posts' } }
  return { ...flat, repostId: source.id, links }
}

// Post search results the viewer may see
const visibleResults = (terms, viewer) => moderation.visiblePosts(db, viewer, searchPosts(db, terms))

router.get('/api/v2/posts', (req, res, next) => {
  if (typeof req.query.terms !== 'string') return next()
  const viewer = viewerId(req)
  const perPage = Math.min(parseInt(req.query.per_page, 10) || 25, 100)
  const results = visibleResults(req.query.terms, viewer)
  if (require('../empty-list').noContentWhenEmpty(res, results.length)) return undefined
  const { items, next: cursor } = pageOf(results, req.query.before, perPage)
  const pages = Math.max(1, Math.ceil(results.length / perPage))
  const current = Math.floor((parseInt(req.query.before, 10) || 0) / perPage) + 1
  const headers = {
    'X-TotalCount': String(results.length),
    'X-Total-Pages': String(pages),
    'X-Total-Pages-Remaining': String(Math.max(0, pages - current)),
  }
  if (cursor) {
    const url = `${req.protocol}://${req.get('host')}${req.path}?terms=${encodeURIComponent(req.query.terms)}&per_page=${perPage}&before=${cursor}`
    headers.Link = `<${url}>; rel="next"`
  }
  const authorIds = items.flatMap(p => [p.authorId, ...(p.repostOfId && postById(p.repostOfId) ? [postById(p.repostOfId).authorId] : [])])
  const authors = [...new Set(authorIds)].map(id => flatUser(db.users.find(u => u.id === id), viewer))
  const assets = items.flatMap(p => postRegions(p).assets)
  res.set(headers).json({ posts: items.map(p => withRepostLinks(flatPost(p, viewer), p)), linked: { users: authors, assets } })
})

module.exports = { router, visibleResults }
