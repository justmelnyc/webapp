import { z } from 'zod'

/** The reasons the original's FlagDialog offers, in order, with their labels. */
export const FLAG_CHOICES = [
  ['spam', 'Spam'],
  ['violence', 'Violence'],
  ['copyright', 'Copyright infringement'],
  ['threatening', 'Threatening'],
  ['hate_speech', 'Hate Speech'],
  ['adult', "Adult content that isn't marked NSFW*"],
  ['offensive', "I don't like it"],
] as const

export const flagKindSchema = z.enum(['spam', 'violence', 'copyright', 'threatening', 'hate_speech', 'adult', 'offensive'])
export type FlagKind = z.infer<typeof flagKindSchema>

export const relationshipPrioritySchema = z.enum(['friend', 'inactive', 'block', 'mute'])
export type RelationshipPriority = z.infer<typeof relationshipPrioritySchema>

export const messageKindSchema = z.enum(['collaborate', 'hire_me'])
export type MessageKind = z.infer<typeof messageKindSchema>

export const messageSchema = z.object({ message: z.string().trim().min(1, 'Write a message first').max(5000) })
