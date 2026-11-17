/* eslint-disable */
// Fixture builders for the mock API. Shapes follow src/queries/fragments.js
// and the reducers in src/reducers (v3_reducer.js, json.js).
const HOST = process.env.MOCK_HOST || 'http://localhost:7770'

const img = (w, h, label) => `${HOST}/img/${w}x${h}/${encodeURIComponent(label || '')}.svg`

const meta = (w, h) => ({ height: h, width: w, type: 'image/svg+xml', size: 1000 })

const version = (w, h, label) => ({ url: img(w, h, label), metadata: meta(w, h) })

const responsive = (w, h, label) => ({
  xhdpi: version(w, h, label),
  hdpi: version(w, h, label),
  mdpi: version(w, h, label),
  ldpi: version(w, h, label),
  optimized: version(w, h, label),
  original: version(w, h, label),
  video: null,
})

const avatar = label => ({
  small: version(60, 60, label),
  regular: version(120, 120, label),
  large: version(240, 240, label),
  original: version(240, 240, label),
})

const USERS = ['ada', 'grace', 'linus', 'margaret', 'alan'].map((username, i) => ({
  id: String(i + 1),
  username,
  name: username[0].toUpperCase() + username.slice(1),
}))

const author = u => ({
  id: u.id,
  username: u.username,
  name: u.name,
  avatar: avatar(u.username),
  currentUserState: { relationshipPriority: 'none' },
  settings: {
    hasLovesEnabled: true,
    hasSharingEnabled: true,
    hasRepostingEnabled: true,
    hasCommentingEnabled: true,
    postsAdultContent: false,
  },
})

const postFor = (n) => {
  const u = USERS[n % USERS.length]
  const assetId = `asset-${n}`
  const text = { kind: 'text', data: `<p>Mock post number ${n} by ${u.name}.</p>`, linkUrl: null, links: null }
  const image = { kind: 'image', data: { url: img(900, 600, `post ${n}`), alt: `post ${n}` }, linkUrl: null, links: { assets: assetId } }
  return {
    id: `post-${n}`,
    token: `token${n}`,
    createdAt: new Date(Date.UTC(2018, 0, 1) + n * 3600000).toISOString(),
    artistInviteSubmission: null,
    summary: [text, image],
    content: [text, image],
    repostContent: [],
    repostedSource: null,
    author: author(u),
    categoryPosts: [],
    assets: [{
      id: assetId,
      attachment: {
        optimized: version(900, 600, `post ${n}`),
        xhdpi: null,
        hdpi: null,
        mdpi: null,
        ldpi: null,
        original: null,
        video: null,
      },
    }],
    postStats: { lovesCount: n, commentsCount: 1, viewsCount: n * 10, repostsCount: 0 },
    currentUserState: { watching: false, loved: false, reposted: false },
  }
}

const POSTS = Array.from({ length: 24 }, (_, i) => postFor(i + 1))

const CATEGORIES = ['Art', 'Photography', 'Design', 'Fashion'].map((name, i) => ({
  id: String(i + 1),
  name,
  slug: name.toLowerCase(),
  level: i < 3 ? 'primary' : 'secondary',
  order: i,
  allowInOnboarding: true,
  isCreatorType: false,
  description: `${name} on mock Ello`,
  brandAccount: null,
  tileImage: responsive(300, 300, name),
}))

const pageHeader = (kind, slug) => ({
  id: `ph-${kind}`,
  kind,
  slug: slug || null,
  header: 'Welcome to the mock',
  subheader: 'Served by mock/server.js',
  postToken: null,
  ctaLink: { text: 'Join', url: '/join' },
  image: responsive(1600, 800, 'header'),
  category: null,
  user: author(USERS[0]),
})

const editorials = () => POSTS.slice(0, 6).map((p, i) => ({
  id: `ed-${i + 1}`,
  kind: 'POST',
  title: `Editorial ${i + 1}`,
  subtitle: 'Mock editorial',
  url: null,
  path: `/${p.author.username}/post/${p.token}`,
  stream: null,
  oneByOneImage: responsive(400, 400, `ed ${i + 1}`),
  oneByTwoImage: responsive(400, 800, `ed ${i + 1}`),
  twoByOneImage: responsive(800, 400, `ed ${i + 1}`),
  twoByTwoImage: responsive(800, 800, `ed ${i + 1}`),
  post: p,
}))

const user = (username) => {
  const u = USERS.find(x => x.username === username) || { id: '99', username, name: username }
  return {
    ...author(u),
    location: 'Internet',
    formattedShortBio: `<p>Bio for ${u.name}</p>`,
    isCommunity: false,
    badges: [],
    coverImage: null,
    externalLinksList: [],
    userStats: { followingCount: 1, followersCount: 2, lovesCount: 3, postsCount: POSTS.length, totalViewsCount: 100 },
    settings: { ...author(u).settings, isHireable: false, isCollaborateable: false },
    metaAttributes: { title: u.name, description: 'mock', robots: 'index', image: null },
    categoryUsers: [],
  }
}

module.exports = { HOST, img, USERS, POSTS, CATEGORIES, pageHeader, editorials, user, author, avatar, postFor }
