'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { createPost } from '@/actions/composer-actions'
import type { CreatePostInput } from '@/lib/schemas/post'
import { useComposerStore } from '@/stores/composer-store'
import { toast } from '@/stores/toast-store'

export const useSubmitPost = (): { submit: () => void; isPending: boolean } => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const submit = (): void => {
    const state = useComposerStore.getState()
    if (state.isSubmitting) return // block double-submit
    state.setSubmitting(true)
    const blocks = state.blocks.flatMap((b): CreatePostInput['blocks'] => {
      if (b.kind === 'text') return b.text.trim() ? [{ kind: 'text' as const, text: b.text }] : []
      return b.status === 'done' && b.url ? [{ kind: 'image' as const, url: b.url, alt: b.alt.trim() || undefined }] : []
    })
    startTransition(async () => {
      const result = await createPost({ blocks, categoryIds: state.categoryIds })
      if (!result.ok) {
        useComposerStore.getState().setSubmitting(false)
        toast.error(result.error)
        return
      }
      useComposerStore.getState().reset()
      toast.success('Your post is live')
      router.refresh()
    })
  }

  return { submit, isPending }
}
