import 'server-only'
import { z } from 'zod'
import { rest } from '@/lib/api/client'

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

export const getPreferenceSections = async (): Promise<PreferenceSection[]> => {
  const [definitions, profile] = await Promise.all([
    rest('/api/v2/profile/settings', settingsSchema),
    rest('/api/v2/profile', valuesSchema),
  ])
  return definitions.settings.map((section) => ({
    label: section.label,
    items: section.items.map((item) => ({
      key: item.key,
      label: item.label,
      info: item.info ?? '',
      value: profile.users[camel(item.key)] === true,
    })),
  }))
}
