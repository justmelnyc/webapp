'use server'

import { rest } from '@/lib/api/client'
import { API_ORIGIN } from '@/lib/env'
import { errorMessage } from '@/lib/errors'
import { emojiListSchema, type EmojiSet } from '@/lib/schemas/emoji'
import { failure, success, type ActionResult } from '@/types/action'

/** The emoji set the `:` completer suggests from (the original's `loadEmojis`: `${AUTH_DOMAIN}/emojis.json`). */
export const fetchEmojis = async (): Promise<ActionResult<EmojiSet>> => {
  try {
    const data = await rest('/emojis.json', emojiListSchema, { anonymous: true })
    return success({
      origin: API_ORIGIN,
      emojis: data.emojis.map(({ name, image_url }) => ({ name, imageUrl: image_url })),
    })
  } catch (error) {
    return failure(errorMessage(error))
  }
}
