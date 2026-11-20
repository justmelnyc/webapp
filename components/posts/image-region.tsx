'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isPostDetailPath } from '@/components/layout/layout-routes'
import { ElloBuyButton, hasBuyLink } from '@/components/posts/ello-buy-button'
import { useImageStatus } from '@/components/posts/use-image-status'
import { useCanPlayClips } from '@/components/posts/use-stream-widths'
import { VideoAttachment } from '@/components/posts/video-attachment'
import { assetIdOf } from '@/components/lightbox/lightbox-queue'
import { LightboxRegion, LightboxTriggerButton, LightboxTriggerLink } from '@/components/lightbox/lightbox-triggers'
import { assetDomId } from '@/components/lightbox/scroll-to-asset'
import { ElloImage } from '@/components/ui/ello-image'
import type { ImageVersion, ResponsiveImage } from '@/types/image'
import type { Asset, ImageRegion } from '@/types/post'
import { cn } from '@/utils/cn'
import { altOf, isGif } from '@/utils/image-region'

/** Whose regions these are: a comment never shows a buy button and sizes its clips differently. */
export type RegionOwner = 'post' | 'comment'

interface ImageRegionViewProps {
  postId?: string
  region: ImageRegion
  assets: Asset[]
  loading: 'eager' | 'lazy'
  /** Grid mode: the picture links here. */
  detailPath?: string
  owner: RegionOwner
}

const DEFAULT_SIZE = { width: 1200, height: 800 }

/** The original's list-mode `srcSet` (ImageRegion.getImageSourceSet): its `w` descriptors decide the size. */
const listSrcSet = (attachment: ResponsiveImage | undefined): string | undefined => {
  if (!attachment || isGif(attachment)) return undefined
  const candidates: [ImageVersion | null | undefined, string][] = [
    [attachment.mdpi, '180w'],
    [attachment.hdpi, '750w'],
    [attachment.xhdpi, '1500w'],
    [attachment.optimized, '1920w'],
  ]
  const entries = candidates.flatMap(([version, width]) => (version?.url ? [`${version.url} ${width}`] : []))
  return entries.length > 0 ? entries.join(', ') : undefined
}

/** Grid streams use the original's `hdpi` rendition; static regions use the best one; a GIF its `optimized` file. */
const pickVersion = (attachment: ResponsiveImage | undefined, preferHdpi: boolean): ImageVersion | null => {
  if (!attachment) return null
  const order =
    preferHdpi && !isGif(attachment)
      ? [attachment.hdpi, attachment.optimized, attachment.xhdpi]
      : [attachment.optimized, attachment.xhdpi, attachment.hdpi]
  return [...order, attachment.mdpi, attachment.original].find((version) => !!version?.url) ?? null
}

/**
 * The original's `ImageRegion` for streams and comments: a picture that links to its post in a grid and
 * opens the lightbox elsewhere, hidden until it has loaded, with a buy button when it is for sale. An
 * animated upload plays its clip instead (`shouldUseVideo`), except in comments on a post page and on iOS.
 */
export const ImageRegionView = ({ postId, region, assets, loading, detailPath, owner }: ImageRegionViewProps) => {
  const attachment = assets.find((a) => a.id === region.links?.assets)?.attachment
  const isGridMode = !!detailPath
  const isCommentOnPostPage = isPostDetailPath(usePathname() ?? '') && owner === 'comment'
  const canPlayClips = useCanPlayClips()
  const { status, imageRef, onLoad, onError } = useImageStatus()
  const version = pickVersion(attachment, isGridMode)
  const src = version?.url ?? region.data.url
  if (!src) return null
  const buyLink = hasBuyLink(region.linkUrl) ? region.linkUrl : null
  const buyButton = buyLink && owner !== 'comment' ? <ElloBuyButton to={buyLink} /> : null
  // the original's `toggleLightBox(assetId, postId)` target, and the id the lightbox scrolls the page to
  const assetId = assetIdOf(region)
  const target = postId && assetId ? { postId, assetId } : null
  const id = target ? assetDomId(target) : undefined
  const clip =
    attachment?.video?.url && canPlayClips && !isCommentOnPostPage ? (
      <VideoAttachment id={id} attachment={attachment} isGridMode={isGridMode} isComment={owner === 'comment'} />
    ) : null
  const alt = altOf(region.data.alt, attachment)
  const shared = { id, src, role: 'presentation', loading, className: 'ImageAttachment', ref: imageRef, onLoad, onError } as const
  // a picture that failed is drawn by the browser alone, as in the original: no reserved box, no empty alt
  const failed = status === 'isFailing'
  const altProps = failed && !alt ? {} : { alt }
  if (!isGridMode) {
    const holder = (
      <div className="ImgHolder">
        {clip ?? (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- the original's srcset sizing (w descriptors, no sizes) sets the displayed size
          <img {...shared} {...altProps} srcSet={listSrcSet(attachment)} />
        )}
        {target ? <LightboxTriggerButton withBuy={!!buyLink} /> : null}
        {buyButton}
      </div>
    )
    return (
      <div className={cn('ImageRegion', !clip && status)}>
        {target ? (
          <LightboxRegion {...target} className="StreamImage">
            {holder}
          </LightboxRegion>
        ) : (
          <div className="StreamImage">{holder}</div>
        )}
      </div>
    )
  }
  const size = {
    width: version?.metadata?.width ?? DEFAULT_SIZE.width,
    height: version?.metadata?.height ?? DEFAULT_SIZE.height,
  }
  const picture = failed ? (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- see above
    <img {...shared} {...altProps} />
  ) : (
    <ElloImage {...shared} alt={alt} {...size} />
  )
  return (
    <div className={cn('ImageRegion', !clip && status)}>
      <div className="RegionContent">
        <Link href={detailPath}>{clip ?? picture}</Link>
        {target ? <LightboxTriggerLink {...target} href={detailPath} withBuy={!!buyLink} /> : null}
        {buyButton}
      </div>
    </div>
  )
}
