import 'server-only'
import { cache } from 'react'
import { z } from 'zod'
import { graphql } from '@/lib/api/client'
import { CATEGORIES, EDITORIALS, PAGE_HEADERS } from '@/constants/queries'
import { sanitizePost } from '@/services/sanitize'
import { categorySchema, editorialSchema, pageHeaderSchema, type Category, type Editorial, type PageHeader } from '@/types/content'

/** Per request: the navbar, the page and its metadata all ask for the categories. */
export const getCategories = cache(async (): Promise<Category[]> => {
  const data = await graphql(CATEGORIES, {}, z.object({ allCategories: z.array(categorySchema) }))
  return data.allCategories
})

export const getPageHeader = cache(async (kind: string, slug?: string): Promise<PageHeader | null> => {
  const data = await graphql(PAGE_HEADERS, { kind, slug }, z.object({ pageHeaders: z.array(pageHeaderSchema) }))
  return data.pageHeaders[0] ?? null
})

export const getEditorials = async (): Promise<Editorial[]> => {
  const schema = z.object({ editorialStream: z.object({ editorials: z.array(editorialSchema) }) })
  const data = await graphql(EDITORIALS, {}, schema)
  return data.editorialStream.editorials.map((e) => ({ ...e, post: e.post ? sanitizePost(e.post) : e.post }))
}
