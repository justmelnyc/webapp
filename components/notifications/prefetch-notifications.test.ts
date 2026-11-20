import { QueryClient, type InfiniteData } from '@tanstack/react-query'
import type { NotificationPage } from '@/types/notification'
import { ALL_NOTIFICATIONS_KEY, prefetchNotifications } from './prefetch-notifications'

const page: NotificationPage = { notifications: [], next: null, isLastPage: true }

describe('prefetchNotifications', () => {
  it('puts the first page of the All tab where the list reads it', async () => {
    const queryClient = new QueryClient()
    const fetchPage = jest.fn().mockResolvedValue(page)
    await prefetchNotifications(queryClient, fetchPage)
    expect(fetchPage).toHaveBeenCalledWith('all', null)
    expect(queryClient.getQueryData<InfiniteData<NotificationPage>>(ALL_NOTIFICATIONS_KEY)).toEqual({ pages: [page], pageParams: [null] })
  })

  it('swallows a failure and leaves nothing behind', async () => {
    const queryClient = new QueryClient()
    await expect(prefetchNotifications(queryClient, jest.fn().mockRejectedValue(new Error('offline')))).resolves.toBeUndefined()
    expect(queryClient.getQueryData(ALL_NOTIFICATIONS_KEY)).toBeUndefined()
  })
})
