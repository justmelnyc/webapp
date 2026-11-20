import { act, fireEvent, render, screen } from '@testing-library/react'
import { useLayoutModeStore } from '@/components/layout/layout-mode-store'
import { useStreamCommentsStore } from '@/stores/stream-comments-store'
import { CommentLinkTool, CommentToggleTool, CommentVisitTool, PostToolsFooter } from './comment-tool'

const push = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

const setWidth = (value: number): void => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value })
}
const open = () => useStreamCommentsStore.getState().open

describe('comment tools', () => {
  beforeEach(() => {
    push.mockReset()
    setWidth(1280)
    useStreamCommentsStore.setState({ open: {} })
    useLayoutModeStore.setState({ mode: 'grid' })
  })

  it('CommentLinkTool links to the post and shows the count', () => {
    const { container } = render(<CommentLinkTool path="/ada/post/t1" count={1200} />)
    const link = screen.getByRole('link', { name: 'Comments' })
    expect(link).toHaveAttribute('href', '/ada/post/t1')
    expect(link).toHaveClass('isNotZero')
    expect(container.querySelector('.CommentTool')).toHaveAttribute('data-count', '1200')
    expect(container.querySelector('.PostToolValue')).not.toHaveClass('isZero')
  })

  it('marks a zero count', () => {
    const { container } = render(<CommentLinkTool path="/ada/post/t1" count={0} />)
    expect(screen.getByRole('link', { name: 'Comments' })).not.toHaveClass('isNotZero')
    expect(container.querySelector('.PostToolValue')).toHaveClass('isZero')
  })

  it('CommentToggleTool opens and closes the comments under the post', () => {
    render(<CommentToggleTool postId="p1" path="/ada/post/t1" count={2} />)
    const button = screen.getByRole('button', { name: 'Comments' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(button)
    expect(open()).toEqual({ p1: 'tool' })
    expect(button).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(button)
    expect(open()).toEqual({})
    expect(push).not.toHaveBeenCalled()
  })

  it('CommentToggleTool goes to the post page from a grid on a phone, but opens in a list', () => {
    setWidth(375)
    render(<CommentToggleTool postId="p1" path="/ada/post/t1" count={2} />)
    fireEvent.click(screen.getByRole('button', { name: 'Comments' }))
    expect(push).toHaveBeenCalledWith('/ada/post/t1')
    expect(open()).toEqual({})
    useLayoutModeStore.setState({ mode: 'list' })
    fireEvent.click(screen.getByRole('button', { name: 'Comments' }))
    expect(open()).toEqual({ p1: 'tool' })
    expect(push).toHaveBeenCalledTimes(1)
  })

  it('CommentVisitTool always goes to the post page', () => {
    render(<CommentVisitTool path="/ada/post/t1" count={2} />)
    fireEvent.click(screen.getByRole('button', { name: 'Comments' }))
    expect(push).toHaveBeenCalledWith('/ada/post/t1')
    expect(open()).toEqual({})
  })

  it('PostToolsFooter is active only for comments its own tool opened', () => {
    const { container } = render(<PostToolsFooter postId="p1" />)
    const footer = container.querySelector('footer')
    expect(footer).toHaveClass('PostTools')
    act(() => useStreamCommentsStore.getState().show('p1'))
    expect(footer).not.toHaveClass('isCommentsActive')
    act(() => useStreamCommentsStore.setState({ open: { p1: 'tool' } }))
    expect(container.querySelector('footer')).toHaveClass('isCommentsActive')
  })
})
