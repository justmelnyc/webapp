import { rest } from '@/lib/api/client'
import { createCommentFromBlocks } from './comment-post-actions'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@/lib/api/client', () => ({ rest: jest.fn() }))

describe('createCommentFromBlocks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(rest).mockResolvedValue({ comments: { id: 'c1' } })
  })

  it('sends a text-only comment exactly like createComment does (one escaped paragraph region)', async () => {
    const result = await createCommentFromBlocks('p1', [{ kind: 'text', text: 'a < b' }])
    expect(result).toEqual({ ok: true, data: { id: 'c1' } })
    expect(rest).toHaveBeenCalledWith('/api/v2/posts/p1/comments', expect.anything(), {
      method: 'POST',
      body: { body: [{ kind: 'text', data: '<p>a &lt; b</p>' }] },
    })
  })

  it('keeps text and image regions in order and skips blank text', async () => {
    await createCommentFromBlocks('p1', [
      { kind: 'text', text: 'look' },
      { kind: 'image', url: 'http://s/a.png' },
      { kind: 'text', text: '  ' },
    ])
    expect(rest).toHaveBeenCalledWith('/api/v2/posts/p1/comments', expect.anything(), {
      method: 'POST',
      body: { body: [{ kind: 'text', data: '<p>look</p>' }, { kind: 'image', data: { url: 'http://s/a.png' } }] },
    })
  })

  it('accepts a picture with no text', async () => {
    expect((await createCommentFromBlocks('p1', [{ kind: 'image', url: 'http://s/a.png' }])).ok).toBe(true)
  })

  it('rejects an empty comment and an image that is not a URL without calling the API', async () => {
    expect(await createCommentFromBlocks('p1', [{ kind: 'text', text: ' ' }])).toEqual({ ok: false, error: 'Write something first' })
    expect((await createCommentFromBlocks('p1', [{ kind: 'image', url: 'blob:nope' }])).ok).toBe(false)
    expect(rest).not.toHaveBeenCalled()
  })

  it('rejects a comment over the length limit', async () => {
    const result = await createCommentFromBlocks('p1', [{ kind: 'text', text: 'x'.repeat(2001) }])
    expect(result).toEqual({ ok: false, error: 'Keep it under 2000 characters' })
  })
})
