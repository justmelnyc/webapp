import { NextResponse, type NextRequest } from 'next/server'
import { isApiError } from '@/lib/errors'
import { fetchNotifications } from '@/services/notifications'
import { notificationTabSchema } from '@/types/notification'

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const params = request.nextUrl.searchParams
  const tab = notificationTabSchema.safeParse(params.get('tab') ?? 'all')
  if (!tab.success) return NextResponse.json({ error: 'Invalid tab' }, { status: 400 })
  try {
    return NextResponse.json(await fetchNotifications(tab.data, params.get('before')))
  } catch (error) {
    const status = isApiError(error) && error.status >= 400 ? error.status : 502
    return NextResponse.json({ error: 'Could not load notifications' }, { status })
  }
}
