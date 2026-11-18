import 'server-only'
import { z } from 'zod'
import { graphql } from '@/lib/api/client'

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  order: z.number().nullish(),
  allowInOnboarding: z.boolean().nullish(),
  tileImage: z.object({ large: z.object({ url: z.string() }).nullish() }).nullish(),
})

const QUERY = `query { allCategories { id name slug order allowInOnboarding tileImage { large { url } } } }`

export interface OnboardingCategory {
  id: string
  name: string
  slug: string
  imageUrl: string | null
}

/** The original's `selectOnboardingCategoriesFiltered`: the categories that can be picked while onboarding. */
export const toOnboardingCategories = (categories: Array<z.infer<typeof categorySchema>>): OnboardingCategory[] =>
  categories
    .filter((category) => category.allowInOnboarding)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(({ id, name, slug, tileImage }) => ({ id, name, slug, imageUrl: tileImage?.large?.url ?? null }))

export const getOnboardingCategories = async (): Promise<OnboardingCategory[]> => {
  const data = await graphql(QUERY, {}, z.object({ allCategories: z.array(categorySchema) }))
  return toOnboardingCategories(data.allCategories)
}
