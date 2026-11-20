import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { StaffProvider } from '@/components/ui/staff-context'
import type { Comment, Post } from '@/types/post'
import { CommentList } from './comment-list'

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
}))
jest.mock('@/actions/comment-actions', () => ({ deleteComment: jest.fn(), updateComment: jest.fn() }))
jest.mock('@/actions/moderation-actions', () => ({ flagComment: jest.fn() }))
jest.mock('@/stores/toast-store', () => ({ toast: { error: jest.fn(), info: jest.fn() } }))
jest.mock('@/components/lightbox/post-lightbox', () => ({
  CommentsLightbox: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

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
  content: [{ kind: 'text', data: '<p>Hello</p>' }],
} as unknown as Comment
const post = { id: 'p1', author: { id: 'u3', username: 'mara' } } as unknown as Post

const renderList = (viewerId: string, isStaff: boolean) =>
  render(
    <StaffProvider isStaff={isStaff}>
      <CommentList comments={[comment]} post={post} viewerId={viewerId} onReply={jest.fn()} onChanged={jest.fn()} />
    </StaffProvider>,
  )

describe('CommentList: who may delete a comment', () => {
  it('not a bystander', () => {
    renderList('u9', false)
    expect(screen.queryByRole('button', { name: 'Delete comment' })).toBeNull()
  })

  it('its author and the author of the post', () => {
    renderList('u2', false)
    expect(screen.getByRole('button', { name: 'Delete comment' })).toBeInTheDocument()
    renderList('u3', false)
    expect(screen.getAllByRole('button', { name: 'Delete comment' })).toHaveLength(2)
  })

  it('staff, on anybody’s comment (and they still flag it, not edit it)', () => {
    renderList('u9', true)
    expect(screen.getByRole('button', { name: 'Delete comment' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Flag comment' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit comment' })).toBeNull()
  })
})
