import 'server-only'
import { z } from 'zod'
import { API_ORIGIN } from '@/lib/env'
import { ApiError } from '@/lib/errors'

const tokenSchema = z.object({ access_token: z.string(), expires_in: z.number() })

export interface TokenResult {
  token: string
  expiresIn: number
}

/** Exchange credentials for an access token. Throws ApiError(401) on bad credentials. */
export const requestToken = async (email: string, password: string): Promise<TokenResult> => {
  const response = await fetch(`${API_ORIGIN}/api/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password, grant_type: 'password', client_id: 'webapp' }),
    cache: 'no-store',
  }).catch(() => {
    throw new ApiError(0, `Could not reach the API at ${API_ORIGIN}. Is the mock running (yarn mock)?`)
  })
  if (response.status === 401) throw new ApiError(401, 'We could not find an account with those details.')
  if (!response.ok) throw new ApiError(response.status, 'Login failed')
  const body = tokenSchema.parse(await response.json())
  return { token: body.access_token, expiresIn: body.expires_in }
}
