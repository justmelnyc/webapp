'use client'

import { useCallback, useEffect, useRef, useState, type ClipboardEvent, type DragEvent, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { CategoryPicker } from '@/components/composer/category-picker'
import { ComposerBlocks } from '@/components/composer/composer-blocks'
import { ComposerFooter } from '@/components/composer/composer-footer'
import { useComposerUploads } from '@/components/composer/use-composer-uploads'
import { isDraftDirty, useComposerStore } from '@/stores/composer-store'
import type { Category } from '@/types/content'
import { cn } from '@/utils/cn'

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,[tabindex]:not([tabindex="-1"])'

const onlyImages = (files: File[]): File[] => files.filter((f) => f.type.startsWith('image/'))

const imagesFromItems = (items: DataTransferItemList): File[] =>
  onlyImages(
    Array.from(items).flatMap((item) => {
      const file = item.kind === 'file' ? item.getAsFile() : null
      return file ? [file] : []
    }),
  )

export const ComposerDialog = ({ categories }: { categories: Category[] }) => {
  const isOpen = useComposerStore((s) => s.isOpen)
  const blocks = useComposerStore((s) => s.blocks)
  const close = useComposerStore((s) => s.close)
  const reset = useComposerStore((s) => s.reset)
  const { addFiles, retry } = useComposerUploads()
  const panelRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const requestClose = useCallback((): void => {
    const { blocks: current, isSubmitting } = useComposerStore.getState()
    if (isSubmitting) return
    if (!isDraftDirty(current)) return reset()
    // Keep the draft (closing only hides); offer to discard it.
    if (window.confirm('Discard this post? Press Cancel to keep your draft.')) reset()
    else close()
  }, [close, reset])

  useEffect(() => {
    if (!isOpen) return
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      requestClose()
      return
    }
    if (e.key !== 'Tab' || !panelRef.current) return
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
    const first = items[0]
    const last = items[items.length - 1]
    if (!first || !last) return
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const onPaste = (e: ClipboardEvent<HTMLDivElement>): void => {
    const files = imagesFromItems(e.clipboardData.items)
    if (files.length === 0) return
    e.preventDefault()
    addFiles(files)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    setDragging(false)
    addFiles(onlyImages(Array.from(e.dataTransfer.files)))
  }

  return createPortal(
    <div
      className="bg-paper fixed inset-0 z-[1000] flex flex-col"
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false)
      }}
      onDrop={onDrop}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Create a post"
        className={cn('mx-auto flex h-full w-full max-w-2xl flex-col', dragging && 'outline-ello-green outline-2 -outline-offset-8 outline-dashed')}
      >
        <header className="flex items-center justify-between px-5 py-4">
          <h2 className="text-lg font-semibold">Create a post</h2>
          <button type="button" aria-label="Close composer" onClick={requestClose} className="text-slate hover:text-ink p-2">
            ✕
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <ComposerBlocks blocks={blocks} onRetry={retry} />
          {dragging && <p className="text-ello-green py-4 text-center text-sm">Drop images to upload</p>}
          <div className="mt-6">
            <CategoryPicker categories={categories} />
          </div>
        </div>
        <ComposerFooter onFiles={addFiles} onRequestClose={requestClose} />
      </div>
    </div>,
    document.body,
  )
}
