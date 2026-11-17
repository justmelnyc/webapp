'use client'

import { useLayoutEffect, useRef } from 'react'
import { useComposerStore, type TextBlock as TextBlockData } from '@/stores/composer-store'
import styles from './omnibar.module.css'

export const TextBlock = ({ block, autoFocus }: { block: TextBlockData; autoFocus: boolean }) => {
  const setText = useComposerStore((s) => s.setText)
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [block.text])

  return (
    <textarea
      ref={ref}
      value={block.text}
      autoFocus={autoFocus}
      rows={1}
      aria-label="Post text"
      onChange={(e) => setText(block.id, e.target.value)}
      className={`editable text ${styles.editable}`}
    />
  )
}
