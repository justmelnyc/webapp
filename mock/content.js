/* eslint-disable */
// Editorial content: categories, page headers and the homepage editorial grid
const { db } = require('./db')
const { CATEGORIES: NAMES } = require('./seed')
const media = require('./media')
const { gqlAuthor, gqlPost } = require('./serialize')

const categories = NAMES.map((name, i) => ({
  id: String(i + 1),
  name,
  slug: name.toLowerCase(),
  level: i < 3 ? 'primary' : 'secondary',
  order: i,
  allowInOnboarding: true,
  isCreatorType: true,
  description: `${name} on mock Ello`,
  brandAccount: null,
  tileImage: {
    small: media.version(media.photoUrl(`cat-${name}`, 160, 160), 160, 160),
    regular: media.version(media.photoUrl(`cat-${name}`, 320, 320), 320, 320),
    large: media.version(media.photoUrl(`cat-${name}`, 640, 640), 640, 640),
    original: media.version(media.photoUrl(`cat-${name}`, 640, 640), 640, 640),
  },
}))

const pageHeader = (kind, slug) => ({
  id: `ph-${kind}`,
  kind,
  slug: slug || null,
  header: 'Welcome to the mock',
  subheader: 'Served by mock/server.js',
  postToken: null,
  ctaLink: { text: 'Join', url: '/join' },
  image: media.responsive(media.photoUrl('header', 1600, 800), 1600, 800),
  category: null,
  user: gqlAuthor(db.users[0]),
})

const editorials = viewerId => db.posts.slice(0, 6).map((p, i) => ({
  id: `ed-${i + 1}`,
  kind: 'POST',
  title: `Editorial ${i + 1}`,
  subtitle: 'Mock editorial',
  url: null,
  path: `/${db.users.find(u => u.id === p.authorId).username}/post/${p.token}`,
  stream: null,
  oneByOneImage: media.responsive(media.photoUrl(`ed-${i}-11`, 400, 400), 400, 400),
  oneByTwoImage: media.responsive(media.photoUrl(`ed-${i}-12`, 400, 800), 400, 800),
  twoByOneImage: media.responsive(media.photoUrl(`ed-${i}-21`, 800, 400), 800, 400),
  twoByTwoImage: media.responsive(media.photoUrl(`ed-${i}-22`, 800, 800), 800, 800),
  post: gqlPost(p, viewerId),
}))

module.exports = { categories, pageHeader, editorials }
