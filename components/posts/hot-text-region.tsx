'use client'

import { useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'

/** A text region in a grid: clicking the text (not a link in it) opens the post, like `isHot`. */
export const HotTextRegion = ({ html, path }: { html: string; path: string }) => {
  const router = useRouter()
  const onClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target instanceof Element && event.target.closest('a')) return
    router.push(path)
  }
  return (
    <div className="TextRegion">
      <div className="RegionContent isHot" onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
