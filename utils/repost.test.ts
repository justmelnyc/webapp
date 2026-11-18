import type { Post } from '@/types/post'
import { isRepost, originalAuthorOf, repostedRegions } from './repost'

const author = (id: string, username: string): Post['author'] => ({ id, username })
const base = {
  id: '1', token: 't', createdAt: '2026-11-01T00:00:00Z', author: author('2', 'grace'),
  summary: [], content: [], assets: [],
  postStats: { lovesCount: 0, commentsCount: 0, viewsCount: 0, repostsCount: 0 },
  currentUserState: { watching: false, loved: false, reposted: false },
} satisfies Post

describe('repost helpers', () => {
  it('is a repost only when it carries the original content', () => {
    expect(isRepost(base)).toBe(false)
    expect(isRepost({ ...base, repostContent: [] })).toBe(false)
    expect(isRepost({ ...base, repostContent: [{ kind: 'text', data: '<p>x</p>' }] })).toBe(true)
  })

  it('finds the original author, falling back to the post author', () => {
    const source = { id: '9', token: 'o', author: author('5', 'mara') }
    expect(originalAuthorOf({ ...base, repostedSource: source }).username).toBe('mara')
    expect(originalAuthorOf(base).username).toBe('grace')
  })

  it('reposts the original content of a repost and the own content of anything else', () => {
    const own = [{ kind: 'text' as const, data: '<p>mine</p>' }]
    const theirs = [{ kind: 'text' as const, data: '<p>theirs</p>' }]
    expect(repostedRegions({ ...base, content: own })).toBe(own)
    expect(repostedRegions({ ...base, content: own, repostContent: theirs })).toBe(theirs)
  })
})
