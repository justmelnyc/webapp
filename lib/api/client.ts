import 'server-only'
import { z } from 'zod'
import { API_ORIGIN } from '@/lib/env'
import { ApiError, NotFoundError, UnauthorizedError } from '@/lib/errors'
import { getToken } from '@/lib/session'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  /** Skip the signed-in user's token (for public data that should cache the same for everyone). */
  anonymous?: boolean
}

const request = async (path: string, options: RequestOptions = {}): Promise<Response> => {
  const { method = 'GET', body, anonymous = false } = options
  const token = anonymous ? null : await getToken()
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  try {
    return await fetch(`${API_ORIGIN}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    })
  } catch {
    throw new ApiError(0, `Could not reach the API at ${API_ORIGIN}. Is the mock running (yarn mock)?`)
  }
}

const failure = async (response: Response): Promise<ApiError> => {
  if (response.status === 401) return new UnauthorizedError()
  if (response.status === 404) return new NotFoundError()
  const detail = await response.text().catch(() => '')
  return new ApiError(response.status, detail.slice(0, 200) || response.statusText, detail.slice(0, 4000))
}

const graphQlEnvelope = z.object({
  data: z.unknown().optional(),
  errors: z.array(z.object({ message: z.string() })).optional(),
})

/** Run a GraphQL query and validate the result against `schema`. */
export const graphql = async <S extends z.ZodType>(
  query: string,
  variables: Record<string, unknown>,
  schema: S,
  options: Pick<RequestOptions, 'anonymous'> = {},
): Promise<z.infer<S>> => {
  const response = await request('/api/v3/graphql', { method: 'POST', body: { query, variables }, ...options })
  if (!response.ok) throw await failure(response)
  const envelope = graphQlEnvelope.parse(await response.json())
  const first = envelope.errors?.[0]
  if (first) {
    throw /not found/i.test(first.message) ? new NotFoundError(first.message) : new ApiError(200, first.message)
  }
  return schema.parse(envelope.data)
}

/** Call a v2 REST endpoint and validate the JSON result against `schema`. */
export const rest = async <S extends z.ZodType>(
  path: string,
  schema: S,
  options: RequestOptions = {},
): Promise<z.infer<S>> => {
  const response = await request(path, options)
  if (!response.ok) throw await failure(response)
  return schema.parse(await response.json())
}

/** Call a v2 REST endpoint where only success matters (204 or an ignored body). */
export const restVoid = async (path: string, options: RequestOptions = {}): Promise<void> => {
  const response = await request(path, options)
  if (!response.ok) throw await failure(response)
}
