import 'server-only'
import { z } from 'zod'
import { rest } from '@/lib/api/client'
import { categoryPostActionSchema } from '@/types/post'

export const categoryPostRecordSchema = z.object({
  id: z.string(),
  status: z.string(),
  submittedByUsername: z.string().nullish(),
  featuredByUsername: z.string().nullish(),
  actions: z.object({ feature: categoryPostActionSchema.nullish(), unfeature: categoryPostActionSchema.nullish() }).nullish(),
})

export type CategoryPostRecord = z.infer<typeof categoryPostRecordSchema>

/** A curator's feature or unfeature: the API answers with the category post's new status and actions. */
export const sendCategoryPostAction = async (href: string, method: string): Promise<CategoryPostRecord> => {
  const verb = method.toUpperCase() === 'PATCH' ? 'PATCH' : 'PUT'
  const data = await rest(href, z.object({ categoryPosts: categoryPostRecordSchema }), { method: verb })
  return data.categoryPosts
}
