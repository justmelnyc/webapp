'use client'

import { useLayoutEffect, useRef } from 'react'
import { useComposerStore, type TextBlock as TextBlockData } from '@/stores/composer-store'

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
      rows={2}
      aria-label="Post text"
      placeholder="Say Ello..."
      onChange={(e) => setText(block.id, e.target.value)}
      className="placeholder:text-ash w-full resize-none bg-transparent py-2 text-lg outline-none"
    />
  )
}
