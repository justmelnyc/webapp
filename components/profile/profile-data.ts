import 'server-only'
import { cache } from 'react'
import { getUser } from '@/services/users'

/** One profile fetch per request, shared by the layout and its pages. */
export const getProfile = cache(getUser)
