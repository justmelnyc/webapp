'use client'

import { useEffect, useState, type DragEvent } from 'react'
import { loadRepostContext, type RepostContext } from '@/actions/repost-actions'
import { ActionBar } from '@/components/composer/action-bar'
import { EmbedBlock } from '@/components/composer/embed-block'
import { ImageBlock } from '@/components/composer/image-block'
import omnibar from '@/components/composer/omnibar.module.css'
import { RegionTools } from '@/components/composer/region-tools'
import { TextBlock } from '@/components/composer/text-block'
import { useComposerUploads } from '@/components/composer/use-composer-uploads'
import { RepostBlock } from '@/components/posts/repost-block'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  ComposerStoreContext,
  createComposerStore,
  isDraftDirty,
  useComposerStore,
} from '@/stores/composer-store'
import { useScrollToRepostActions } from '@/hooks/use-scroll-to-repost-actions'
import { useRepostStore } from '@/stores/repost-store'
import type { Post } from '@/types/post'
import { cn } from '@/utils/cn'
import { originalIdOf, repostedRegions } from '@/utils/repost'

/** Loaded once per page: a remounted editor (resize, re-render) shows the same context at once. */
let cachedContext: RepostContext | null = null

/** Where the editor opens: a grid card (compact), a list item or the post page. */
export type RepostLayout = 'grid' | 'list' | 'detail'

const Editor = ({ post, layout }: { post: Post; layout: RepostLayout }) => {
  const blocks = useComposerStore((s) => s.blocks)
  const stop = useRepostStore((s) => s.stop)
  const { addFiles, retry } = useComposerUploads()
  const [dragging, setDragging] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [context, setContext] = useState<RepostContext>(cachedContext ?? { username: '', categories: [] })
  useEffect(() => {
    if (cachedContext) return
    void loadRepostContext().then((loaded) => {
      cachedContext = loaded
      setContext(loaded)
    })
  }, [])
  const isDirty = isDraftDirty(blocks)
  const actionsId = `repost-editor-${post.id}`
  useScrollToRepostActions(actionsId, layout === 'grid')

  const onDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    setDragging(false)
    addFiles(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/')))
  }
  const cancel = (): void => (isDirty ? setConfirming(true) : stop())

  return (
    <div>
      <div
        className={cn('editor isPostReposting', omnibar.editor, cn('hasContent', omnibar.hasContent), dragging && omnibar.hasDragOver)}
        data-placeholder="Drag & drop images, paste embeds, enter text and links."
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <div className={cn('editor-region', omnibar.region)} data-num-blocks={blocks.length + 1}>
          <RepostBlock username={context.username} regions={repostedRegions(post)} />
          {blocks.map((block, index) => (
            <div key={block.id} className={cn('editor-block', omnibar.block)} data-block-id={block.id}>
              {block.kind === 'text' && <TextBlock block={block} autoFocus={index === 0} />}
              {block.kind === 'image' && <ImageBlock block={block} onRetry={retry} />}
              {block.kind === 'embed' && <EmbedBlock block={block} />}
              <RegionTools id={block.id} />
            </div>
          ))}
        </div>
        <ActionBar id={actionsId} categories={context.categories} onFiles={addFiles} onCancel={cancel} compact={layout === 'grid'} />
      </div>
      {confirming && (
        <ConfirmDialog title="Cancel repost?" onConfirm={stop} onDismiss={() => setConfirming(false)} />
      )}
    </div>
  )
}

/** The original's inline repost `Editor`: the locked original on top, then a draft for your own words. */
export const RepostEditor = ({ post, layout }: { post: Post; layout: RepostLayout }) => {
  const [store] = useState(createComposerStore)
  useEffect(() => {
    store.getState().startRepost(originalIdOf(post))
  }, [store, post])
  return (
    <ComposerStoreContext.Provider value={store}>
      <Editor post={post} layout={layout} />
    </ComposerStoreContext.Provider>
  )
}
