'use client'

import { ComposerDialog } from '@/components/composer/composer-dialog'
import { Button } from '@/components/ui/button'
import { useComposerStore } from '@/stores/composer-store'
import type { Category } from '@/types/content'

export const ComposeButton = ({ categories = [] }: { categories?: Category[] }) => {
  const open = useComposerStore((s) => s.open)
  return (
    <>
      <Button onClick={open}>Post</Button>
      <ComposerDialog categories={categories} />
    </>
  )
}
