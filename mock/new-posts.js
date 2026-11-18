/* eslint-disable */
// Dev helper behind POST /mock/simulate-new-posts: other people post "right now", so a stream the viewer
// already has open gets newer posts on top. The app asks a stream's first page again whenever it opens
// (like the original), and the navbar's "New Posts" button offers whatever it has not shown yet.
const { db, save, nextId, userById } = require('./db')

const MAX = 30
const LINES = ['Fresh off the desk.', 'Just finished this one.', 'Posting before I overthink it.', 'New work, who dis.', 'Late night experiment.']

// Authors: people the viewer follows (anyone but the viewer when there is no viewer or nobody followed)
const authorsFor = (viewerId) => {
  const followed = db.follows.filter(f => f.followerId === viewerId).map(f => userById(f.followeeId)).filter(Boolean)
  return followed.length ? followed : db.users.filter(u => u.id !== viewerId)
}

const simulate = (viewerId, count = 2, now = Date.now()) => {
  const authors = authorsFor(viewerId)
  const n = Math.min(Math.max(parseInt(count, 10) || 1, 1), MAX)
  const created = []
  for (let i = 0; i < n; i += 1) {
    const author = authors[(db.seq + i) % authors.length]
    const id = nextId()
    const post = {
      id, token: `n${now.toString(36)}${id}`, authorId: author.id,
      createdAt: new Date(now - (n - i) * 1000).toISOString(),
      regions: [{ kind: 'text', data: `<p>${LINES[(Number(id) + i) % LINES.length]}</p>` }],
      categoryIds: [], views: 0,
    }
    db.posts.unshift(post)
    created.push({ token: post.token, by: author.username })
  }
  save()
  return created
}

module.exports = { simulate, MAX }
