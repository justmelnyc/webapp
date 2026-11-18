import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useNewPostsStore } from '@/stores/new-posts-store'
import { NavbarNewPosts } from './navbar-new-posts'

describe('NavbarNewPosts', () => {
  beforeEach(() => useNewPostsStore.setState({ count: 0, apply: null }))

  it('renders nothing until posts are waiting', () => {
    const { container } = render(<NavbarNewPosts />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the pill and hands the click to the stream', async () => {
    const apply = jest.fn()
    render(<NavbarNewPosts />)
    act(() => useNewPostsStore.getState().offer(3, apply))
    await userEvent.click(screen.getByRole('button', { name: 'New Posts' }))
    expect(apply).toHaveBeenCalledTimes(1)
  })
})
