'use client'

import { useEffect, useState } from 'react'
import { fetchEmojis } from '@/actions/emoji-actions'
import type { EmojiSet } from '@/lib/schemas/emoji'
import type { ActionResult } from '@/types/action'

// Fetched once and kept, like the original's `state.emoji`.
let loaded: EmojiSet | null = null
let pending: Promise<ActionResult<EmojiSet>> | null = null

export const loadEmojiSet = (): Promise<ActionResult<EmojiSet>> => {
  if (loaded) return Promise.resolve({ ok: true, data: loaded })
  pending ??= fetchEmojis().then((result) => {
    if (result.ok) loaded = result.data
    pending = null
    return result
  })
  return pending
}

/** Where emoji pictures live; '' until the set has loaded. Starts the load when the editor mounts. */
export const useEmojiOrigin = (): string => {
  const [origin, setOrigin] = useState(loaded?.origin ?? '')
  useEffect(() => {
    let live = true
    void loadEmojiSet().then((result) => {
      if (live && result.ok) setOrigin(result.data.origin)
    })
    return () => {
      live = false
    }
  }, [])
  return origin
}
