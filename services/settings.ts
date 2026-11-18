import 'server-only'
import { z } from 'zod'
import { graphql, rest } from '@/lib/api/client'

const settingsSchema = z.object({
  settings: z.array(
    z.object({
      label: z.string(),
      items: z.array(z.object({ key: z.string(), label: z.string(), info: z.string().nullish() })),
    }),
  ),
})

/** The flat profile carries each preference as a camelCase boolean; read them loosely. */
const valuesSchema = z.object({ users: z.record(z.string(), z.unknown()) })

const creatorTypesSchema = z.object({
  allCategories: z.array(z.object({ id: z.string(), name: z.string(), isCreatorType: z.boolean().nullish() })),
})

const CREATOR_TYPES = `query { allCategories { id name isCreatorType } }`

export interface PreferenceItem {
  key: string
  label: string
  info: string
  value: boolean
}

export interface PreferenceSection {
  label: string
  items: PreferenceItem[]
}

const camel = (key: string): string => key.replace(/_(\w)/g, (_, c: string) => c.toUpperCase())

export interface Preferences {
  sections: PreferenceSection[]
  /** The NSFW section is hard-coded in the original; only its two values come from the profile. */
  adult: { viewsAdultContent: boolean; postsAdultContent: boolean }
}

export const getPreferences = async (): Promise<Preferences> => {
  const [definitions, profile] = await Promise.all([
    rest('/api/v2/profile/settings', settingsSchema),
    rest('/api/v2/profile', valuesSchema),
  ])
  return {
    sections: definitions.settings.map((section) => ({
      label: section.label,
      items: section.items.map((item) => ({
        key: item.key,
        label: item.label,
        info: item.info ?? '',
        value: profile.users[camel(item.key)] === true,
      })),
    })),
    adult: {
      viewsAdultContent: profile.users.viewsAdultContent === true,
      postsAdultContent: profile.users.postsAdultContent === true,
    },
  }
}

export interface CreatorTypes {
  categories: Array<{ id: number; name: string }>
  selectedIds: number[]
}

/** The categories people can pick as what they make, and the ones the viewer has picked. */
export const getCreatorTypes = async (): Promise<CreatorTypes> => {
  const [data, profile] = await Promise.all([
    graphql(CREATOR_TYPES, {}, creatorTypesSchema),
    rest('/api/v2/profile', valuesSchema),
  ])
  const selected = z.array(z.coerce.number()).safeParse(profile.users.creatorTypeCategoryIds)
  return {
    categories: data.allCategories.filter((c) => c.isCreatorType).map((c) => ({ id: Number(c.id), name: c.name })),
    selectedIds: selected.success ? selected.data : [],
  }
}
