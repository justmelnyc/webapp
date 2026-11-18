import { z } from 'zod'

export const externalLinkSchema = z.object({
  url: z.string().trim().url('Enter a full URL, e.g. https://example.com'),
  text: z.string().trim(),
})

/** The original's `getPasswordState`: 8 to 128 characters (an empty field means "keep my password"). */
export const newPasswordSchema = z
  .string()
  .refine((value) => value.length === 0 || /^.{8,128}$/.test(value), 'Password must be at least 8 characters.')

/** The original's `ERROR_MESSAGES` (constants/locales/en.js) for the credentials fields. */
export const USERNAME_ERRORS = {
  spaces: 'Username must not contain a space.',
  invalidCharacters: 'Username must only contain letters, numbers, underscores & dashes.',
  exists: 'Username already exists. Please try a new one. You can change your username at any time',
} as const
export const EMAIL_ERRORS = { invalid: 'That email is invalid. Please try again.' } as const

/** Username, email and password: saved together with the current password (the original's credentials form). */
export const credentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .max(50, 'Usernames can be up to 50 characters')
    .refine((value) => !/\s/.test(value), USERNAME_ERRORS.spaces)
    .refine((value) => value.length === 0 || /^[a-zA-Z0-9\-_]+$/.test(value), USERNAME_ERRORS.invalidCharacters),
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

/** POST /api/v2/availability: one field at a time, as the original asks. */
export const availabilityInputSchema = z.union([
  z.object({ username: z.string() }),
  z.object({ email: z.string() }),
])
export type AvailabilityInput = z.infer<typeof availabilityInputSchema>

export const availabilityResponseSchema = z.object({
  availability: z.object({
    username: z.boolean().optional(),
    email: z.boolean().optional(),
    suggestions: z
      .object({
        username: z.array(z.string()).nullish(),
        email: z.object({ full: z.string().nullish() }).nullish(),
      })
      .default({}),
  }),
})
export type Availability = z.infer<typeof availabilityResponseSchema>['availability']

export const exportResponseSchema = z.object({ exportUrl: z.string().url() })

/** A 422 from PATCH /api/v2/profile: `attrs` maps a field (snake_case) to what is wrong with it. */
export const credentialErrorsSchema = z.object({
  errors: z.object({ attrs: z.record(z.string(), z.string()).default({}) }),
})

export type CredentialField = 'username' | 'email' | 'password' | 'currentPassword'
export type CredentialFieldErrors = Partial<Record<CredentialField, string>>
