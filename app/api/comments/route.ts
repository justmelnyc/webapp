import { NextResponse, type NextRequest } from 'next/server'
import { isApiError } from '@/lib/errors'
import { commentQuerySchema } from '@/lib/schemas/comment'
import { getComments } from '@/services/posts'

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const params = request.nextUrl.searchParams
  const query = commentQuerySchema.safeParse({ postId: params.get('postId'), before: params.get('before') })
  if (!query.success) return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
  try {
    return NextResponse.json(await getComments(query.data.postId, query.data.before))
  } catch (error) {
    const status = isApiError(error) && error.status >= 400 ? error.status : 502
    return NextResponse.json({ error: 'Could not load comments' }, { status })
  }
}
