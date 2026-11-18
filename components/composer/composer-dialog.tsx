'use client'

import { useEffect, useState, type ClipboardEvent, type DragEvent, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { ActionBar } from '@/components/composer/action-bar'
import { ComposerBlocks } from '@/components/composer/composer-blocks'
import { TextTools } from '@/components/composer/text-tools'
import { useFullscreenShortcut } from '@/components/composer/use-fullscreen-shortcut'
import { useComposerUploads } from '@/components/composer/use-composer-uploads'
import { ChevronIcon } from '@/components/icons'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { isDraftDirty, useComposerStore } from '@/stores/composer-store'
import type { Category } from '@/types/content'
import { cn } from '@/utils/cn'
import './fullscreen.css'
import styles from './omnibar.module.css'

const PLACEHOLDER = 'Drag & drop images, paste embeds, enter text and links.'

const onlyImages = (files: File[]): File[] => files.filter((f) => f.type.startsWith('image/'))

const imagesFromItems = (items: DataTransferItemList): File[] =>
  onlyImages(
    Array.from(items).flatMap((item) => {
      const file = item.kind === 'file' ? item.getAsFile() : null
      return file ? [file] : []
    }),
  )

/**
 * Mounts a host element in `section.AppContainer` right before the main view (where the original
 * renders its Omnibar) while the composer is open, and flags the body like the original does.
 */
const useOmnibarHost = (isOpen: boolean): HTMLElement | null => {
  const [host, setHost] = useState<HTMLElement | null>(null)
  useEffect(() => {
    if (!isOpen) return
    const el = document.createElement('div')
    el.className = styles.host ?? ''
    const main = document.querySelector('.MainView')
    if (main?.parentElement) main.parentElement.insertBefore(el, main)
    else document.body.prepend(el)
    document.body.classList.add('isOmnibarActive')
    window.scrollTo(0, 0)
    // The host only exists after this effect inserted it into the DOM, so state is the hand-off.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHost(el)
    return () => {
      document.body.classList.remove('isOmnibarActive')
      el.remove()
      setHost(null)
    }
  }, [isOpen])
  return host
}

export const ComposerDialog = ({ categories }: { categories: Category[] }) => {
  const isOpen = useComposerStore((s) => s.isOpen)
  const blocks = useComposerStore((s) => s.blocks)
  const close = useComposerStore((s) => s.close)
  const reset = useComposerStore((s) => s.reset)
  const { addFiles, retry } = useComposerUploads()
  const host = useOmnibarHost(isOpen)
  const isFullScreen = useFullscreenShortcut(isOpen)
  const [dragging, setDragging] = useState(false)
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  if (!isOpen || !host) return null

  const hasContent = isDraftDirty(blocks)

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key !== 'Escape' || useComposerStore.getState().isSubmitting) return
    e.stopPropagation()
    close() // hides the omnibar; the draft is kept like the original's "Navigation" button
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

  const cancelConfirmed = (): void => {
    setConfirmingCancel(false)
    reset()
  }

  return createPortal(
    <div
      role="region"
      aria-label="Create a post"
      className={cn('Omnibar isActive', isFullScreen && 'isFullScreen', styles.omnibar)}
      onKeyDown={onKeyDown}
    >
      <div className={styles.wrapper}>
        <div
          className={cn('editor', styles.editor, hasContent && cn('hasContent', styles.hasContent), dragging && styles.hasDragOver)}
          data-placeholder={PLACEHOLDER}
          onPaste={onPaste}
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
      </div>
      <TextTools />
      <button type="button" aria-label="Navigation" className={styles.reveal} onClick={close}>
        <ChevronIcon />
        Navigation
      </button>
      {confirmingCancel && (
        <ConfirmDialog title="Cancel post?" onConfirm={cancelConfirmed} onDismiss={() => setConfirmingCancel(false)} />
      )}
    </div>,
    host,
  )
}
