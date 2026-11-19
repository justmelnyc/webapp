import { z } from 'zod'

/** One entry of the API's `/emojis.json`. */
export const emojiSchema = z.object({
  name: z.string(),
  image_url: z.string(),
})

export const emojiListSchema = z.object({ emojis: z.array(emojiSchema) })

export interface Emoji {
  name: string
  imageUrl: string
}

/** The emoji set plus the origin its `/images/emoji/<name>.png` pictures live on. */
export interface EmojiSet {
  origin: string
  emojis: Emoji[]
}
