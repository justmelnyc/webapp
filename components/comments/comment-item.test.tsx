import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Comment } from '@/types/post'
import { CommentItem } from './comment-item'

const updateComment = jest.fn()
const flagComment = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
}))
jest.mock('@/actions/comment-actions', () => ({
  deleteComment: jest.fn(),
  updateComment: (...args: unknown[]) => updateComment(...args),
}))
jest.mock('@/actions/moderation-actions', () => ({
  flagComment: (...args: unknown[]) => flagComment(...args),
}))
jest.mock('@/stores/toast-store', () => ({ toast: { error: jest.fn(), info: jest.fn() } }))

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })) as unknown as typeof window.matchMedia
})

const comment = {
  id: 'c1',
  createdAt: new Date().toISOString(),
  author: { id: 'u2', username: 'grace', avatar: null },
  content: [{ kind: 'text', data: '<p>Fish &amp; chips</p><p>Second</p>' }],
} as unknown as Comment

const renderItem = (isOwnComment: boolean, onUpdated = jest.fn()) =>
  render(
    <CommentItem
      comment={comment}
      postId="p1"
      isOwnComment={isOwnComment}
      canDelete={isOwnComment}
      onReply={jest.fn()}
      onDeleted={jest.fn()}
      onUpdated={onUpdated}
    />,
  )

describe('CommentItem tools', () => {
  beforeEach(() => {
    updateComment.mockReset()
    flagComment.mockReset()
  })

  it("offers Flag, not Edit, on other people's comments", () => {
    renderItem(false)
    expect(screen.getByRole('button', { name: 'Flag comment' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit comment' })).toBeNull()
  })

  it('flags a comment through the FlagDialog', async () => {
    flagComment.mockResolvedValue({ ok: true, data: undefined })
    renderItem(false)
    await userEvent.click(screen.getByRole('button', { name: 'Flag comment' }))
    await userEvent.click(screen.getByRole('button', { name: 'Spam' }))
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(flagComment).toHaveBeenCalledWith('p1', 'c1', 'spam'))
    expect(await screen.findByText('Thank you.')).toBeInTheDocument()
  })

  it('offers Edit, not Flag, on own comments', () => {
    renderItem(true)
    expect(screen.getByRole('button', { name: 'Edit comment' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Flag comment' })).toBeNull()
  })

  it('swaps the comment for an editor holding its text and saves with Update', async () => {
    updateComment.mockResolvedValue({ ok: true, data: undefined })
    const onUpdated = jest.fn()
    renderItem(true, onUpdated)
    await userEvent.click(screen.getByRole('button', { name: 'Edit comment' }))
    const textarea = screen.getByRole('textbox', { name: 'Comment' })
    expect(textarea).toHaveValue('Fish & chips\n\nSecond')
    expect(screen.queryByText('@grace')).toBeNull()
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'Fixed')
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))
    await waitFor(() => expect(updateComment).toHaveBeenCalledWith('p1', 'c1', 'Fixed', []))
    await waitFor(() => expect(onUpdated).toHaveBeenCalled())
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('cancels the edit without saving', async () => {
    renderItem(true)
    await userEvent.click(screen.getByRole('button', { name: 'Edit comment' }))
    await userEvent.click(screen.getAllByRole('button', { name: 'Cancel' })[0]!)
    expect(updateComment).not.toHaveBeenCalled()
    expect(screen.getByText('@grace')).toBeInTheDocument()
  })

  it('does not save an empty comment', async () => {
    renderItem(true)
    await userEvent.click(screen.getByRole('button', { name: 'Edit comment' }))
    await userEvent.clear(screen.getByRole('textbox', { name: 'Comment' }))
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled()
  })
})
