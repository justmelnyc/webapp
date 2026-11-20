import { act, fireEvent, render as baseRender, screen, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactElement } from 'react'
import { runCategoryPostAction } from '@/actions/category-post-actions'
import { setLoved } from '@/actions/post-actions'
import { RegistrationDialogProvider } from '@/components/auth/registration-dialog'
import { PostBody } from '@/components/posts/post-body'
import { PostCard } from '@/components/posts/post-card'
import { useRepostStore } from '@/stores/repost-store'
import { useStreamCommentsStore } from '@/stores/stream-comments-store'
import { gqlAuthor, gqlPost } from '@/test/fixtures/posts'
import { postSchema, type Post } from '@/types/post'
import { categoryPostForPath, categorySlugOf } from './lightbox-feature-tool'
import { LightboxTriggerTool } from './lightbox-triggers'
import { PostsLightbox } from './post-lightbox'

const push = jest.fn()
let mockPathname = '/discover/art'
jest.mock('@/actions/post-actions', () => ({ setLoved: jest.fn(), setWatching: jest.fn() }))
jest.mock('@/actions/category-post-actions', () => ({ runCategoryPostAction: jest.fn() }))
jest.mock('@/actions/relationship-actions', () => ({ setFollowing: jest.fn() }))
jest.mock('@/actions/moderation-actions', () => ({ flagPost: jest.fn(), flagUser: jest.fn(), setRelationship: jest.fn() }))
jest.mock('@/actions/post-edit-actions', () => ({ loadEditablePost: jest.fn() }))
jest.mock('@/actions/composer-actions', () => ({ deletePost: jest.fn() }))
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }), usePathname: () => mockPathname }))

const feature = { method: 'PUT', href: '/api/v2/category_posts/1-1/feature' }
const categoryPost = (overrides: Record<string, unknown> = {}) => ({
  id: '1-1',
  status: 'submitted',
  featuredBy: null,
  submittedBy: { username: 'noor' },
  actions: { feature, unfeature: null },
  category: { id: '1', slug: 'art', name: 'Art' },
  ...overrides,
})
const makePost = (overrides: Record<string, unknown> = {}): Post =>
  postSchema.parse(gqlPost('p1', { author: gqlAuthor('noor', 'u6'), ...overrides }))

const render = (ui: ReactElement) =>
  baseRender(
    <QueryClientProvider client={new QueryClient()}>
      <RegistrationDialogProvider header={null}>{ui}</RegistrationDialogProvider>
    </QueryClientProvider>,
  )

const renderOpen = (post: Post, viewerId: string | null, mode: 'list' | 'grid' = 'list', variant: 'stream' | 'related' = 'stream') => {
  render(
    <PostsLightbox posts={[post]} viewerId={viewerId} tools={variant}>
      <PostBody postId={post.id} regions={post.summary} assets={post.assets} detailPath={mode === 'grid' ? '/noor/post/tokp1' : undefined} />
      <LightboxTriggerTool postId={post.id} summary={post.summary} />
    </PostsLightbox>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Lightbox' }))
}

const press = (key: string): void => {
  act(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  })
}
const tools = (): HTMLElement => document.querySelector('.LightBoxControls .PostTools.with-lightbox') as HTMLElement

beforeEach(() => {
  push.mockReset()
  mockPathname = '/discover/art'
  window.scrollTo = jest.fn()
  window.matchMedia = jest.fn().mockReturnValue({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() })
  jest.mocked(setLoved).mockReset().mockResolvedValue({ ok: true, data: undefined })
  jest.mocked(runCategoryPostAction).mockReset()
  useRepostStore.setState({ postId: null })
  useStreamCommentsStore.setState({ open: {} })
})

