import 'server-only'
import { cache } from 'react'
import { z } from 'zod'
import { rest } from '@/lib/api/client'
import { isApiError } from '@/lib/errors'
import { getSession } from '@/lib/session'
import { viewerSchema, type Viewer } from '@/types/user'

const profileEnvelope = z.object({ users: viewerSchema })

/** The signed-in user's full profile, or null when logged out. Deduplicated per request. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (!(await getSession())) return null
  try {
    const data = await rest('/api/v2/profile', profileEnvelope)
    return data.users
  } catch (error) {
    if (isApiError(error) && error.status === 401) return null
    throw error
  }
})
