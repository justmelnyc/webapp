'use client'

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { DragIcon, XIcon } from '@/components/icons'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import parts from '@/components/ui/editor-parts.module.css'
import styles from './comment-region-tools.module.css'

interface CommentRegionToolsProps {
  id: string
  onRemove: (id: string) => void
  /** Move the block up (-1) or down (1). */
  onMove: (id: string, delta: number) => void
}

/** The id of the block under the pointer, found through the blocks' data-block-id. */
const blockIdAt = (x: number, y: number): string | null => {
  const el = document
    .elementsFromPoint(x, y)
    .find((e) => e instanceof HTMLElement && e.dataset.blockId)
  return el instanceof HTMLElement ? (el.dataset.blockId ?? null) : null
}

/** The original's RegionTools in a comment: remove (X, with a confirmation) and the drag handle. */
export const CommentRegionTools = ({ id, onRemove, onMove }: CommentRegionToolsProps) => {
  const [confirming, setConfirming] = useState(false)
  const dragging = useRef(false)

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>): void => {
    if (!dragging.current) return
    const target = blockIdAt(e.clientX, e.clientY)
    if (!target || target === id) return
    const ids = Array.from(document.querySelectorAll<HTMLElement>('[data-block-id]')).map(
      (el) => el.dataset.blockId,
    )
    onMove(id, ids.indexOf(target) > ids.indexOf(id) ? 1 : -1)
  }

  const stopDragging = (): void => {
    dragging.current = false
    document.body.classList.remove('isDragging')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>): void => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    e.preventDefault()
    onMove(id, e.key === 'ArrowUp' ? -1 : 1)
  }

  return (
    <div className={`RegionTools ${parts.tools} ${styles.tools}`}>
      <button
        type="button"
        aria-label="Remove"
        className={`BlockRemove ${parts.remove}`}
        onClick={() => setConfirming(true)}
      >
        <XIcon />
      </button>
      <button
        type="button"
        aria-label="Reorder (arrow keys or drag)"
        className={`DragHandler ${parts.drag}`}
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          document.body.classList.add('isDragging')
        }}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onKeyDown={onKeyDown}
      >
        <DragIcon />
      </button>
      {confirming ? (
        <ConfirmDialog
          title="Remove this content?"
          onConfirm={() => {
            setConfirming(false)
            onRemove(id)
          }}
          onDismiss={() => setConfirming(false)}
        />
      ) : null}
    </div>
  )
}
