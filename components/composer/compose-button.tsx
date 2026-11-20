'use client'

import type { ReactNode } from 'react'
import { ComposerDialog } from '@/components/composer/composer-dialog'
import { Button } from '@/components/ui/button'
import { useComposerStore } from '@/stores/composer-store'
import type { Category } from '@/types/content'

interface ComposeButtonProps {
  categories?: Category[]
  featuredCategoryIds?: string[]
  /** When given, a plain `<button>` carrying these classes replaces the default Button. */
  className?: string
  /** Replaces the default "Post" label (e.g. an icon and a span, like the navbar's). */
  children?: ReactNode
}

/** Opens the omnibar and mounts it. */
export const ComposeButton = ({ categories = [], featuredCategoryIds, className, children }: ComposeButtonProps) => {
  const open = useComposerStore((s) => s.open)
  return (
    <>
      {className === undefined ? (
        <Button onClick={open}>{children ?? 'Post'}</Button>
      ) : (
        <button type="button" className={className} onClick={open}>
          {children ?? 'Post'}
        </button>
      )}
      <ComposerDialog categories={categories} featuredCategoryIds={featuredCategoryIds} />
    </>
  )
}
