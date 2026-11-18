'use server'

import { redirect } from 'next/navigation'
import { rest, restVoid } from '@/lib/api/client'
import { errorMessage } from '@/lib/errors'
import {
  availabilityInputSchema,
  availabilityResponseSchema,
  exportResponseSchema,
  type Availability,
} from '@/lib/schemas/profile'
import { clearToken } from '@/lib/session'
import { failure, success, type ActionResult } from '@/types/action'

/** The original's `checkAvailability`: is this username (or email) free? */
export const checkAvailability = async (input: unknown): Promise<ActionResult<Availability>> => {
  const parsed = availabilityInputSchema.safeParse(input)
  if (!parsed.success) return failure('Nothing to check')
  try {
    const data = await rest('/api/v2/availability', availabilityResponseSchema, { method: 'POST', body: parsed.data })
    return success(data.availability)
  } catch (error) {
    return failure(errorMessage(error))
  }
}

/** The original's `exportData`: builds the export and returns where to download it. */
export const requestDataExport = async (): Promise<ActionResult<{ url: string }>> => {
  try {
    const data = await rest('/api/v2/profile/export', exportResponseSchema, { method: 'POST' })
    return success({ url: data.exportUrl })
  } catch (error) {
    return failure(errorMessage(error))
  }
}

/** The original's `deleteProfile`: removes the account, drops the session and goes to the homepage. */
export const deleteAccount = async (): Promise<ActionResult> => {
  try {
    await restVoid('/api/v2/profile', { method: 'DELETE' })
  } catch (error) {
    return failure(errorMessage(error))
  }
  await clearToken()
  return redirect('/')
}
