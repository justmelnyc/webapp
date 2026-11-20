import { z } from 'zod'
import { authorSchema } from './user'

/** A curator or moderator of a category (GraphQL `CategoryUser`). */
export const categoryUserSchema = z.object({
  id: z.string(),
  role: z.enum(['CURATOR', 'MODERATOR']),
  user: authorSchema,
})

/** The `category(slug)` query: what the info panel of a category page shows. */
export const categoryDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullish(),
  /** Categories that belong to a brand keep their info panel open (the original's `brandAccountId`). */
  brandAccount: authorSchema.nullish(),
  categoryUsers: z.array(categoryUserSchema).nullish(),
})

/** A user offered by the add-role dialog (`userQuickSearchQuery`). */
export const quickSearchUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  avatar: z.object({ small: z.object({ url: z.string().nullable() }).nullish() }).nullish(),
})

export const addRoleInputSchema = z.object({
  userId: z.string().min(1),
  categoryId: z.string().min(1),
  role: z.enum(['curator', 'moderator']),
  /** The category's slug, to read its roles back once the new one is stored. */
  slug: z.string().min(1),
})

/** A category the viewer administers, with their role there (`searchCategories(administered: true)`). */
export const administeredCategorySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    currentUserState: z.object({ role: z.enum(['CURATOR', 'MODERATOR']).nullish() }).nullish(),
  })
  .transform(({ currentUserState, ...category }) => ({ ...category, role: currentUserState?.role ?? null }))

/** What the profile's Community Roles form submits (the original's `roleParams`). */
export const profileRoleInputSchema = z.object({
  userId: z.string().min(1),
  categoryId: z.string().min(1),
  role: z.enum(['featured', 'curator', 'moderator']),
  /** Whose profile it is, to refresh that page. */
  username: z.string().min(1),
})

export type CategoryUser = z.infer<typeof categoryUserSchema>
export type CategoryDetails = z.infer<typeof categoryDetailsSchema>
export type QuickSearchUser = z.infer<typeof quickSearchUserSchema>
export type AddRoleInput = z.infer<typeof addRoleInputSchema>
export type AdministeredCategory = z.infer<typeof administeredCategorySchema>
export type ProfileRoleInput = z.infer<typeof profileRoleInputSchema>
