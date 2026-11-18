'use client'

import { useEffect, useLayoutEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { useEmbedPaste } from '@/components/composer/use-embed-paste'
import { useSubmitPost } from '@/components/composer/use-submit-post'
import { canPost, useComposerApi, type TextBlock as TextBlockData } from '@/stores/composer-store'
import styles from './omnibar.module.css'

const IS_FIREFOX = (): boolean => /firefox/i.test(navigator.userAgent)

const placeCaretAtEnd = (el: HTMLElement): void => {
  el.focus()
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

/** The original's TextBlock: a contenteditable whose HTML (bold, italic, links) is the block's data. */
export const TextBlock = ({ block, autoFocus }: { block: TextBlockData; autoFocus: boolean }) => {
  const api = useComposerApi()
  const ref = useRef<HTMLDivElement>(null)
  const checkEmbeds = useEmbedPaste()
  const { submit } = useSubmitPost()

  // The DOM is the source of truth while typing; only an outside change (loading a post) rewrites it.
  useLayoutEffect(() => {
    const el = ref.current
    if (el && el.innerHTML !== block.text) el.innerHTML = block.text
  }, [block.text])

  useEffect(() => {
    if (autoFocus && ref.current) placeCaretAtEnd(ref.current)
  }, [autoFocus])

  const commit = (): void => {
    const el = ref.current
    if (el) api.getState().setText(block.id, el.innerHTML)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      if (canPost(api.getState().blocks)) submit()
      return
    }
    // The original keeps Chrome from creating DIVs: Enter inserts a blank line instead.
    if (e.key === 'Enter' && !IS_FIREFOX()) {
      e.preventDefault()
      document.execCommand('insertHTML', false, '\n\n')
    }
  }

  const onPaste = (e: ClipboardEvent<HTMLDivElement>): void => {
    if (Array.from(e.clipboardData.items).some((item) => item.type.startsWith('image/'))) return // the editor takes images
    const text = e.clipboardData.getData('text/plain')
    if (!text) return
    e.preventDefault() // paste as plain text, like the original
    document.execCommand('insertText', false, text)
    checkEmbeds(text)
  }

  return (
    <div
      ref={ref}
      role="textbox"
      aria-multiline="true"
      aria-label="Post text"
      contentEditable
      suppressContentEditableWarning
      className={`editable text ${styles.editable}`}
      onInput={commit}
      onBlur={commit}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
    />
  )
}