describe('lightbox post tools', () => {
  it('shows comment, love, repost, share and views, marked isLightBox', () => {
    renderOpen(makePost(), null)
    const names = [...tools().children].map((tool) => tool.className)
    expect(names).toEqual([
      'PostTool CommentTool isLightBox',
      'PostTool LoveTool isLightBox',
      'PostTool RepostTool isLightBox',
      'PostTool ShareTool isPill isLightBox',
      'PostTool ViewsTool isLightBox',
    ])
    expect(tools().querySelector('.CommentTool > a')).toHaveAttribute('href', '/noor/post/tokp1')
  })

  it('drops the share tool on phones', () => {
    jest.mocked(window.matchMedia).mockReturnValue({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() } as unknown as MediaQueryList)
    renderOpen(makePost(), null)
    expect(tools().querySelector('.ShareTool')).not.toBeInTheDocument()
  })

  it('loves the post with l when signed in', async () => {
    renderOpen(makePost(), 'u1')
    press('l')
    await waitFor(() => expect(setLoved).toHaveBeenCalledWith('p1', true))
    expect(push).not.toHaveBeenCalled()
  })

  it('sends a signed-out viewer to the login page on l', () => {
    renderOpen(makePost(), null)
    press('l')
    expect(push).toHaveBeenCalledWith('/enter')
    expect(setLoved).not.toHaveBeenCalled()
  })

  it('closes and opens the comments under the post when a signed-in viewer picks the comment tool', () => {
    renderOpen(makePost(), 'u1')
    fireEvent.click(screen.getByRole('button', { name: 'Comments' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(useStreamCommentsStore.getState().open).toEqual({ p1: 'lightbox' })
    expect(push).not.toHaveBeenCalled()
  })

  it('goes to the post page instead on a phone', () => {
    const width = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 375 })
    renderOpen(makePost(), 'u1')
    fireEvent.click(screen.getByRole('button', { name: 'Comments' }))
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(push).toHaveBeenCalledWith('/noor/post/tokp1')
    expect(useStreamCommentsStore.getState().open).toEqual({})
  })

  it('sends the comment and repost tools of a related post to its page', () => {
    renderOpen(makePost(), 'u1', 'list', 'related')
    fireEvent.click(within(tools()).getByRole('button', { name: 'Repost' }))
    expect(useRepostStore.getState().postId).toBeNull()
    fireEvent.click(within(tools()).getByRole('button', { name: 'Comments' }))
    expect(push.mock.calls).toEqual([['/noor/post/tokp1'], ['/noor/post/tokp1']])
    expect(useStreamCommentsStore.getState().open).toEqual({})
  })

  it('links the comment tool to the post for a signed-out viewer', () => {
    renderOpen(makePost(), null)
    expect(within(tools()).getByRole('link', { name: 'Comments' })).toHaveAttribute('href', '/noor/post/tokp1')
  })

  it('closes once the repost editor opens', () => {
    renderOpen(makePost(), 'u1')
    fireEvent.click(tools().querySelector('.RepostTool > button') as HTMLElement)
    expect(useRepostStore.getState().postId).toBe('p1')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens from the round trigger of a grid picture without following its link', () => {
    render(
      <PostsLightbox posts={[makePost()]} viewerId={null}>
        <PostBody postId="p1" regions={makePost().summary} assets={makePost().assets} detailPath="/noor/post/tokp1" />
      </PostsLightbox>,
    )
    const trigger = document.querySelector('a.lightbox-trigger') as HTMLElement
    expect(fireEvent.click(trigger)).toBe(false)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('lightbox placement', () => {
  const image = (): HTMLElement => document.querySelector('.LightBoxQueue .ImageAttachment') as HTMLElement

  it('sits outside the list in a stream and leaves the optimized file out of the srcset', () => {
    renderOpen(makePost(), null)
    expect(screen.getByRole('dialog')).toHaveClass('LightBoxContainer', { exact: true })
    expect(image().getAttribute('srcset')).toMatch(/1500w$/)
  })

  it('carries the post page classes there and offers the optimized file too', () => {
    mockPathname = '/noor/post/tokp1'
    renderOpen(makePost(), null)
    expect(screen.getByRole('dialog')).toHaveClass('LightBoxContainer', 'Posts', 'asList', 'LightBoxInPost')
    expect(image().getAttribute('srcset')).toMatch(/1920w$/)
  })
})

describe('lightbox feature tool', () => {
  it('finds the category a Discover path names', () => {
    expect(categorySlugOf('/discover/art/trending')).toBe('art')
    expect(categorySlugOf('/discover/art')).toBe('art')
    const post = makePost({ categoryPosts: [categoryPost()] })
    expect(categoryPostForPath(post, '/discover/art/recent')?.id).toBe('1-1')
    expect(categoryPostForPath(post, '/discover/photography')).toBeUndefined()
  })

  it('gives a curator the star on the category page and runs the action the API offers', async () => {
    jest.mocked(runCategoryPostAction).mockResolvedValue({ ok: true, data: { id: '1-1', status: 'featured', actions: null } })
    renderOpen(makePost({ categoryPosts: [categoryPost()] }), 'u1')
    const star = screen.getByRole('button', { name: 'Feature' })
    expect(star.closest('.PostTool')).toHaveClass('FeatureCategoryPostTool', 'isLightBox')
    expect(star.querySelector('.CurateIcon path')).toHaveAttribute('fill', '#aaaaaa')
    fireEvent.click(star)
    await waitFor(() => expect(runCategoryPostAction).toHaveBeenCalledWith(feature))
  })

  it('shows the green star for a post the curator can unfeature', () => {
    const unfeature = { method: 'PUT', href: '/api/v2/category_posts/1-1/unfeature' }
    renderOpen(makePost({ categoryPosts: [categoryPost({ status: 'featured', actions: { feature: null, unfeature } })] }), 'u1')
    expect(screen.getByRole('button', { name: 'Unfeature' })).toHaveClass('featured-toggle', 'featured')
  })

  it('has no star without actions or away from the category page', () => {
    renderOpen(makePost({ categoryPosts: [categoryPost({ actions: null })] }), 'u1')
    expect(tools().querySelector('.FeatureCategoryPostTool')).not.toBeInTheDocument()
  })

  it('has no star on another page', () => {
    mockPathname = '/discover'
    renderOpen(makePost({ categoryPosts: [categoryPost()] }), 'u1')
    expect(tools().querySelector('.FeatureCategoryPostTool')).not.toBeInTheDocument()
  })
})

describe('stream header feature tool', () => {
  it('draws the same toggle next to the age in a stream post header', async () => {
    mockPathname = '/discover/art'
    jest.mocked(runCategoryPostAction).mockResolvedValue({ ok: true, data: { id: '1-1', status: 'featured', actions: null } })
    const post = makePost({ categoryPosts: [categoryPost()] })
    render(<PostCard.Header post={post} viewerId="u1" />)
    const toggle = screen.getByRole('button', { name: 'Feature' })
    expect(toggle.parentElement).toHaveClass('PostHeaderTools')
    fireEvent.click(toggle)
    await waitFor(() => expect(runCategoryPostAction).toHaveBeenCalledWith(feature))
  })

  it('draws nothing in the header for a viewer without actions', () => {
    mockPathname = '/discover/art'
    render(<PostCard.Header post={makePost({ categoryPosts: [categoryPost({ actions: null })] })} viewerId="u1" />)
    expect(document.querySelector('.PostHeaderTools .featured-toggle')).not.toBeInTheDocument()
  })
})
