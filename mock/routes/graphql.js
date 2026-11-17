/* eslint-disable */
// POST /api/v3/graphql: the root field of the query picks a resolver
const express = require('express')
const { db, postById, postByRef, userByName } = require('../db')
const { gqlUser, gqlPost, gqlComment } = require('../serialize')
const content = require('../content')
const { viewerId } = require('./auth')

const router = express.Router()
const PER_PAGE = 12

// Strip fragment definitions; the first field inside the operation is the root.
const stripFragments = (q) => {
  let out = q
  let idx = out.indexOf('fragment ')
  while (idx !== -1) {
    let depth = 0
    let end = out.indexOf('{', idx)
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

// Cursor pagination: `next` is the offset of the following page
const paginate = (list, before, perPage = PER_PAGE) => {
  const start = parseInt(before, 10) || 0
  const end = start + perPage
  return { items: list.slice(start, end), next: end < list.length ? String(end) : null, isLastPage: end >= list.length }
}

const byDate = (a, b) => (a.createdAt < b.createdAt ? 1 : -1)
const loveCount = p => db.loves.filter(l => l.postId === p.id).length
const recent = () => [...db.posts].sort(byDate)

const postStream = (key, posts, v, viewer) => {
  const { items, next, isLastPage } = paginate(posts, v.before)
  return { [key]: { next, isLastPage, posts: items.map(p => gqlPost(p, viewer)) } }
}

const followingIds = viewer => db.follows.filter(f => f.followerId === viewer).map(f => f.followeeId)
const trending = () => [...db.posts].sort((a, b) => loveCount(b) - loveCount(a))

const resolvers = {
  categoryNav: () => ({ categoryNav: content.categories }),
  allCategories: () => ({ allCategories: content.categories }),
  // logged-in profile pages ask for categories the viewer administers: none
  searchCategories: v => ({ searchCategories: { next: null, isLastPage: true, categories: v.administered ? [] : content.categories } }),
  category: v => ({ category: content.categories.find(c => c.slug === v.slug) || content.categories[0] }),
  pageHeaders: v => ({ pageHeaders: [content.pageHeader(v.kind || 'GENERIC', v.slug)] }),
  editorialStream: (v, viewer) => ({ editorialStream: { next: null, isLastPage: true, editorials: content.editorials(viewer) } }),
  findPosts: (v, viewer) => ({ findPosts: db.posts.filter(p => (v.tokens || []).includes(p.token)).map(p => gqlPost(p, viewer)) }),
  findUser: (v, viewer) => {
    const user = userByName(v.username)
    return user ? { findUser: gqlUser(user, viewer) } : null
  },
  post: (v, viewer) => {
    const post = postByRef(`~${v.token}`)
    return post ? { post: gqlPost(post, viewer) } : null
  },
  globalPostStream: (v, viewer) => postStream('globalPostStream', v.kind === 'TRENDING' ? trending() : recent(), v, viewer),
  subscribedPostStream: (v, viewer) => postStream('subscribedPostStream', recent().filter(p => followingIds(viewer).includes(p.authorId)), v, viewer),
  followingPostStream: (v, viewer) => postStream('followingPostStream', recent().filter(p => p.authorId === viewer || followingIds(viewer).includes(p.authorId)), v, viewer),
  categoryPostStream: (v, viewer) => {
    const cat = content.categories.find(c => c.slug === v.slug)
    return postStream('categoryPostStream', recent().filter(p => cat && p.categoryIds.includes(cat.id)), v, viewer)
  },
  userPostStream: (v, viewer) => {
    const user = userByName(v.username)
    return postStream('userPostStream', recent().filter(p => user && p.authorId === user.id), v, viewer)
  },
  userLoveStream: (v, viewer) => {
    const user = userByName(v.username)
    const loved = db.loves.filter(l => user && l.userId === user.id).map(l => postById(l.postId)).filter(Boolean).sort(byDate)
    const { items, next, isLastPage } = paginate(loved, v.before)
    return { userLoveStream: { next, isLastPage, loves: items.map(p => ({ id: `${user.id}-${p.id}`, post: gqlPost(p, viewer) })) } }
  },
  commentStream: (v, viewer) => {
    const post = v.id ? postById(v.id) : postByRef(`~${v.token}`)
    const comments = db.comments.filter(c => post && c.postId === post.id).sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
    const { items, next, isLastPage } = paginate(comments, v.before, parseInt(v.perPage, 10) || 10)
    return { commentStream: { next, isLastPage, comments: items.map(c => gqlComment(c, viewer)) } }
  },
  notificationStream: () => ({ notificationStream: { next: null, isLastPage: true, notifications: [] } }),
  newNotificationStreamContent: () => ({ newNotificationStreamContent: { newContent: false } }),
  searchUsers: (v, viewer) => {
    const q = String(v.query || '').toLowerCase()
    const users = db.users.filter(u => u.username.includes(q) || u.name.toLowerCase().includes(q)).slice(0, 10)
    return { searchUsers: { next: null, isLastPage: true, users: users.map(u => gqlUser(u, viewer)) } }
  },
}

router.post('/api/v3/graphql', (req, res) => {
  const { query = '', variables = {} } = req.body || {}
  const root = rootField(query)
  console.log(`  graphql: ${root} ${JSON.stringify(variables).slice(0, 80)}`)
  const resolve = resolvers[root]
  if (!resolve) {
    console.warn(`  !! unmocked graphql root: ${root}`)
    return res.json({ data: {} })
  }
  const data = resolve(variables || {}, viewerId(req))
  return data ? res.json({ data }) : res.json({ errors: [{ message: `${root} not found` }] })
})

module.exports = { router, paginate }
