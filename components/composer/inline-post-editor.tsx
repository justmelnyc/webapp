'use client'

import { useEffect, useState, type DragEvent } from 'react'
import { ActionBar } from '@/components/composer/action-bar'
import { ComposerBlocks } from '@/components/composer/composer-blocks'
import { TextTools } from '@/components/composer/text-tools'
import { useComposerUploads } from '@/components/composer/use-composer-uploads'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { EditablePostWithCategories } from '@/actions/post-edit-actions'
import type { EditablePost } from '@/lib/schemas/post'
import {
  ComposerStoreContext,
  createComposerStore,
  isDraftDirty,
  useComposerStore,
  type ComposerBlock,
} from '@/stores/composer-store'
import { usePostEditStore } from '@/stores/post-edit-store'
import type { Category } from '@/types/content'
import { cn } from '@/utils/cn'
import styles from './omnibar.module.css'

const PLACEHOLDER = 'Drag & drop images, paste embeds, enter text and links.'

/** The editable body (raw blocks from the API) -> the editor's blocks. */
export const toEditorBlocks = (body: EditablePost['body']): ComposerBlock[] => {
  const blocks = body.flatMap((block, i): ComposerBlock[] => {
    const id = `edit-${i}`
    if (block.kind === 'text') return [{ id, kind: 'text', text: block.data }]
    if (block.kind === 'embed') {
      const { service, url, thumbnailLargeUrl, id: embedId } = block.data
      return [{ id, kind: 'embed', service, url, thumbnailLargeUrl, embedId }]
    }
    const url = block.data.url
    return url ? [{ id, kind: 'image', url, previewUrl: url, status: 'done', alt: block.data.alt ?? '' }] : []
  })
  // Like the original's editor, a post that ends in media gets an empty text block to type in.
  return blocks.at(-1)?.kind === 'text' ? blocks : [...blocks, { id: 'edit-empty', kind: 'text', text: '' }]
}

const Editor = ({ categories }: { categories: Category[] }) => {
  const blocks = useComposerStore((s) => s.blocks)
  const isOpen = useComposerStore((s) => s.isOpen)
  const reset = useComposerStore((s) => s.reset)
  const { addFiles, retry } = useComposerUploads()
  const [dragging, setDragging] = useState(false)
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  // Submitting or cancelling resets the store (closed): hand the body back to the post.
  useEffect(() => {
    if (!isOpen) usePostEditStore.getState().end()
  }, [isOpen])

  const onDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    setDragging(false)
    addFiles(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/')))
  }

  return (
    <div className={`EditorWrapper ${styles.inlineWrapper}`}>
      <div
        className={cn('editor', styles.editor, isDraftDirty(blocks) && cn('hasContent', styles.hasContent), dragging && styles.hasDragOver)}
        data-placeholder={PLACEHOLDER}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <ComposerBlocks blocks={blocks} onRetry={retry} />
        <ActionBar categories={categories} onFiles={addFiles} onCancel={() => setConfirmingCancel(true)} />
      </div>
      <TextTools />
      {confirmingCancel && (
        <ConfirmDialog
          title="Cancel edit?"
          onConfirm={() => {
            setConfirmingCancel(false)
            reset()
          }}
          onDismiss={() => setConfirmingCancel(false)}
        />
      )}
    </div>
  )
}

/** The original's inline `Editor post={post}`: the post's own blocks, an `Update` button and its own draft. */
export const InlinePostEditor = ({ post }: { post: EditablePostWithCategories }) => {
  const [store] = useState(() => {
    const created = createComposerStore()
    const buyLink = post.body.find((b) => b.linkUrl)?.linkUrl ?? ''
    created.getState().startEdit(post.id, toEditorBlocks(post.body), (post.links?.categories ?? []).map(String), buyLink)
    return created
  })
  return (
    <ComposerStoreContext.Provider value={store}>
      <Editor categories={post.categories} />
    </ComposerStoreContext.Provider>
  )
}
