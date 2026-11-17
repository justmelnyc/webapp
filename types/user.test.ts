import { avatar } from '@/test/fixtures/media'
import { gqlAuthor, gqlUser } from '@/test/fixtures/posts'
import { authorSchema, relationshipSchema, userSchema, viewerSchema } from './user'

describe('authorSchema', () => {
  it('parses a mock gqlAuthor fixture', () => {
    const author = authorSchema.parse(gqlAuthor())
    expect(author.currentUserState?.relationshipPriority).toBe('none')
    expect(author.avatar?.large?.url).toContain('240')
  })

  it('requires id and username', () => {
    expect(authorSchema.safeParse({ username: 'x' }).success).toBe(false)
    expect(authorSchema.safeParse({ id: '1' }).success).toBe(false)
  })
})

describe('userSchema', () => {
  it('parses a mock gqlUser fixture', () => {
    const user = userSchema.parse(gqlUser())
    expect(user.userStats.postsCount).toBe(4)
    expect(user.externalLinksList?.[0]?.url).toBe('https://example.com')
    expect(user.coverImage?.original?.metadata?.width).toBe(1600)
  })

  it('accepts a null coverImage (mock users with hasCover: false)', () => {
    expect(userSchema.parse({ ...gqlUser(), coverImage: null }).coverImage).toBeNull()
  })

  it('accepts an avatar with missing sizes', () => {
    const { regular, ...partial } = avatar('ada')
    void regular
    const user = userSchema.parse({ ...gqlUser(), avatar: partial })
    expect(user.avatar?.regular).toBeUndefined()
  })

  it('rejects users without stats', () => {
    const { userStats: _stats, ...rest } = gqlUser()
    void _stats
    expect(userSchema.safeParse(rest).success).toBe(false)
  })
})

describe('viewerSchema', () => {
  it('parses the flat v2 profile shape', () => {
    const viewer = viewerSchema.parse({
      id: '1',
      username: 'ada',
      name: 'Ada',
      email: 'ada@example.com',
      avatar: avatar('ada'),
      coverImage: null,
      shortBio: 'hi',
      location: '',
      externalLinksList: [],
      followersCount: 4,
    })
    expect(viewer.email).toBe('ada@example.com')
    expect(viewer).not.toHaveProperty('followersCount')
  })

  it('rejects a viewer without username', () => {
    expect(viewerSchema.safeParse({ id: '1' }).success).toBe(false)
  })
})

describe('relationshipSchema', () => {
  it('accepts known values only', () => {
    expect(relationshipSchema.safeParse('friend').success).toBe(true)
    expect(relationshipSchema.safeParse('stranger').success).toBe(false)
  })
})
