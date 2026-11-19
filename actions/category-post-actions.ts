'use server'

import { errorMessage } from '@/lib/errors'
import { sendCategoryPostAction, type CategoryPostRecord } from '@/services/category-posts'
import { failure, success, type ActionResult } from '@/types/action'
import { categoryPostActionSchema } from '@/types/post'

const PATH = /^\/api\/v2\/category_posts\/\d+-\d+\/(feature|unfeature)$/

/** Run a category post's feature or unfeature action (the API hands the client the method and href). */
export const runCategoryPostAction = async (input: unknown): Promise<ActionResult<CategoryPostRecord>> => {
  const parsed = categoryPostActionSchema.safeParse(input)
  if (!parsed.success || !PATH.test(parsed.data.href)) return failure('Invalid action')
  try {
    const record = await sendCategoryPostAction(parsed.data.href, parsed.data.method)
    return success(record)
  } catch (error) {
    return failure(errorMessage(error))
  }
}
