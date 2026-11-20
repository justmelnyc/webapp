import { render, screen } from '@testing-library/react'
import { gqlPost } from '@/test/fixtures/posts'
import { postSchema } from '@/types/post'
import { PostContent } from './post-content'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }), usePathname: () => '/' }))
let mockShow = false
jest.mock('@/constants/content-warning', () => ({
  get SHOW_CONTENT_WARNING_ON_FEEDS() {
    return mockShow
  },
}))
jest.mock('@/components/posts/repost-editor-gate', () => ({
  RepostEditorGate: ({ children }: { children: React.ReactNode }) => children,
}))

const nsfw = postSchema.parse(gqlPost('p1', { contentWarning: 'NSFW' }))

describe('PostContent content warning', () => {
  it('hides the View button on feeds like the original (SHOW_CONTENT_WARNING_ON_FEEDS is off)', () => {
    mockShow = false
    render(<PostContent post={nsfw} mode="grid" eager />)
    expect(screen.queryByText('NSFW')).not.toBeInTheDocument()
  })

  it('shows the button when the flag is switched on', () => {
    mockShow = true
    render(<PostContent post={nsfw} mode="list" eager />)
    expect(screen.getByText('NSFW')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /View/ })).toBeInTheDocument()
  })

  it('shows the button where the stream asks for it (submission streams), whatever the flag says', () => {
    mockShow = false
    render(<PostContent post={nsfw} mode="grid" eager showContentWarning />)
    expect(screen.getByRole('button', { name: /View/ })).toBeInTheDocument()
  })
})
