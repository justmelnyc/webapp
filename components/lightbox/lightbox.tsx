'use client'

import { useLayoutEffect, useRef, useState, type ComponentType, type MouseEvent, type ReactNode } from 'react'
import { LightBoxArrow, XIconLG } from '@/components/icons'
import { cn } from '@/utils/cn'
import type { LightboxSources } from './lightbox-image'
import type { Direction, LightboxItem, LightboxPair, Pagination } from './lightbox-queue'
import type { QueueProps } from './lightbox-queue-view'
import { useLightboxActive } from './use-lightbox-active'
import { useLightboxKeys } from './use-lightbox-keys'
import { useLightboxSizes } from './use-lightbox-sizes'
import { useOpenPhases } from './use-open-phases'
import { OPEN_DELAY, useQueueSlide } from './use-queue-slide'
import './lightbox.css'
import './lightbox-tools.css'
import './lightbox-tools-post.css'

/**
 * Where the original draws the lightbox, which decides the page rules that reach its post tools:
 * next to a stream's posts, or on a post page inside `.Posts.asList`, for the post itself (`post`,
 * under 60em also inside the page's `.Post`), for its comments, or for its related posts.
 */
export type LightboxPlacement = 'stream' | 'post' | 'comments' | 'related'

const PLACEMENT_SOURCES: Record<LightboxPlacement, LightboxSources> = {
  stream: 'stream',
  post: 'post',
  comments: 'post',
  related: 'post',
}

const PLACEMENT_CLASS: Record<LightboxPlacement, string | undefined> = {
  stream: undefined,
  post: 'Posts asList LightBoxInPost',
  comments: 'Posts asList',
  related: 'Posts asList',
}

interface LightboxProps {
  /** The posts or comments drawn in the queue (a window around the selected picture). */
  items: LightboxItem[]
  selected: LightboxPair
  pagination: Pagination
  direction: Direction
  /** Opened from a grid stream: the original waits longer before it shows the queue. */
  isGridMode: boolean
  placement: LightboxPlacement
  /** `PostQueue` or `CommentQueue`. */
  Queue: ComponentType<QueueProps>
  /** The post tools under the pictures. */
  children: ReactNode
  onPick: (assetId: string, postId: string) => void
  onAdvance: (direction: Direction) => void
  onClose: () => void
}

const NavButton = ({ direction, label, onAdvance }: { direction: Direction; label: string; onAdvance: (direction: Direction) => void }) => (
  <button type="button" className={`${direction} LightBoxNav`} aria-label={label} onClick={() => onAdvance(direction)}>
    <span className="label">{label}</span>
    <span className="icon">
      <LightBoxArrow />
    </span>
  </button>
)

/** The original's `LightBox` (LightBoxRenderables.js): mask, close and step buttons, post tools and the queue of pictures. */
export const Lightbox = ({ items, selected, pagination, direction, isGridMode, placement, Queue, children, onPick, onAdvance, onClose }: LightboxProps) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const queueRef = useRef<HTMLDivElement>(null)
  // the delays belong to the layout the lightbox was opened from
  const [openDelay] = useState(() => OPEN_DELAY[isGridMode ? 'grid' : 'list'])
  const { loading, loaded } = useOpenPhases(openDelay)
  const { recenter, recenterAfterResize } = useQueueSlide({ queueRef, selected, pagination, direction, oldestItemId: items[0]?.id, openDelay })
  const { sizes, measure } = useLightboxSizes(recenterAfterResize)
  useLightboxActive(rootRef)
  useLightboxKeys({ onClose, onAdvance })

  // a picture that is measured after the queue has moved would leave the selected one off centre
  useLayoutEffect(recenter, [sizes, recenter])

  // `handleMaskClick`: anything but a picture, a button or a post tool closes the lightbox
  const onMaskClick = (event: MouseEvent<HTMLDivElement>): void => {
    const { target } = event
    if (!(target instanceof Element) || !event.currentTarget.contains(target)) return
    if (['IMG', 'VIDEO', 'BUTTON'].includes(target.nodeName) || target.classList.contains('PostTool')) return
    onClose()
  }

  return (
    <div ref={rootRef} className={cn('LightBoxContainer', PLACEMENT_CLASS[placement])} role="dialog" aria-modal="true" aria-label="Lightbox" tabIndex={-1}>
      <div className="LightBoxMask" role="presentation" onClick={onMaskClick}>
        <button type="button" className="CloseModal" aria-label="Close" onClick={onClose}>
          <XIconLG />
        </button>
        {pagination.prev && <NavButton direction="prev" label="Previous" onAdvance={onAdvance} />}
        {pagination.next && <NavButton direction="next" label="Next" onAdvance={onAdvance} />}
        <div className={`LightBox ${loading ? 'loading' : ''}${loaded ? 'loaded' : ''}`}>
          <div className="LightBoxControls controls-holder">{children}</div>
          <div ref={queueRef} className="LightBoxQueue">
            <Queue items={items} selected={selected} sources={PLACEMENT_SOURCES[placement]} sizes={sizes} onMeasure={measure} onPick={onPick} />
          </div>
        </div>
      </div>
    </div>
  )
}
