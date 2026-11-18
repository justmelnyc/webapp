import { render, screen } from '@testing-library/react'
import { gqlAuthor, gqlPost, textRegion } from '@/test/fixtures/posts'
import { notificationPageSchema, type Notification } from '@/types/notification'
import { AssetOriginProvider } from '@/components/ui/emoji'
import { NotificationItem } from './notification-item'

const createdAt = new Date(Date.now() - 3 * 3600_000).toISOString()

const parse = (kind: string, subject: unknown): Notification => {
  const page = notificationPageSchema.parse({ next: null, isLastPage: true, notifications: [{ id: 'n1', kind, createdAt, subject }] })
  const [first] = page.notifications
  if (!first) throw new Error(`fixture for ${kind} did not parse`)
  return first
}

const show = (kind: string, subject: unknown) =>
  render(
    <AssetOriginProvider value="http://api.test">
      <NotificationItem data={parse(kind, subject)} />
    </AssetOriginProvider>,
  )

const grace = gqlAuthor('grace', 'u2')
const original = gqlPost('orig', { author: gqlAuthor('theo', 'u3'), summary: [textRegion('<p>Original words</p>')] })
const repost = gqlPost('rp', {
  author: grace,
  repostedSource: { id: 'orig', token: 'tokorig', author: original.author, summary: original.summary, assets: [] },
})

describe('artist invite submissions', () => {
  const submission = {
    __typename: 'ArtistInviteSubmission',
    id: 's1',
    status: 'approved',
    post: gqlPost('p1'),
    artistInvite: { id: 'i1', title: 'Neon Nights', slug: 'neon-nights' },
  }

  it('tells the artist their submission was accepted, with the emoji', () => {
    const { container } = show('approved_artist_invite_submission', submission)
    expect(container.querySelector('.ApprovedAristInviteSubmissionNotification')).not.toBeNull()
    expect(screen.getByText('Invite Submission Accepted')).toBeInTheDocument()
    expect(screen.getByText(/Your submission to the Neon Nights Invite has been accepted/)).toBeInTheDocument()
    expect(screen.getByTitle('Yay!')).toHaveAttribute('src', 'http://api.test/images/emoji/v.png')
    expect(screen.getByRole('link', { name: '3h' })).toHaveAttribute('href', '/invites/neon-nights')
  })

  it('tells followers about it, with the post and a link to the invite', () => {
    const { container } = show('approved_artist_invite_submission_notification_for_followers', submission)
    expect(container.querySelector('.ApprovedArtistInviteSubmissionFromFollowingNotification.hasAsset')).not.toBeNull()
    expect(screen.getByRole('link', { name: '@ada' })).toHaveAttribute('href', '/ada')
    expect(screen.getByRole('link', { name: 'Neon Nights' })).toHaveAttribute('href', '/invites/neon-nights')
    expect(screen.getByText(/was accepted/)).toBeInTheDocument()
  })
})

describe('category notifications', () => {
  const categoryPost = (post: unknown) => ({
    __typename: 'CategoryPost',
    id: 'cp1',
    category: { id: 'c1', slug: 'design', name: 'Design' },
    post,
    featuredBy: grace,
  })

  it('says a post was featured', () => {
    show('category_post_featured', categoryPost(gqlPost('p1')))
    expect(screen.getByText(/featured your/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'post' })).toHaveAttribute('href', '/ada/post/tokp1')
    expect(screen.getByRole('link', { name: 'Design' })).toHaveAttribute('href', '/discover/design')
  })

  it('words reposts and reposts of your post', () => {
    const { unmount } = show('category_repost_featured', categoryPost(repost))
    expect(screen.getByRole('link', { name: 'repost' })).toHaveAttribute('href', '/grace/post/tokrp')
    unmount()
    show('category_post_via_repost_featured', categoryPost(repost))
    expect(screen.getByText(/featured a/)).toBeInTheDocument()
    expect(screen.getByText(/of your post in/)).toBeInTheDocument()
  })

  it.each([
    ['user_added_as_featured_notification', /has featured you in/],
    ['user_added_as_curator_notification', /has invited you to help curate/],
    ['user_added_as_moderator_notification', /has invited you to help moderate/],
  ])('%s links the category', (kind, sentence) => {
    const subject = { __typename: 'CategoryUser', id: 'cu1', category: { id: 'c1', slug: 'art', name: 'Art' }, user: gqlAuthor(), featuredBy: grace }
    show(kind, subject)
    expect(screen.getByText(sentence)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Art' })).toHaveAttribute('href', '/discover/art')
  })
})

describe('user notifications', () => {
  it('says an invitation was accepted', () => {
    show('invitation_accepted_post', { __typename: 'User', ...grace })
    expect(screen.getByText(/accepted your invitation/)).toBeInTheDocument()
  })

  it('welcomes', () => {
    const { container } = show('welcome_notification', { __typename: 'User', ...gqlAuthor() })
    expect(container.innerHTML).toBe('<p>Welcome to Ello!</p>')
  })
})

describe('on a repost', () => {
  it('love on your repost', () => {
    show('love_on_repost_notification', { __typename: 'Love', id: 'l1', post: repost, user: gqlAuthor('mara', 'u4') })
    expect(screen.getByText(/loved your/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'repost' })).toHaveAttribute('href', '/grace/post/tokrp')
  })

  it('love on a repost of your post links both', () => {
    show('love_on_original_post_notification', { __typename: 'Love', id: 'l1', post: repost, user: gqlAuthor('mara', 'u4') })
    expect(screen.getByRole('link', { name: '@grace' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'repost' })).toHaveAttribute('href', '/grace/post/tokrp')
    expect(screen.getByRole('link', { name: 'post' })).toHaveAttribute('href', '/theo/post/tokorig')
    expect(screen.getByText(/'s/)).toBeInTheDocument()
  })

  const comment = {
    __typename: 'Comment',
    id: 'c1',
    createdAt,
    author: gqlAuthor('mara', 'u4'),
    content: [textRegion('<p>Nice find</p>')],
    parentPost: repost,
  }

  it('comment on your repost quotes the repost and the comment', () => {
    show('comment_on_repost_notification', comment)
    expect(screen.getByText(/commented on your/)).toBeInTheDocument()
    expect(screen.getByText('Nice find')).toBeInTheDocument()
  })

  it('comment on a repost of your post quotes the original', () => {
    const { container } = show('comment_on_original_post_notification', comment)
    expect(container.querySelector('.CommentOnPostNotification')).not.toBeNull()
    expect(screen.getByText('Original words')).toBeInTheDocument()
    expect(screen.getByText('Nice find')).toBeInTheDocument()
    expect(screen.getByText(/of your/)).toBeInTheDocument()
  })

  it('skips an "on original" notification whose repost lost its source', () => {
    const { container } = show('love_on_original_post_notification', { __typename: 'Love', id: 'l1', post: gqlPost('p1'), user: grace })
    expect(container).toBeEmptyDOMElement()
  })

  it('watch variants', () => {
    show('watch_comment_notification', comment)
    expect(screen.getByText(/you're watching\./)).toBeInTheDocument()
  })
})
