'use server'

import { z } from 'zod'
import { rest } from '@/lib/api/client'
import { errorMessage } from '@/lib/errors'
import { failure, success, type ActionResult } from '@/types/action'

const credentialsSchema = z.object({
  credentials: z.object({
    access_key: z.string(),
    policy: z.string(),
    signature: z.string(),
    prefix: z.string(),
    endpoint: z.string(),
  }),
})

export type UploadCredentials = z.infer<typeof credentialsSchema>['credentials']

/** Ask the API for short-lived S3 form credentials. Uploads then go browser -> storage directly. */
export const getUploadCredentials = async (): Promise<ActionResult<UploadCredentials>> => {
  try {
    const data = await rest('/api/v2/assets/credentials', credentialsSchema)
    return success(data.credentials)
  } catch (error) {
    return failure(errorMessage(error))
  }
}
