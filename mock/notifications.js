/* eslint-disable */
// Notifications for the mock. Records live in db.notifications (persisted in mock/.data/db.json).
//
// Most notifications are DERIVED from the rest of the data by `sync()`: a love on your post, a comment,
// a repost of your post, a new follower. They get a stable key so each source produces one notification, and they disappear
// again when the source does (unlove, delete). The first sync also seeds mentions, reposts and watches.
// Read state is `db.notificationReads[userId]`: a notification is unread when it is newer than that.
const { db, save, nextId, userById, postById } = require('./db')
const { gqlPost, gqlComment, gqlAuthor, flatPost, flatUser, flatComment } = require('./serialize')

const DAY = 86400000
const PER_PAGE = 25

// Which tab (NotificationCategory) each kind belongs to; everything else only shows under "all".
const CATEGORY_OF = {
  comment_notification: 'comments',
  comment_mention_notification: 'mentions',
  post_mention_notification: 'mentions',
  love_notification: 'loves',
  repost_notification: 'reposts',
  new_follower_post: 'relationships',
  new_followed_user_post: 'relationships',
}
const CATEGORIES = ['comments', 'mentions', 'loves', 'reposts', 'relationships']
const SUBJECT_TYPE = {
  comment_notification: 'Comment',
  comment_mention_notification: 'Comment',
  post_mention_notification: 'Post',
  love_notification: 'Love',
  repost_notification: 'Post',
  new_follower_post: 'User',
  new_followed_user_post: 'User',
  watch_notification: 'Watch',
}

const MENTION_TEXTS = [
  'Hey @{u}, you would love this thread.', '@{u} thought of you when I saw this!', 'Cc @{u}, what do you think?',
]

