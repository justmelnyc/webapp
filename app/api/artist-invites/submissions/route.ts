import { NextResponse, type NextRequest } from 'next/server'
import { isApiError } from '@/lib/errors'
import { getSubmissionPage } from '@/services/artist-invites'

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const params = request.nextUrl.searchParams
  const href = params.get('href') ?? ''
  const page = Number(params.get('page')) || 1
  // Only the artist invite streams of our own API may be read through here.
  if (!/^(https?:\/\/[^/]+)?\/api\/v2\/artist_invites\/[\w~-]+\/\w+_submissions(\?|$)/.test(href)) {
    return NextResponse.json({ error: 'Invalid stream' }, { status: 400 })
  }
  try {
    return NextResponse.json(await getSubmissionPage(href, page))
  } catch (error) {
    const status = isApiError(error) && error.status >= 400 ? error.status : 502
    return NextResponse.json({ error: 'Could not load submissions' }, { status })
  }
}
