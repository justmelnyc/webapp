import { getSubmissionPage } from './artist-invites'
import { graphql, restWithHeaders } from '@/lib/api/client'

jest.mock('@/lib/api/client', () => ({ graphql: jest.fn(), rest: jest.fn(), restWithHeaders: jest.fn() }))

const mockedRest = jest.mocked(restWithHeaders)
const mockedGraphql = jest.mocked(graphql)

const post = (id: string, token: string) => ({
  id,
  token,
  createdAt: '2026-11-01T00:00:00Z',
  author: { id: '1', username: 'ada', name: 'Ada', avatar: null, currentUserState: { relationshipPriority: 'none' } },
  summary: [],
  content: [],
  repostContent: [],
  assets: [],
  postStats: { lovesCount: 0, commentsCount: 0, viewsCount: 0, repostsCount: 0 },
  currentUserState: { watching: false, loved: false, reposted: false },
})

const record = (id: string, postId: string, status = 'approved') => ({ id, status, actions: null, links: { post: { id: postId } } })

describe('getSubmissionPage', () => {
  beforeEach(() => jest.resetAllMocks())

  it('attaches each submission to its post, in the API order', async () => {
    mockedRest.mockResolvedValue({
      data: {
        artistInviteSubmissions: [record('s1', 'p2'), record('s2', 'p1')],
        linked: { posts: [{ id: 'p1', token: 'aaa' }, { id: 'p2', token: 'bbb' }] },
      },
      headers: new Headers({ 'X-Total-Pages': '2', 'X-TotalCount': '30' }),
    })
    mockedGraphql.mockResolvedValue({ findPosts: [post('p1', 'aaa'), post('p2', 'bbb')] })
    const page = await getSubmissionPage('/api/v2/artist_invites/1/approved_submissions?status=approved', 1)
    expect(page.submissions.map((s) => [s.id, s.post.id])).toEqual([['s1', 'p2'], ['s2', 'p1']])
    expect(page.nextPage).toBe(2)
    expect(page.totalCount).toBe(30)
    expect(mockedRest.mock.calls[0]?.[0]).toBe('/api/v2/artist_invites/1/approved_submissions?status=approved&per_page=25&page=1')
  })

  it('has no next page on the last page and skips submissions whose post is gone', async () => {
    mockedRest.mockResolvedValue({
      data: { artistInviteSubmissions: [record('s1', 'gone')], linked: { posts: [] } },
      headers: new Headers({ 'X-Total-Pages': '1' }),
    })
    const page = await getSubmissionPage('http://localhost:7770/api/v2/artist_invites/1/selected_submissions?status=selected', 1)
    expect(page.submissions).toEqual([])
    expect(page.nextPage).toBeNull()
    expect(mockedGraphql).not.toHaveBeenCalled()
  })
})
