/* eslint-disable */
// Turn stored records into the shapes the app expects:
//   gql*  -> GraphQL (v3) objects, consumed by src/reducers/v3_reducer.js
//   flat* -> normalized v2 models, as the reducers store them in state
const { db, userById, postById } = require('./db')
const reposts = require('./reposts')
const media = require('./media')
const { prefsFor } = require('./settings')
const moderation = require('./moderation')
const { linkHashtags, unlinkHashtags } = require('./post-search')
const { commentContent, flatComment } = require('./comment-content')

const relationship = (user, viewerId) => {
  if (viewerId && viewerId === user.id) return 'self'
  const marked = moderation.blockKind(db, viewerId, user.id)
  if (marked) return marked
  const follows = viewerId && db.follows.some(f => f.followerId === viewerId && f.followeeId === user.id)
  return follows ? 'friend' : 'none'
}

const userStats = u => ({
  followersCount: db.follows.filter(f => f.followeeId === u.id).length,
  followingCount: db.follows.filter(f => f.followerId === u.id).length,
  lovesCount: db.loves.filter(l => l.userId === u.id).length,
  postsCount: db.posts.filter(p => p.authorId === u.id).length,
  totalViewsCount: db.posts.filter(p => p.authorId === u.id).reduce((n, p) => n + (p.views || 0), 0),
})

const settings = {
  hasLovesEnabled: true,
  hasSharingEnabled: true,
  hasRepostingEnabled: true,
  hasCommentingEnabled: true,
  postsAdultContent: false,
  isHireable: false,
  isCollaborateable: false,
  isCollaboratable: false,
}

const availability = u => ({
  isHireable: !!u.hireable,
  isCollaborateable: !!u.collaborateable,
  isCollaboratable: !!u.collaborateable,
})

const gqlAuthor = (u, viewerId) => ({
  id: u.id,
  username: u.username,
  name: u.name,
  avatar: media.avatar(u),
  currentUserState: { relationshipPriority: relationship(u, viewerId) },
  settings: { ...settings, ...availability(u) },
})

const gqlUser = (u, viewerId) => ({
  ...gqlAuthor(u, viewerId),
  location: u.location || '',
  formattedShortBio: `<p>${u.bio || ''}</p>`,
  isCommunity: false,
  badges: [],
  coverImage: media.coverImage(u),
  externalLinksList: u.links || [],
  userStats: userStats(u),
  metaAttributes: { title: u.name, description: u.bio || '', robots: 'index', image: null },
  categoryUsers: moderation.categoryUsers(u, db.categoryRoles),
})

// v2 profile / follower-list shape: stats and settings flattened onto the user
const flatUser = (u, viewerId) => ({
  id: u.id,
  username: u.username,
  name: u.name,
  avatar: media.avatar(u),
  coverImage: media.coverImage(u),
  badges: [],
  formattedShortBio: `<p>${u.bio || ''}</p>`,
  // email is private: only the owner sees it
  ...(viewerId && viewerId === u.id ? { email: u.email } : {}),
  shortBio: u.bio || '',
  unsanitizedShortBio: u.bio || '',
  location: u.location || '',
  externalLinksList: u.links || [],
  metaAttributes: { title: u.name, description: u.bio || '', robots: 'index', image: null },
  ...settings,
  ...availability(u),
  ...prefsFor(u),
  ...userStats(u),
  relationshipPriority: relationship(u, viewerId),
  links: { categories: [] },
})

// Resolve where an image region's pixels live
const imageOf = (region) => {
  const { url, seed } = region.data
  const w = region.width || 1200
  const h = region.height || 800
  return { url: url || media.photoUrl(seed, w, h), w, h }
}

const postRegions = (post) => {
  const assets = []
  const content = post.regions.map((region, i) => {
    if (region.kind === 'embed') {
      return { kind: 'embed', data: region.data, linkUrl: region.linkUrl || null, links: null }
    }
    if (region.kind !== 'image') {
      return { kind: 'text', data: linkHashtags(region.data), linkUrl: null, links: null }
    }
    const { url, w, h } = imageOf(region)
    const id = `${post.id}-a${i}`
    assets.push({ id, attachment: require('./video').attachment(region, url, w, h) })
    return { kind: 'image', data: { url, alt: region.data.alt || '' }, linkUrl: region.linkUrl || null, links: { assets: id } }
  })
  const firstImage = content.find(r => r.kind === 'image' || r.kind === 'embed')
  const summary = [content.find(r => r.kind === 'text'), firstImage].filter(Boolean)
  return { content, summary, assets }
}

// `body` is what the editor loads: text without its <p> wrappers, blank lines kept as \n\n (like the real API)
const editorBody = region => (region.kind === 'text'
  ? { ...region, data: unlinkHashtags(region.data).replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>\s*<p>/gi, '\n\n').replace(/<\/?p>/gi, '').trim() }
  : region)