const rng = (seed) => () => {
  seed = (seed + 0x6D2B79F5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const init = () => {
  if (!db.notifications) { db.notifications = []; db.notificationReads = {}; db.notificationsSeeded = false }
  if (!db.notificationReads) db.notificationReads = {}
}

const add = (record) => {
  const n = { id: nextId(), createdAt: new Date().toISOString(), ...record }
  db.notifications.push(n)
  return n
}

// One-time seed: mentions, reposts and watches for every user, plus a read marker "now".
const seed = (now) => {
  const rand = rng(7)
  const when = () => new Date(now - Math.floor(rand() * 4 * DAY) - 600000).toISOString()
  const others = (id) => db.users.filter(u => u.id !== id)
  const pick = list => list[Math.floor(rand() * list.length)]
  db.users.forEach((u) => {
    const mine = db.posts.filter(p => p.authorId === u.id)
    if (!mine.length) return
    const [commenter, poster, reposter, watcher] = [pick(others(u.id)), pick(others(u.id)), pick(others(u.id)), pick(others(u.id))]
    const target = pick(mine)
    const comment = {
      id: nextId(), postId: target.id, authorId: commenter.id, createdAt: when(),
      text: pick(MENTION_TEXTS).replace('{u}', u.username),
    }
    db.comments.push(comment)
    add({ key: `cmention:${comment.id}`, userId: u.id, kind: 'comment_mention_notification', createdAt: comment.createdAt, commentId: comment.id })
    const theirs = db.posts.filter(p => p.authorId === poster.id)
    if (theirs.length) add({ key: `pmention:${theirs[0].id}:${u.id}`, userId: u.id, kind: 'post_mention_notification', createdAt: when(), postId: theirs[0].id })
    const reposts = db.posts.filter(p => p.authorId === reposter.id)
    reposts.slice(0, 2).forEach(p => add({ key: `seedrepost:${p.id}:${u.id}`, userId: u.id, kind: 'repost_notification', createdAt: when(), postId: p.id }))
    mine.slice(0, 2).forEach(p => add({ key: `watch:${watcher.id}:${p.id}`, userId: u.id, kind: 'watch_notification', createdAt: when(), postId: p.id, actorId: watcher.id }))
  })
  db.notificationsSeeded = true
}

// Create notifications for new loves/comments/follows; drop the ones whose source is gone.
const sync = () => {
  init()
  const now = Date.now()
  const first = !db.notificationsSeeded
  const rand = rng(11)
  const keys = new Set(db.notifications.map(n => n.key))
  const live = new Set()
  let changed = first
  const stamp = (floor) => (first
    ? new Date(Math.min(now, Math.max(floor + 3600000, now - rand() * 6 * DAY))).toISOString()
    : new Date(now).toISOString())

  const derive = (key, record, floor) => {
    live.add(key)
    if (!keys.has(key)) { add({ key, createdAt: stamp(floor), ...record }); keys.add(key); changed = true }
  }
  db.loves.forEach((l) => {
    const post = postById(l.postId)
    if (post && post.authorId !== l.userId) {
      derive(`love:${l.userId}:${l.postId}`, { userId: post.authorId, kind: 'love_notification', actorId: l.userId, postId: post.id }, Date.parse(post.createdAt))
    }
  })
  db.comments.forEach((c) => {
    const post = postById(c.postId)
    if (!post || post.authorId === c.authorId || /@\w+/.test(c.text)) return
    derive(`comment:${c.id}`, { userId: post.authorId, kind: 'comment_notification', actorId: c.authorId, postId: post.id, commentId: c.id }, Date.parse(c.createdAt))
  })
  db.follows.forEach((f) => {
    derive(`follow:${f.followerId}:${f.followeeId}`, { userId: f.followeeId, kind: 'new_follower_post', actorId: f.followerId, subjectUserId: f.followerId }, now - 6 * DAY)
  })
  // a repost tells the original's author (the subject is the repost itself; it goes away with it)
  db.posts.forEach((p) => {
    const original = p.repostOfId && postById(p.repostOfId)
    if (!original || original.authorId === p.authorId) return
    derive(`repost:${p.id}`, { userId: original.authorId, kind: 'repost_notification', actorId: p.authorId, postId: p.id, createdAt: p.createdAt }, Date.parse(p.createdAt))
  })
  const derivedPrefix = /^(love|comment|follow|repost):/
  const kept = db.notifications.filter(n => !derivedPrefix.test(n.key) || live.has(n.key))
  if (kept.length !== db.notifications.length) changed = true
  db.notifications = kept

  if (first) {
    seed(now)
    db.users.forEach((u) => { db.notificationReads[u.id] = new Date(now).toISOString() })
  }
  if (changed) save()
}

const forUser = (userId, category) => {
  sync()
  return db.notifications
    .filter(n => n.userId === userId && (!category || category === 'all' || CATEGORY_OF[n.kind] === category))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

const newContent = (userId) => {
  if (!userId) return false
  const list = forUser(userId)
  const readAt = db.notificationReads[userId] || ''
  return list.some(n => n.createdAt > readAt)
}

const markRead = (userId) => {
  if (!userId) return
  init()
  db.notificationReads[userId] = new Date().toISOString()
  save()
}

// Serialize one record as the GraphQL `Notification` the stream query asks for.
const serialize = (n, viewer) => {
  const post = n.postId ? postById(n.postId) : null
  let subject = null
  switch (SUBJECT_TYPE[n.kind]) {
    case 'Comment': {
      const c = db.comments.find(x => x.id === n.commentId)
      subject = c && { __typename: 'Comment', ...gqlComment(c, viewer), parentPost: { ...gqlPost(postById(c.postId), viewer) } }
      break
    }
    case 'Love': case 'Watch':
      subject = post && {
        __typename: SUBJECT_TYPE[n.kind], id: `${n.actorId}-${n.postId}`,
        post: gqlPost(post, viewer), user: gqlAuthor(userById(n.actorId), viewer),
      }
      break
    case 'Post':
      subject = post && { __typename: 'Post', ...gqlPost(post, viewer) }
      break
    case 'User':
      subject = userById(n.subjectUserId) && { __typename: 'User', ...gqlAuthor(userById(n.subjectUserId), viewer) }
      break
    default:
  }
  return subject && { id: n.id, kind: n.kind, subjectType: SUBJECT_TYPE[n.kind], createdAt: n.createdAt, subject }
}

const stream = (v, viewer) => {
  if (!viewer) return { notificationStream: { next: null, isLastPage: true, notifications: [] } }
  const category = CATEGORIES.includes(v.category) ? v.category : 'all'
  const all = forUser(viewer, category)
  const perPage = parseInt(v.perPage, 10) || PER_PAGE
  const start = parseInt(v.before, 10) || 0
  const end = start + perPage
  // like the real API, loading the stream marks everything as seen
  if (!v.before) markRead(viewer)
  const notifications = all.slice(start, end).map(n => serialize(n, viewer)).filter(Boolean)
  return { notificationStream: { next: end < all.length ? String(end) : null, isLastPage: end >= all.length, notifications } }
}

// The v2 REST shape the original app reads (GET /api/v2/notifications): `activities` whose
// `links.subject` points into `linked` (posts, comments, users, loves, watches).
const LINK_TYPE = { Comment: 'comments', Post: 'posts', User: 'users', Love: 'loves', Watch: 'watches' }

const activities = (userId, category) => {
  const linked = { posts: new Map(), users: new Map(), comments: new Map(), loves: new Map(), watches: new Map() }
  const addUser = id => linked.users.set(id, flatUser(userById(id), userId))
  const addPost = (post) => { linked.posts.set(post.id, flatPost(post, userId)); addUser(post.authorId) }
  const list = forUser(userId, category).map((n) => {
    const type = SUBJECT_TYPE[n.kind]
    const post = n.postId ? postById(n.postId) : null
    let id = n.id
    if (type === 'Comment') {
      const c = db.comments.find(x => x.id === n.commentId)
      if (!c) return null
      id = c.id
      addPost(postById(c.postId)); addUser(c.authorId)
      linked.comments.set(id, { ...flatComment(c), links: { author: { id: c.authorId, type: 'users' }, parentPost: { id: c.postId, type: 'posts' } } })
    } else if (type === 'Love' || type === 'Watch') {
      if (!post) return null
      id = `${n.actorId}-${n.postId}`
      addPost(post); addUser(n.actorId)
      linked[LINK_TYPE[type]].set(id, { id, links: { user: { id: n.actorId, type: 'users' }, post: { id: post.id, type: 'posts' } } })
    } else if (type === 'Post') {
      if (!post) return null
      id = post.id; addPost(post)
    } else {
      id = n.subjectUserId; addUser(id)
    }
    return { id: n.id, kind: n.kind, subjectType: type, createdAt: n.createdAt, links: { subject: { id, type: LINK_TYPE[type] } } }
  }).filter(Boolean)
  const out = {}
  Object.keys(linked).forEach((k) => { out[k] = [...linked[k].values()] })
  return { activities: list, linked: out }
}

const resolvers = {
  notificationStream: stream,
  newNotificationStreamContent: (v, viewer) => ({ newNotificationStreamContent: { newContent: newContent(viewer) } }),
}

// Dev helper: someone loves the viewer's newest post right now (lights the unread dot on the next check).
const simulate = (userId) => {
  sync()
  const post = db.posts.filter(p => p.authorId === userId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0]
  const lover = db.users.find(u => u.id !== userId && !db.loves.some(l => l.userId === u.id && l.postId === (post && post.id)))
  if (!post || !lover) return null
  db.loves.push({ userId: lover.id, postId: post.id })
  sync()
  return { by: lover.username, post: post.token }
}

module.exports = { activities, resolvers, sync, forUser, newContent, markRead, serialize, simulate, CATEGORY_OF, CATEGORIES }
