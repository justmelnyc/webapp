/* eslint-disable */
// The v2 REST flavour of notifications (what the original app reads), built from the same records.
const { db, userById, postById } = require('./db')
const { flatPost, flatUser, flatComment } = require('./serialize')
const extras = require('./notification-extras')

// The v2 REST shape the original app reads (GET /api/v2/notifications): `activities` whose
// `links.subject` points into `linked` (posts, comments, users, loves, watches).
const REST_TYPE = { ArtistInviteSubmission: 'artist_invite_submissions', CategoryPost: 'category_posts', CategoryUser: 'category_users' }
const LINK_TYPE = { Comment: 'comments', Post: 'posts', User: 'users', Love: 'loves', Watch: 'watches', ...REST_TYPE }

// The v2 REST flavour: a model in `linked` plus the link the activity follows. `ctx` gives access to the
// linked collections and `addPost` / `addUser` of notifications.js.
const link = (id, type) => ({ id, type })

const restSubject = (n, ctx) => {
  const type = extras.SUBJECT_TYPE[n.kind]
  const put = (key, model) => { ctx.linked[key].set(model.id, model); return model.id }
  switch (type) {
    case 'ArtistInviteSubmission': {
      const s = extras.submissionById(n.submissionId)
      const invite = s && extras.inviteById(s.inviteId)
      const p = s && postById(s.postId)
      if (!invite || !p) return null
      ctx.addPost(p)
      const id = put(REST_TYPE[type], { id: s.id, status: s.status, inviteSlug: invite.slug, inviteTitle: invite.title, links: { post: link(p.id, 'posts') } })
      return { id, type: REST_TYPE[type] }
    }
    case 'CategoryPost': {
      const p = postById(n.postId)
      const category = extras.categoryById(n.categoryId)
      if (!p || !category) return null
      ctx.addPost(p); ctx.addUser(n.actorId)
      const id = put(REST_TYPE[type], {
        id: `${category.id}-${p.id}`, status: 'featured', categorySlug: category.slug, categoryName: category.name,
        links: { post: link(p.id, 'posts'), featuredBy: link(n.actorId, 'users'), category: link(category.id, 'categories') },
      })
      return { id, type: REST_TYPE[type] }
    }
    case 'CategoryUser': {
      const category = extras.categoryById(n.categoryId)
      if (!category) return null
      ctx.addUser(n.actorId); ctx.addUser(n.userId)
      put('categories', { id: category.id, slug: category.slug, name: category.name })
      const id = put(REST_TYPE[type], {
        id: `${category.id}-${n.userId}`, role: extras.ROLE_OF[n.kind],
        links: { category: link(category.id, 'categories'), user: link(n.userId, 'users'), [extras.REST_BY[extras.ROLE_OF[n.kind]]]: link(n.actorId, 'users') },
      })
      return { id, type: REST_TYPE[type] }
    }
    default:
      return undefined
  }
}


const activities = (userId, notifications, SUBJECT_TYPE) => {
  const linked = {
    posts: new Map(), users: new Map(), comments: new Map(), loves: new Map(), watches: new Map(), categories: new Map(),
    category_posts: new Map(), category_users: new Map(), artist_invite_submissions: new Map(),
  }
  const addUser = id => linked.users.set(id, flatUser(userById(id), userId))
  // a repost carries `repostId` and a link to its source (the original app reads them to word "on original" kinds)
  const addPost = (post) => {
    const flat = flatPost(post, userId)
    const source = post.repostOfId && postById(post.repostOfId)
    if (source) {
      flat.repostId = source.id
      flat.links.repostedSource = { id: source.id, type: 'posts' }
      addPost(source)
    }
    linked.posts.set(post.id, flat)
    addUser(post.authorId)
  }
  const ctx = { linked, addPost, addUser }
  const list = notifications.map((n) => {
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
    } else if (REST_TYPE[type]) {
      const subjectLink = restSubject(n, ctx)
      if (!subjectLink) return null
      return { id: n.id, kind: n.kind, subjectType: type, createdAt: n.createdAt, links: { subject: subjectLink } }
    } else {
      id = n.subjectUserId; addUser(id)
    }
    return { id: n.id, kind: n.kind, subjectType: type, createdAt: n.createdAt, links: { subject: { id, type: LINK_TYPE[type] } } }
  }).filter(Boolean)
  const out = {}
  Object.keys(linked).forEach((k) => { out[k] = [...linked[k].values()] })
  return { activities: list, linked: out }
}

module.exports = { activities }
