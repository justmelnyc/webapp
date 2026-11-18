/* eslint-disable */
// The less common notification kinds, kept apart from notifications.js:
//   - derived from the data: invitation accepted, artist invite submission approved (own and "from following"),
//     love/comment on a repost (told to the reposter) or on a repost of your post (told to the original's author)
//   - seeded once: welcome, category post / repost featured, added as featured / curator / moderator
// Each kind has the subject type the original app maps it to.
const { db, nextId, userById, postById } = require('./db')
const { gqlPost, gqlAuthor } = require('./serialize')

const DAY = 86400000
const FOLLOWER_LIMIT = 2 // accepted submissions of people you follow, newest first, per person
const EXTRA_SEED = 1

const KIND = {
  invitation: 'invitation_accepted_post',
  welcome: 'welcome_notification',
  submission: 'approved_artist_invite_submission',
  submissionFollowing: 'approved_artist_invite_submission_notification_for_followers',
  categoryPost: 'category_post_featured',
  categoryRepost: 'category_repost_featured',
  categoryViaRepost: 'category_post_via_repost_featured',
  featured: 'user_added_as_featured_notification',
  curator: 'user_added_as_curator_notification',
  moderator: 'user_added_as_moderator_notification',
  loveRepost: 'love_on_repost_notification',
  loveOriginal: 'love_on_original_post_notification',
  commentRepost: 'comment_on_repost_notification',
  commentOriginal: 'comment_on_original_post_notification',
}

const CATEGORY_OF = {
  [KIND.invitation]: 'relationships',
  [KIND.loveRepost]: 'loves',
  [KIND.loveOriginal]: 'loves',
  [KIND.commentRepost]: 'comments',
  [KIND.commentOriginal]: 'comments',
}

const SUBJECT_TYPE = {
  [KIND.invitation]: 'User',
  [KIND.welcome]: 'User',
  [KIND.submission]: 'ArtistInviteSubmission',
  [KIND.submissionFollowing]: 'ArtistInviteSubmission',
  [KIND.categoryPost]: 'CategoryPost',
  [KIND.categoryRepost]: 'CategoryPost',
  [KIND.categoryViaRepost]: 'CategoryPost',
  [KIND.featured]: 'CategoryUser',
  [KIND.curator]: 'CategoryUser',
  [KIND.moderator]: 'CategoryUser',
  [KIND.loveRepost]: 'Love',
  [KIND.loveOriginal]: 'Love',
  [KIND.commentRepost]: 'Comment',
  [KIND.commentOriginal]: 'Comment',
}

const ROLE_OF = { [KIND.featured]: 'featured', [KIND.curator]: 'curator', [KIND.moderator]: 'moderator' }
const REST_BY = { featured: 'featuredBy', curator: 'curatorBy', moderator: 'moderatorBy' }

const categoryList = () => require('./content').categories
const categoryById = id => categoryList().find(c => c.id === String(id))
const submissionById = id => (db.artistInviteSubmissions || []).find(s => s.id === String(id))
const inviteById = id => (db.artistInvites || []).find(i => i.id === String(id))
const isApproved = s => s.status === 'approved' || s.status === 'selected'

// A repost's notifications: the post it is about is the repost; whoever owns the repost hears "on repost",
// the original's author hears "on original".
const repostKinds = (post, onRepost, onOriginal) => {
  const original = post.repostOfId && postById(post.repostOfId)
  return original ? { original, repostKind: onRepost, originalKind: onOriginal } : null
}

const loveKind = post => repostKinds(post, KIND.loveRepost, KIND.loveOriginal)
const commentKind = post => repostKinds(post, KIND.commentRepost, KIND.commentOriginal)

// Derived notifications. `derive(key, record, floor)` is sync()'s helper; keys get the prefixes in DERIVED.
const DERIVED = ['invite', 'aisub', 'aifol', 'loveorig', 'commentorig']

const deriveExtras = (derive) => {
  ;(db.invitations || []).forEach((i) => {
    if (!i.acceptedById || !userById(i.acceptedById)) return
    derive(`invite:${i.id}`, { userId: i.inviterId, kind: KIND.invitation, subjectUserId: i.acceptedById }, Date.parse(i.acceptedAt || i.createdAt))
  })
  const byFollower = new Map()
  ;(db.artistInviteSubmissions || []).filter(isApproved).forEach((s) => {
    const post = postById(s.postId)
    if (!post || !inviteById(s.inviteId)) return
    const floor = Date.parse(s.approvedAt || s.createdAt)
    derive(`aisub:${s.id}`, { userId: post.authorId, kind: KIND.submission, submissionId: s.id, postId: post.id }, floor)
    db.follows.filter(f => f.followeeId === post.authorId).forEach((f) => {
      byFollower.set(f.followerId, [...(byFollower.get(f.followerId) || []), { s, post, floor }])
    })
  })
  byFollower.forEach((list, followerId) => {
    list.sort((a, b) => b.floor - a.floor).slice(0, FOLLOWER_LIMIT).forEach(({ s, post, floor }) => {
      derive(`aifol:${s.id}:${followerId}`, { userId: followerId, kind: KIND.submissionFollowing, submissionId: s.id, postId: post.id, actorId: post.authorId }, floor)
    })
  })
}

