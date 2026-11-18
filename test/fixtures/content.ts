import { responsive, version } from './media'
import { gqlAuthor, gqlPost } from './posts'

/** Mirrors mock/content.js `categories` entries. */
export const category = () => ({
  id: '1',
  name: 'Art',
  slug: 'art',
  level: 'primary',
  order: 0,
  allowInOnboarding: true,
  isCreatorType: false,
  description: 'Art on mock Ello',
  brandAccount: null,
  tileImage: {
    small: version('https://picsum.photos/seed/cat-Art/160/160', 160, 160),
    regular: version('https://picsum.photos/seed/cat-Art/320/320', 320, 320),
    large: version('https://picsum.photos/seed/cat-Art/640/640', 640, 640),
    original: version('https://picsum.photos/seed/cat-Art/640/640', 640, 640),
  },
})

/** Mirrors mock/content.js `pageHeader`. */
export const pageHeader = () => ({
  id: 'ph-GENERIC',
  kind: 'GENERIC',
  slug: null,
  header: 'Welcome to the mock',
  subheader: 'Served by mock/server.js',
  postToken: null,
  ctaLink: { text: 'Join', url: '/join' },
  image: responsive('https://picsum.photos/seed/header/1600/800', 1600, 800),
  category: null,
  user: gqlAuthor(),
})

/** Mirrors mock/content.js `editorials` entries. */
export const editorial = () => ({
  id: 'ed-1',
  kind: 'POST',
  title: 'Editorial 1',
  subtitle: 'Mock editorial',
  url: null,
  path: '/ada/post/tokp1',
  stream: null,
  oneByOneImage: responsive('https://picsum.photos/seed/ed-0-11/400/400', 400, 400),
  oneByTwoImage: responsive('https://picsum.photos/seed/ed-0-12/400/800', 400, 800),
  twoByOneImage: responsive('https://picsum.photos/seed/ed-0-21/800/400', 800, 400),
  twoByTwoImage: responsive('https://picsum.photos/seed/ed-0-22/800/800', 800, 800),
  post: gqlPost('p1'),
})
