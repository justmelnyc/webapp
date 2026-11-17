import { z } from 'zod'

export const externalLinkSchema = z.object({
  url: z.string().trim().url('Enter a full URL, e.g. https://example.com'),
  text: z.string().trim(),
})

/** The original's `getPasswordState`: 8 to 128 characters (an empty field means "keep my password"). */
export const newPasswordSchema = z
  .string()
  .refine((value) => value.length === 0 || /^.{8,128}$/.test(value), 'Password must be at least 8 characters.')

/** Username, email and password: saved together with the current password (the original's credentials form). */
export const credentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Usernames are at least 3 characters')
    .max(20, 'Usernames can be up to 20 characters')
    .regex(/^[a-z0-9_]+$/, 'Use lowercase letters, numbers and underscores only'),
  email: z.string().trim().email('Enter a valid email address'),
  password: newPasswordSchema,
  currentPassword: z.string(),
})

/** Name, location, bio and links: autosaved as they change (the original's InfoForm). */
export const infoSchema = z.object({
  name: z.string().trim().max(50, 'Names can be up to 50 characters'),
  bio: z.string().max(375, 'Bios can be up to 375 characters'),
  location: z.string().trim().max(50, 'Locations can be up to 50 characters'),
  links: z.array(externalLinkSchema).max(10, 'You can add up to 10 links'),
})

export type CredentialsInput = z.infer<typeof credentialsSchema>
export type InfoInput = z.infer<typeof infoSchema>

export const imageKindSchema = z.enum(['avatar', 'cover'])
export type ImageKind = z.infer<typeof imageKindSchema>

export const preferenceKeySchema = z.string().regex(/^[a-z_]+$/)

export const creatorTypeIdsSchema = z.array(z.number().int().positive())
