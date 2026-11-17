'use client'

import type { ComponentProps } from 'react'
import { useComposerStore } from '@/stores/composer-store'
import { cn } from '@/utils/cn'

const IconButton = ({ className, ...props }: ComponentProps<'button'>) => (
  <button
    type="button"
    className={cn('text-slate hover:text-ink px-2 py-1 text-sm disabled:opacity-30', className)}
    {...props}
  />
)

export const BlockControls = ({ id, index, count }: { id: string; index: number; count: number }) => {
  const moveBlock = useComposerStore((s) => s.moveBlock)
  const removeBlock = useComposerStore((s) => s.removeBlock)
  return (
    <div className="flex shrink-0 flex-col items-center">
      <IconButton aria-label="Move up" disabled={index === 0} onClick={() => moveBlock(id, -1)}>
        ↑
      </IconButton>
      <IconButton aria-label="Move down" disabled={index === count - 1} onClick={() => moveBlock(id, 1)}>
        ↓
      </IconButton>
      <IconButton aria-label="Remove" onClick={() => removeBlock(id)}>
        ✕
      </IconButton>
    </div>
  )
}