const postStats = post => ({
  lovesCount: db.loves.filter(l => l.postId === post.id).length,
  commentsCount: db.comments.filter(c => c.postId === post.id).length,
  viewsCount: post.views || 0,
  repostsCount: reposts.repostCount(post.repostOfId || post.id), // a repost counts its original's reposts
})

const viewerState = (post, viewerId) => ({
  watching: !!viewerId && db.watches.some(w => w.userId === viewerId && w.postId === post.id),
  loved: !!viewerId && db.loves.some(l => l.userId === viewerId && l.postId === post.id),
  reposted: !!reposts.viewerRepost(post.repostOfId || post.id, viewerId),
})

// A repost reads like the real API: `repostContent` is the original's content, `content` is what the
// reposter added, `summary` is the original's summary and `repostedSource` is the original post.
const repostParts = (post) => {
  const source = post.repostOfId && postById(post.repostOfId)
  if (!source) return null
  const own = postRegions(post)
  const orig = postRegions(source)
  return { source, own, orig, assets: [...own.assets, ...orig.assets] }
}

// Where a post sits in categories, like the real API's `categoryPosts` (the original shows the first one as a CategoryHeader)
const categoryPostsOf = (post, viewerId) => (post.categoryIds || []).flatMap((id) => {
  const category = require('./content').categories.find(c => c.id === String(id))
  if (!category) return []
  const cp = require('./category-posts')
  const state = cp.stateOf(db, category.id, post)
  const name = uid => (uid ? { username: (userById(uid) || {}).username } : null)
  const cpId = `${category.id}-${post.id}`
  return [{
    id: cpId,
    status: state.status,
    featuredBy: name(state.featuredById),
    submittedBy: name(state.submittedById),
    actions: cp.actionsFor(db, cpId, state.status, viewerId, category.id),
    category: { id: category.id, slug: category.slug, name: category.name },
  }]
})

const gqlPost = (post, viewerId) => {
  const repost = repostParts(post)
  const { content, summary, assets } = repost
    ? { content: repost.own.content, summary: repost.orig.summary, assets: repost.assets }
    : postRegions(post)
  return {
    id: post.id,
    token: post.token,
    createdAt: post.createdAt,
    contentWarning: post.contentWarning || '',
    isAdultContent: !!post.contentWarning,
    artistInviteSubmission: require('./artist-invites').submissionForPost(db, post.id, viewerId),
    summary,
    content,
    repostContent: repost ? repost.orig.content : [],
    repostedSource: repost ? gqlPost(repost.source, viewerId) : null,
    author: gqlAuthor(userById(post.authorId), viewerId),
    categoryPosts: categoryPostsOf(post, viewerId),
    assets,
    postStats: postStats(post),
    currentUserState: viewerState(post, viewerId),
  }
}

// v2 post as it sits in redux state (see parsePost in v3_reducer.js)
const flatPost = (post, viewerId) => {
  const repost = repostParts(post)
  const { content, summary, assets } = repost
    ? { content: repost.own.content, summary: repost.orig.summary, assets: repost.assets }
    : postRegions(post)
  const byId = assets.reduce((m, a) => ({ ...m, [a.id]: a }), {})
  const region = (r, i) => ({
    ...r,
    id: `${post.id}-${i}`,
    ...(r.kind === 'image' ? { asset: byId[r.links.assets] } : {}),
  })
  return {
    id: post.id,
    token: post.token,
    href: `/${userById(post.authorId).username}/post/${post.token}`,
    authorId: post.authorId,
    createdAt: post.createdAt,
    summary: summary.map(region),
    content: content.map(region),
    body: content.map(editorBody),
    repostContent: repost ? repost.orig.content.map(region) : [],
    isAdultContent: !!post.contentWarning,
    contentWarning: post.contentWarning || '',
    ...postStats(post),
    ...viewerState(post, viewerId),
    links: { author: { id: post.authorId, type: 'users' }, categories: post.categoryIds || [] },
  }
}

// Envelope for create/update/detail: the post plus the author and image assets it needs
const postEnvelope = (post, viewerId) => ({
  posts: flatPost(post, viewerId),
  linked: {
    users: [flatUser(userById(post.authorId), viewerId)],
    assets: postRegions(post).assets,
  },
})

const gqlComment = (c, viewerId) => {
  const { content, assets } = commentContent(c)
  return {
    id: c.id,
    createdAt: c.createdAt,
    author: gqlAuthor(userById(c.authorId), viewerId),
    summary: content,
    content,
    assets,
    parentPost: { id: c.postId },
  }
}

const commentEnvelope = (c, viewerId) => ({
  comments: flatComment(c),
  linked: { users: [flatUser(userById(c.authorId), viewerId)] },
})

module.exports = { postEnvelope, flatComment, commentEnvelope, relationship, gqlAuthor, gqlUser, flatUser, gqlPost, flatPost, gqlComment, postRegions, imageOf }
