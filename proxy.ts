import { NextResponse, type NextRequest } from 'next/server'
import { lowercaseUsernamePath } from '@/lib/lowercase-username'

export const proxy = (request: NextRequest): NextResponse => {
  const target = lowercaseUsernamePath(request.nextUrl.pathname)
  if (!target) return NextResponse.next()
  const url = request.nextUrl.clone()
  url.pathname = target
  return NextResponse.redirect(url)
}

export const config = { matcher: '/((?!_next/|api/|.*\\..*).*)' }
