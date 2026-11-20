'use client'

import { usePathname } from 'next/navigation'
import { useMemo, type ComponentType, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { isPostDetailPath } from '@/components/layout/layout-routes'
import { Lightbox } from './lightbox'
import { LightboxContext } from './lightbox-context'
import { lightboxPairs, queueItemIds, type LightboxItem } from './lightbox-queue'
import type { QueueProps } from './lightbox-queue-view'
import { useLightboxState } from './use-lightbox-state'

interface LightboxProviderProps {
  /** Everything whose pictures can be stepped through, in page order. */
  items: LightboxItem[]
  /** `PostQueue` or `CommentQueue`. */
  Queue: ComponentType<QueueProps>
  /** The post tools for the item of the selected picture. */
  renderTools: (itemId: string, close: () => void) => ReactNode
  isGridMode?: boolean
  isCommentStream?: boolean
  /** The related posts under a post: drawn beside the post, not inside it. */
  isRelatedStream?: boolean
  children: ReactNode
}

/**
 * The original's `LightBoxContainer` wrapper: pictures below it open one shared lightbox (via
 * `useLightbox`) whose queue runs through all of `items`. The overlay is drawn over the page from
 * `document.body`.
 */
export const LightboxProvider = ({ items, Queue, renderTools, isGridMode = false, isCommentStream = false, isRelatedStream = false, children }: LightboxProviderProps) => {
  const pairs = useMemo(() => lightboxPairs(items), [items])
  const { selected, direction, pagination, toggle, advance, close } = useLightboxState(pairs, { isCommentStream })
  const api = useMemo(() => ({ toggle }), [toggle])
  const isPostDetail = isPostDetailPath(usePathname())
  const placement = !isPostDetail ? 'stream' : isRelatedStream ? 'related' : isCommentStream ? 'comments' : 'post'
  const queueItems = selected
    ? queueItemIds(pairs, selected).flatMap((id) => items.find((item) => item.id === id) ?? [])
    : []
  return (
    <LightboxContext value={api}>
      {children}
      {selected &&
        createPortal(
          <Lightbox
            items={queueItems}
            selected={selected}
            pagination={pagination}
            direction={direction}
            isGridMode={isGridMode}
            placement={placement}
            Queue={Queue}
            onPick={toggle}
            onAdvance={advance}
            onClose={close}
          >
            {renderTools(selected.postId, close)}
          </Lightbox>,
          document.body,
        )}
    </LightboxContext>
  )
}
