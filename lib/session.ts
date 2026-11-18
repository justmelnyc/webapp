import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { z } from 'zod'

export const TOKEN_COOKIE = 'ello_token'

const claimsSchema = z.object({
  data: z.object({ id: z.coerce.string(), username: z.string() }),
  exp: z.number().optional(),
})

export interface SessionClaims {
  id: string
  username: string
}

export const getToken = async (): Promise<string | null> => {
  const store = await cookies()
  return store.get(TOKEN_COOKIE)?.value ?? null
}

export const setToken = async (token: string, maxAgeSeconds: number): Promise<void> => {
  const store = await cookies()
  store.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
  })
}

export const clearToken = async (): Promise<void> => {
  const store = await cookies()
  store.delete(TOKEN_COOKIE)
}

const decodeClaims = (token: string): SessionClaims | null => {
  const payload = token.split('.')[1]
  if (!payload) return null
  try {
    const parsed = claimsSchema.safeParse(JSON.parse(Buffer.from(payload, 'base64url').toString()))
    return parsed.success ? parsed.data.data : null
  } catch {
    return null
  }
}

/** Who is signed in, from the token's claims. Deduplicated per request. */
export const getSession = cache(async (): Promise<SessionClaims | null> => {
  const token = await getToken()
  return token ? decodeClaims(token) : null
})
