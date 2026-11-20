import { QueryClient, QueryClientProvider, type InfiniteData } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { fetchNotificationPage } from '@/lib/client/notifications'
import { useNewPostsStore } from '@/stores/new-posts-store'
import type { Notification, NotificationPage } from '@/types/notification'
import { notificationsQueryKey, useNewNotifications } from './use-new-notifications'

jest.mock('@/lib/client/notifications', () => ({ fetchNotificationPage: jest.fn() }))

const fetchMock = jest.mocked(fetchNotificationPage)
const queryKey = notificationsQueryKey('all')
// only the id matters to the hook
const page = (ids: string[]): NotificationPage => ({ notifications: ids.map((id) => ({ id }) as Notification), next: null, isLastPage: true })

const setup = (shown: string[] | null) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  if (shown) client.setQueryData<InfiniteData<NotificationPage, string | null>>(queryKey, { pages: [page(shown)], pageParams: [null] })
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
  return { client, ...renderHook(() => useNewNotifications('all'), { wrapper }) }
}
const shownIds = (client: QueryClient): string[] =>
  client.getQueryData<InfiniteData<NotificationPage>>(queryKey)?.pages.flatMap((p) => p.notifications.map((n) => n.id)) ?? []

describe('useNewNotifications', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    window.scrollTo = jest.fn()
    useNewPostsStore.setState({ count: 0, apply: null })
  })

  it('keeps the feed it has and offers what is new behind the button', async () => {
    fetchMock.mockResolvedValue(page(['n2', 'n1', 'a', 'b']))
    const { client } = setup(['a', 'b'])
    await waitFor(() => expect(useNewPostsStore.getState().count).toBe(2))
    expect(fetchMock).toHaveBeenCalledWith('all', null)
    expect(shownIds(client)).toEqual(['a', 'b'])
    act(() => useNewPostsStore.getState().apply?.())
    expect(shownIds(client)).toEqual(['n2', 'n1', 'a', 'b'])
    expect(useNewPostsStore.getState().count).toBe(0)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0 })
  })

  it('stays quiet when nothing is new or nothing is shown yet', async () => {
    fetchMock.mockResolvedValue(page(['a', 'b']))
    setup(['a', 'b'])
    setup(null)
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(useNewPostsStore.getState().count).toBe(0)
  })

  it('takes the offer back when the page is left', async () => {
    fetchMock.mockResolvedValue(page(['n1', 'a']))
    const { unmount } = setup(['a'])
    await waitFor(() => expect(useNewPostsStore.getState().count).toBe(1))
    unmount()
    expect(useNewPostsStore.getState().count).toBe(0)
  })
})
