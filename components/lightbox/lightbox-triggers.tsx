'use client'

import Link from 'next/link'
import type { MouseEvent, ReactNode } from 'react'
import { LightBoxTrigger, LightBoxTriggerSmall } from '@/components/icons'
import { Hint } from '@/components/posts/hint'
import type { Region } from '@/types/post'
import { cn } from '@/utils/cn'
import { useLightbox } from './lightbox-context'
import { assetIdOf } from './lightbox-queue'

interface TargetProps {
  postId: string
  assetId: string
}

const TriggerContent = () => (
  <>
    <span className="label">Open Lightbox</span>
    <span className="icon">
      <LightBoxTrigger />
    </span>
  </>
)

interface RegionProps extends TargetProps {
  className?: string
  children: ReactNode
}

/**
 * A static picture region (list streams, post pages, comments): a click anywhere on it opens the
 * lightbox, like `ImageRegion.onClickImageRegion`, but not with ⌘ held and not on the buy button.
 */
export const LightboxRegion = ({ postId, assetId, className, children }: RegionProps) => {
  const lightbox = useLightbox()
  const onClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.metaKey || !(event.target instanceof Element)) return
    if (event.target.classList.contains('ElloBuyButton')) return
    lightbox?.toggle(assetId, postId)
  }
  return (
    <div className={className} onClick={onClick}>
      {children}
    </div>
  )
}

/** The round button over a static picture; its click is the region's. */
export const LightboxTriggerButton = ({ withBuy }: { withBuy: boolean }) => (
  <button type="button" className={cn('lightbox-trigger', withBuy && 'with-buy')}>
    <TriggerContent />
  </button>
)

interface TriggerLinkProps extends TargetProps {
  href: string
  withBuy: boolean
}

/**
 * The round button over a grid picture: the picture itself links to the post, this opens the
 * lightbox instead (`onClickLightboxTriggerLink`; with ⌘ it stays a link to the post).
 */
export const LightboxTriggerLink = ({ postId, assetId, href, withBuy }: TriggerLinkProps) => {
  const lightbox = useLightbox()
  const onClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (event.metaKey) return
    event.preventDefault()
    lightbox?.toggle(assetId, postId)
  }
  return (
    <Link href={href} className={cn('lightbox-trigger', withBuy && 'with-buy')} tabIndex={-1} onClick={onClick}>
      <TriggerContent />
    </Link>
  )
}

/** The original's `LightBoxTriggerTool` (post tools on touch devices): opens the post's first picture. */
export const LightboxTriggerTool = ({ postId, summary }: { postId: string; summary: Region[] }) => {
  const lightbox = useLightbox()
  const first = summary.find((region) => region.kind === 'image')
  const assetId = first ? assetIdOf(first) : null
  if (!assetId) return null
  return (
    <span className="PostTool LightBoxTriggerTool">
      <button type="button" aria-label="Lightbox" onClick={() => lightbox?.toggle(assetId, postId)}>
        <LightBoxTriggerSmall />
        <Hint>Lightbox</Hint>
      </button>
    </span>
  )
}
