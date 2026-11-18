import { avatar, responsive } from './media'

/** Mirrors mock/serialize.js `gqlAuthor` (includes extra `settings` keys the schema ignores). */
export const gqlAuthor = (username = 'ada', id = 'u1') => ({
  id,
  username,
  name: `${username} Lovelace`,
  avatar: avatar(username),
  currentUserState: { relationshipPriority: 'none' },
  settings: { hasLovesEnabled: true, hasSharingEnabled: true },
})

/** Mirrors mock/serialize.js `gqlUser`. */
export const gqlUser = (username = 'ada', id = 'u1') => ({
  ...gqlAuthor(username, id),
  location: 'London',
  formattedShortBio: '<p>Analyst</p>',
  isCommunity: false,
  badges: [],
  coverImage: responsive('https://picsum.photos/seed/ada-cover/1600/600', 1600, 600),
  externalLinksList: [{ url: 'https://example.com', text: 'example.com' }],
  userStats: { followersCount: 3, followingCount: 2, lovesCount: 1, postsCount: 4, totalViewsCount: 99 },
  metaAttributes: { title: 'ada', description: '', robots: 'index', image: null },
  categoryUsers: [],
})

export const textRegion = (data = '<p>Hello world</p>') => ({ kind: 'text' as const, data, linkUrl: null, links: null })

export const imageRegion = (assetId = 'p1-a1', url = 'https://picsum.photos/seed/x/1200/800') => ({
  kind: 'image' as const,
  data: { url, alt: 'A photo' },
  linkUrl: null,
  links: { assets: assetId },
})

/** Mirrors mock/serialize.js `gqlPost`. */
export const gqlPost = (id = 'p1', overrides: Record<string, unknown> = {}) => {
  const image = imageRegion(`${id}-a1`)
  return {
    id,
    token: `tok${id}`,
    createdAt: '2026-01-01T12:00:00.000Z',
    artistInviteSubmission: null,
    summary: [textRegion(), image],
    content: [textRegion(), image],
    repostContent: [],
    repostedSource: null,
    author: gqlAuthor(),
    categoryPosts: [],
    assets: [{ id: `${id}-a1`, attachment: responsive('https://picsum.photos/seed/x/1200/800', 1200, 800) }],
    postStats: { lovesCount: 2, commentsCount: 1, viewsCount: 10, repostsCount: 0 },
    currentUserState: { watching: false, loved: false, reposted: false },
    ...overrides,
  }
}

/** Mirrors mock/serialize.js `gqlComment`. */
export const gqlComment = (id = 'c1') => ({
  id,
  createdAt: '2026-01-02T12:00:00.000Z',
  author: gqlAuthor('grace', 'u2'),
  summary: [textRegion('<p>Nice</p>')],
  content: [textRegion('<p>Nice</p>')],
  assets: [],
  parentPost: { id: 'p1' },
})
