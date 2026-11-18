import { NextResponse, type NextRequest } from 'next/server'
import { fetchStream } from '@/services/streams'
import { isApiError } from '@/lib/errors'
import { streamSpecSchema } from '@/types/stream'

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const params = request.nextUrl.searchParams
  let raw: unknown
  try {
    raw = JSON.parse(params.get('spec') ?? '')
  } catch {
    return NextResponse.json({ error: 'Invalid spec' }, { status: 400 })
  }
  const spec = streamSpecSchema.safeParse(raw)
  if (!spec.success) return NextResponse.json({ error: 'Invalid spec' }, { status: 400 })
  try {
    return NextResponse.json(await fetchStream(spec.data, params.get('before')))
  } catch (error) {
    const status = isApiError(error) && error.status >= 400 ? error.status : 502
    return NextResponse.json({ error: 'Could not load posts' }, { status })
  }
}
