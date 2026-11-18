import { gqlAuthor, gqlPost } from '@/test/fixtures/posts'
import { isNotificationTab, notificationPageSchema } from './notification'

const love = (id = 'n1') => ({
  id,
  kind: 'love_notification',
  subjectType: 'Love',
  createdAt: '2026-01-03T00:00:00.000Z',
  subject: { __typename: 'Love', id: 'l1', post: gqlPost('p1'), user: gqlAuthor('grace', 'u2') },
})

const page = (notifications: unknown[]) => ({ next: null, isLastPage: true, notifications })

describe('notificationPageSchema', () => {
  it('parses love, comment, post and user subjects', () => {
    const comment = {
      id: 'n2',
      kind: 'comment_notification',
      subjectType: 'Comment',
      createdAt: '2026-01-03T00:00:00.000Z',
      subject: {
        __typename: 'Comment',
        id: 'c1',
        createdAt: '2026-01-03T00:00:00.000Z',
        author: gqlAuthor('grace', 'u2'),
        content: [],
        parentPost: gqlPost('p1'),
      },
    }
    const follower = {
      id: 'n3',
      kind: 'new_follower_post',
      subjectType: 'User',
      createdAt: '2026-01-03T00:00:00.000Z',
      subject: { __typename: 'User', ...gqlAuthor('theo', 'u3') },
    }
    const repost = { ...love('n4'), kind: 'repost_notification', subject: { __typename: 'Post', ...gqlPost('p2') } }
    const parsed = notificationPageSchema.parse(page([love(), comment, follower, repost]))
    expect(parsed.notifications.map((n) => n.kind)).toEqual([
      'love_notification',
      'comment_notification',
      'new_follower_post',
      'repost_notification',
    ])
  })

  it('drops kinds the app cannot render and malformed subjects instead of failing the page', () => {
    const unknown = { ...love('n5'), kind: 'welcome_notification' }
    const broken = { ...love('n6'), subject: { __typename: 'Love', id: 'l2' } }
    const parsed = notificationPageSchema.parse(page([unknown, broken, love('n7')]))
    expect(parsed.notifications.map((n) => n.id)).toEqual(['n7'])
  })

  it('requires the paging fields', () => {
    expect(notificationPageSchema.safeParse({ notifications: [] }).success).toBe(false)
  })
})

describe('isNotificationTab', () => {
  it('accepts the six tabs only', () => {
    expect(['all', 'comments', 'mentions', 'loves', 'reposts', 'relationships'].every(isNotificationTab)).toBe(true)
    expect(isNotificationTab('watches')).toBe(false)
    expect(isNotificationTab(undefined)).toBe(false)
  })
})
