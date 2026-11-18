'use client'

import { useCallback } from 'react'
import { resolveEmbed } from '@/actions/post-edit-actions'
import { useComposerApi } from '@/stores/composer-store'
import { toast } from '@/stores/toast-store'
import { matchEmbed } from '@/utils/embed-services'

/** The original's `checkForEmbeds`: pasted media links are resolved by the API and added as embed blocks. */
export const useEmbedPaste = (): ((text: string) => void) => {
  const api = useComposerApi()
  return useCallback(
    (text: string): void => {
      const match = matchEmbed(text)
      if (!match) return
      void resolveEmbed(match.url).then((result) => {
        if (!result.ok) {
          toast.error(result.error)
          return
        }
        api.getState().addEmbed(result.data)
      })
    },
    [api],
  )
}
