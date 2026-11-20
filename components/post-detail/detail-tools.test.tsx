import { fireEvent, render } from '@testing-library/react'
import { postSchema, type Post } from '@/types/post'
import { gqlAuthor, gqlPost, textRegion } from '../../test/fixtures/posts'
import { DetailTools } from './detail-tools'

const open = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }), usePathname: () => '/theo/post/tokp2' }))
jest.mock('@/components/auth/registration-dialog', () => ({ useRegistrationDialog: () => ({ open }) }))
jest.mock('@/actions/post-actions', () => ({ setLoved: jest.fn(), setWatching: jest.fn() }))
jest.mock('@/actions/moderation-actions', () => ({ flagPost: jest.fn(), flagUser: jest.fn(), setRelationship: jest.fn() }))

const plain: Post = postSchema.parse(gqlPost('p1', { author: gqlAuthor('ada', 'u1') }))
const repost: Post = postSchema.parse({
  ...gqlPost('p2', { author: gqlAuthor('theo', 'u2') }),
  repostContent: [textRegion('<p>Original words</p>')],
  repostedSource: { id: 'p1', token: 'tok1', author: gqlAuthor('ada', 'u1') },
})
const watchTool = (container: HTMLElement): Element | null => container.querySelector('.WatchTool')

describe('DetailTools Watch tool', () => {
  beforeEach(() => open.mockReset())

  it('signed in, is on other people\'s posts and not on your own or on reposts of yours', () => {
    expect(watchTool(render(<DetailTools post={plain} viewerId="u9" />).container)).not.toBeNull()
    expect(watchTool(render(<DetailTools post={plain} viewerId="u1" />).container)).toBeNull()
    expect(watchTool(render(<DetailTools post={repost} viewerId="u1" />).container)).toBeNull()
  })

  it('signed out, is only on reposts, where it asks the visitor to sign up', () => {
    expect(watchTool(render(<DetailTools post={plain} viewerId={null} />).container)).toBeNull()
    const tool = watchTool(render(<DetailTools post={repost} viewerId={null} />).container)
    expect(tool).not.toBeNull()
    fireEvent.click(tool?.querySelector('button') as HTMLElement)
    expect(open).toHaveBeenCalledWith('post-tools')
  })

  it('uses the shared Hint and PostTool class names, with no styles of its own on them', () => {
    const { container } = render(<DetailTools post={plain} viewerId="u9" />)
    expect(container.querySelector('.LoveTool .Hint')).toHaveAttribute('class', 'Hint')
    expect(container.querySelector('.ViewsTool')).toHaveClass('PostTool', 'isPill')
  })
})