// The original's author also hears about a love or comment on a repost of their post.
const deriveRepostVariants = (derive) => {
  db.loves.forEach((l) => {
    const post = postById(l.postId)
    const kinds = post && loveKind(post)
    if (!kinds || kinds.original.authorId === l.userId || kinds.original.authorId === post.authorId) return
    derive(`loveorig:${l.userId}:${post.id}`, { userId: kinds.original.authorId, kind: kinds.originalKind, actorId: l.userId, postId: post.id }, Date.parse(post.createdAt))
  })
  db.comments.forEach((c) => {
    const post = postById(c.postId)
    const kinds = post && commentKind(post)
    if (!kinds || /@\w+/.test(c.text) || kinds.original.authorId === c.authorId || kinds.original.authorId === post.authorId) return
    derive(`commentorig:${c.id}`, { userId: kinds.original.authorId, kind: kinds.originalKind, actorId: c.authorId, postId: post.id, commentId: c.id }, Date.parse(c.createdAt))
  })
}

// ---- seed ----

const makeRepost = (author, source, createdAt) => {
  const id = nextId()
  const post = { id, token: `r${Date.parse(createdAt).toString(36)}${id}`, authorId: author.id, createdAt, regions: [], categoryIds: [], views: 60 + (Number(id) % 7) * 17, repostOfId: source.id }
  db.posts.unshift(post)
  return post
}

// Reposts around the first user, with loves and comments on them, so the "on repost" and "on original" kinds exist.
const seedRepostActivity = (now) => {
  const [ada, grace, mara, theo, jules] = db.users
  if (!jules) return
  const others = db.posts.filter(p => !p.repostOfId)
  const theirs = others.find(p => p.authorId === theo.id)
  const mine = others.find(p => p.authorId === ada.id)
  const at = days => new Date(now - days * DAY).toISOString()
  const pairs = [[ada, theirs, 2.4], [grace, mine, 2.1]].filter(([, source]) => source)
  pairs.forEach(([author, source, days]) => {
    const repost = makeRepost(author, source, at(days))
    db.loves.push({ userId: mara.id, postId: repost.id })
    db.comments.push({ id: nextId(), postId: repost.id, authorId: jules.id, createdAt: at(days - 0.2), text: 'Great find!' })
  })
}

const seedNotifications = (add, now, rand) => {
  const when = () => new Date(now - Math.floor(rand() * 4 * DAY) - 900000).toISOString()
  const pick = (list) => list[Math.floor(rand() * list.length)]
  const categories = categoryList()
  db.users.forEach((u, i) => {
    const others = db.users.filter(x => x.id !== u.id)
    add({ key: `welcome:${u.id}`, userId: u.id, kind: KIND.welcome, createdAt: new Date(now - 6 * DAY).toISOString(), subjectUserId: u.id })
    const mine = db.posts.filter(p => p.authorId === u.id && !p.repostOfId)
    const last = mine[mine.length - 1]
    if (last) {
      add({ key: `catpost:${last.id}`, userId: u.id, kind: KIND.categoryPost, createdAt: when(), postId: last.id, actorId: pick(others).id, categoryId: (last.categoryIds || [])[0] || categories[0].id })
    }
    db.posts.filter(p => p.repostOfId).forEach((p) => {
      const original = postById(p.repostOfId)
      const category = (original && (original.categoryIds || [])[0]) || categories[0].id
      if (p.authorId === u.id) add({ key: `catrepost:${p.id}`, userId: u.id, kind: KIND.categoryRepost, createdAt: when(), postId: p.id, actorId: pick(others).id, categoryId: category })
      if (original && original.authorId === u.id) add({ key: `catvia:${p.id}`, userId: u.id, kind: KIND.categoryViaRepost, createdAt: when(), postId: p.id, actorId: pick(others).id, categoryId: category })
    })
    ;[KIND.featured, KIND.curator, KIND.moderator].forEach((kind, n) => {
      add({ key: `catuser:${kind}:${u.id}`, userId: u.id, kind, createdAt: when(), actorId: pick(others).id, categoryId: categories[(i + n) % categories.length].id })
    })
  })
}

// ---- serialization ----

// GraphQL `Notification.subject` for the kinds above (null when the source is gone).
const serializeSubject = (n, viewer) => {
  switch (SUBJECT_TYPE[n.kind]) {
    case 'ArtistInviteSubmission': {
      const s = submissionById(n.submissionId)
      const invite = s && inviteById(s.inviteId)
      const p = s && postById(s.postId)
      return invite && p && {
        __typename: 'ArtistInviteSubmission', id: s.id, status: s.status,
        post: gqlPost(p, viewer), artistInvite: { id: invite.id, title: invite.title, slug: invite.slug },
      }
    }
    case 'CategoryPost': {
      const p = postById(n.postId)
      const category = categoryById(n.categoryId)
      return p && category && {
        __typename: 'CategoryPost', id: `${n.categoryId}-${p.id}`, status: 'featured',
        category: { id: category.id, slug: category.slug, name: category.name },
        post: gqlPost(p, viewer), featuredBy: gqlAuthor(userById(n.actorId), viewer),
      }
    }
    case 'CategoryUser': {
      const category = categoryById(n.categoryId)
      return category && {
        __typename: 'CategoryUser', id: `${n.categoryId}-${n.userId}`, role: ROLE_OF[n.kind],
        category: { id: category.id, slug: category.slug, name: category.name },
        user: gqlAuthor(userById(n.userId), viewer), featuredBy: gqlAuthor(userById(n.actorId), viewer),
      }
    }
    default:
      return undefined
  }
}

module.exports = {
  KIND, CATEGORY_OF, SUBJECT_TYPE, DERIVED, EXTRA_SEED, ROLE_OF, REST_BY,
  deriveExtras, deriveRepostVariants, loveKind, commentKind, seedRepostActivity, seedNotifications,
  serializeSubject, categoryById, submissionById, inviteById,
}
