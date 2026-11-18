import { render, screen } from '@testing-library/react'
import { gqlAuthor, gqlPost } from '@/test/fixtures/posts'
import { notificationPageSchema, type Notification } from '@/types/notification'
import { NotificationItem } from './notification-item'

const createdAt = new Date(Date.now() - 2 * 3600_000).toISOString()

const parse = (kind: string, subject: unknown): Notification => {
  const page = notificationPageSchema.parse({
    next: null,
    isLastPage: true,
    notifications: [{ id: 'n1', kind, createdAt, subject }],
  })
  const [first] = page.notifications
  if (!first) throw new Error('fixture did not parse')
  return first
}

describe('NotificationItem', () => {
  it('renders a love with the notifier, the post link, the thumbnail and the age', () => {
    const subject = { __typename: 'Love', id: 'l1', post: gqlPost('p1'), user: gqlAuthor('grace', 'u2') }
    const { container } = render(<NotificationItem data={parse('love_notification', subject)} />)
    expect(container.querySelector('.LoveNotification.hasAsset')).not.toBeNull()
    expect(screen.getByRole('link', { name: '@grace' })).toHaveAttribute('href', '/grace')
    expect(screen.getByRole('link', { name: 'post' })).toHaveAttribute('href', '/ada/post/tokp1')
    expect(screen.getByText(/loved your/)).toBeInTheDocument()
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '2h' })).toHaveAttribute('href', '/ada/post/tokp1')
  })

  it('renders a follower without a thumbnail', () => {
    const { container } = render(
      <NotificationItem data={parse('new_follower_post', { __typename: 'User', ...gqlAuthor('theo', 'u3') })} />,
    )
    expect(container.querySelector('.hasAsset')).toBeNull()
    expect(screen.getByText(/started following you/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '@theo' })).toHaveAttribute('href', '/theo')
  })

  it('renders a comment mention with the post text and the comment text', () => {
    const comment = {
      __typename: 'Comment',
      id: 'c1',
      createdAt,
      author: gqlAuthor('grace', 'u2'),
      content: [{ kind: 'text', data: '<p>@ada look</p>', linkUrl: null }],
      parentPost: gqlPost('p1'),
    }
    render(<NotificationItem data={parse('comment_mention_notification', comment)} />)
    expect(screen.getByText(/mentioned you in a/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'comment' })).toBeInTheDocument()
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.getByText('@ada look')).toBeInTheDocument()
  })

  it('renders the watch sentence', () => {
    const subject = { __typename: 'Watch', id: 'w1', post: gqlPost('p1'), user: gqlAuthor('grace', 'u2') }
    render(<NotificationItem data={parse('watch_notification', subject)} />)
    expect(screen.getByText(/is watching your/)).toBeInTheDocument()
  })
})
