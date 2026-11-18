'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { createPost } from '@/actions/composer-actions'
import { updatePost } from '@/actions/post-edit-actions'
import { createRepost } from '@/actions/repost-actions'
import type { CreatePostInput } from '@/lib/schemas/post'
import { isEditorEmpty } from '@/utils/editor-html'
import { useComposerApi, type ComposerBlock } from '@/stores/composer-store'
import { toast } from '@/stores/toast-store'

const toPostBlocks = (blocks: ComposerBlock[]): CreatePostInput['blocks'] =>
  blocks.flatMap((b): CreatePostInput['blocks'] => {
    if (b.kind === 'text') return isEditorEmpty(b.text) ? [] : [{ kind: 'text' as const, text: b.text }]
    if (b.kind === 'embed') {
      return [{ kind: 'embed' as const, service: b.service, url: b.url, thumbnailLargeUrl: b.thumbnailLargeUrl, embedId: b.embedId }]
    }
    return b.status === 'done' && b.url ? [{ kind: 'image' as const, url: b.url, alt: b.alt.trim() || undefined }] : []
  })

const SUCCESS = { post: 'Your post is live', edit: 'Your post was updated', repost: 'Reposted' } as const

/** Posts (or, in the inline editor, updates) the draft held by the nearest composer store. */
export const useSubmitPost = (): { submit: () => void; isPending: boolean } => {
  const router = useRouter()
  const api = useComposerApi()
  const [isPending, startTransition] = useTransition()

  const submit = (): void => {
    const state = api.getState()
    if (state.isSubmitting) return // block double-submit
    state.setSubmitting(true)
    const blocks = toPostBlocks(state.blocks)
    const buyLink = state.buyLink || undefined
    startTransition(async () => {
      const result =
        state.mode === 'repost' && state.editingPostId
          ? await createRepost({ postId: state.editingPostId, blocks, buyLink })
          : state.mode === 'edit' && state.editingPostId
          ? await updatePost({ postId: state.editingPostId, blocks, categoryIds: state.categoryIds, buyLink })
          : await createPost({ blocks, categoryIds: state.categoryIds, buyLink })
      if (!result.ok) {
        api.getState().setSubmitting(false)
        toast.error(result.error)
        return
      }
      api.getState().reset()
      toast.success(SUCCESS[state.mode])
      router.refresh()
    })
  }

  return { submit, isPending }
}
