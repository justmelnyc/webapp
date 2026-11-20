import { getRelatedPosts } from './related-posts'
import { graphql, rest } from '@/lib/api/client'
import { ApiError } from '@/lib/errors'
import { gqlPost } from '@/test/fixtures/posts'

jest.mock('@/lib/api/client', () => ({ graphql: jest.fn(), rest: jest.fn() }))

const mockedRest = jest.mocked(rest)
const mockedGraphql = jest.mocked(graphql)

describe('getRelatedPosts', () => {
  beforeEach(() => jest.resetAllMocks())

  it('asks the related endpoint by token and returns the posts in its order', async () => {
    mockedRest.mockResolvedValue({ posts: [{ token: 'tokb' }, { token: 'toka' }] })
    mockedGraphql.mockResolvedValue({ findPosts: [gqlPost('a'), gqlPost('b')] })
    const posts = await getRelatedPosts('p1x1', 3)
    expect(mockedRest.mock.calls[0]?.[0]).toBe('/api/v2/posts/~p1x1/related?per_page=3')
    expect(mockedGraphql.mock.calls[0]?.[1]).toEqual({ tokens: ['tokb', 'toka'] })
    expect(posts.map((post) => post.id)).toEqual(['b', 'a'])
  })

  it('asks for the widest row by default and skips posts that are gone', async () => {
    mockedRest.mockResolvedValue({ posts: [{ token: 'toka' }, { token: 'gone' }] })
    mockedGraphql.mockResolvedValue({ findPosts: [gqlPost('a')] })
    const posts = await getRelatedPosts('p1x1')
    expect(mockedRest.mock.calls[0]?.[0]).toBe('/api/v2/posts/~p1x1/related?per_page=6')
    expect(posts.map((post) => post.id)).toEqual(['a'])
  })

  it('does not ask for posts when there are none', async () => {
    mockedRest.mockResolvedValue({ posts: [] })
    expect(await getRelatedPosts('p1x1')).toEqual([])
    mockedRest.mockResolvedValue({})
    expect(await getRelatedPosts('p1x1')).toEqual([])
    expect(mockedGraphql).not.toHaveBeenCalled()
  })

  it('returns none when the API fails, and lets other errors through', async () => {
    mockedRest.mockRejectedValue(new ApiError(500, 'boom'))
    expect(await getRelatedPosts('p1x1')).toEqual([])
    mockedRest.mockRejectedValue(new TypeError('bug'))
    await expect(getRelatedPosts('p1x1')).rejects.toThrow('bug')
  })
})
