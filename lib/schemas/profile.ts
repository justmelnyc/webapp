import { z } from 'zod'

export const externalLinkSchema = z.object({
  url: z.string().trim().url('Enter a full URL, e.g. https://example.com'),
  text: z.string().trim(),
})

export const profileSchema = z.object({
  name: z.string().trim().max(50, 'Names can be up to 50 characters'),
  username: z
    .string()
    .trim()
    .min(3, 'Usernames are at least 3 characters')
    .max(20, 'Usernames can be up to 20 characters')
    .regex(/^[a-z0-9_]+$/, 'Use lowercase letters, numbers and underscores only'),
  email: z.string().trim().email('Enter a valid email address'),
  bio: z.string().max(375, 'Bios can be up to 375 characters'),
  location: z.string().trim().max(50, 'Locations can be up to 50 characters'),
  links: z.array(externalLinkSchema).max(10, 'You can add up to 10 links'),
})

export type ProfileInput = z.infer<typeof profileSchema>

export const imageKindSchema = z.enum(['avatar', 'cover'])
export type ImageKind = z.infer<typeof imageKindSchema>

export const preferenceKeySchema = z.string().regex(/^[a-z_]+$/)
