import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommentForm } from '@/components/comments/comment-form'

const fetchCommenterUsernames = jest.fn()

jest.mock('@/actions/comment-actions', () => ({
  createComment: jest.fn(),
  fetchCommenterUsernames: (postId: string) => fetchCommenterUsernames(postId),
}))
jest.mock('@/stores/toast-store', () => ({ toast: { error: jest.fn(), info: jest.fn() } }))

const renderForm = (showReplyAll: boolean) =>
  render(<CommentForm postId="p1" onCreated={jest.fn()} showReplyAll={showReplyAll} />)

describe('CommentForm Reply All', () => {
  beforeEach(() => fetchCommenterUsernames.mockReset())

  it('has no Reply All button unless the viewer owns a post that has comments', () => {
    renderForm(false)
    expect(screen.queryByRole('button', { name: 'Reply All' })).toBeNull()
  })

  it('appends every commenter once, like the original appendUsernames', async () => {
    fetchCommenterUsernames.mockResolvedValue({ ok: true, data: ['yuki', 'noor'] })
    renderForm(true)
    const textarea = screen.getByRole('textbox', { name: 'Comment' })
    await userEvent.type(textarea, 'Thanks ')
    await userEvent.click(screen.getByRole('button', { name: 'Reply All' }))
    await waitFor(() => expect(textarea).toHaveValue('Thanks @yuki @noor '))
    await userEvent.click(screen.getByRole('button', { name: 'Reply All' }))
    await waitFor(() => expect(fetchCommenterUsernames).toHaveBeenCalledTimes(2))
    expect(textarea).toHaveValue('Thanks @yuki @noor ')
  })
})
