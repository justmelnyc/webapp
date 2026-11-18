'use client'

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { DragIcon, XIcon } from '@/components/icons'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useComposerApi, useComposerStore } from '@/stores/composer-store'
import styles from './omnibar.module.css'

/** Index of the block under the pointer, found through the blocks' data-block-id. */
const blockIdAt = (x: number, y: number): string | null => {
  const el = document.elementsFromPoint(x, y).find((e) => e instanceof HTMLElement && e.dataset.blockId)
  return el instanceof HTMLElement ? (el.dataset.blockId ?? null) : null
}

/** The original's RegionTools: remove (X, with a confirmation) and the drag handle. */
export const RegionTools = ({ id }: { id: string }) => {
  const [confirming, setConfirming] = useState(false)
  const removeBlock = useComposerStore((s) => s.removeBlock)
  const moveBlock = useComposerStore((s) => s.moveBlock)
  const api = useComposerApi()
  const dragging = useRef(false)

  const confirmRemove = (): void => {
    setConfirming(false)
    removeBlock(id)
    if (api.getState().blocks.length === 0) api.getState().addText()
  }

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>): void => {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    document.body.classList.add('isDragging')
  }

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>): void => {
    if (!dragging.current) return
    const { blocks } = api.getState()
    const target = blockIdAt(e.clientX, e.clientY)
    if (!target || target === id) return
    const from = blocks.findIndex((b) => b.id === id)
    const to = blocks.findIndex((b) => b.id === target)
    if (from >= 0 && to >= 0) moveBlock(id, to > from ? 1 : -1)
  }

  const onPointerUp = (): void => {
    dragging.current = false
    document.body.classList.remove('isDragging')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>): void => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    e.preventDefault()
    moveBlock(id, e.key === 'ArrowUp' ? -1 : 1)
  }

  return (
    <div className={`RegionTools ${styles.tools}`}>
      <button type="button" aria-label="Remove" className={`BlockRemove ${styles.remove}`} onClick={() => setConfirming(true)}>
        <XIcon />
      </button>
      <button
        type="button"
        aria-label="Reorder (arrow keys or drag)"
        className={`DragHandler ${styles.drag}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <DragIcon />
      </button>
      {confirming && (
        <ConfirmDialog title="Remove this content?" onConfirm={confirmRemove} onDismiss={() => setConfirming(false)} />
      )}
    </div>
  )
}
