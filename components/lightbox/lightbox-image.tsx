'use client'

import { useLayoutEffect, useRef, type MouseEvent } from 'react'
import { useCanPlayClips } from '@/components/posts/use-stream-widths'
import { VideoAttachment } from '@/components/posts/video-attachment'
import type { Asset, ImageRegion } from '@/types/post'
import type { ResponsiveImage } from '@/types/image'
import { cn } from '@/utils/cn'
import type { Size } from './image-scale'
import type { LightboxPair } from './lightbox-queue'
import { lightboxAssetDomId } from './scroll-to-asset'

interface Source {
  src: string | null | undefined
  srcSet?: string
}

/**
 * Which `srcset` the original gives a lightbox picture (`ImageRegion.getImageSourceSet`): the one of
 * a stream, or the same with `optimized` on a post page (for the post, its comments and its related posts).
 */
export type LightboxSources = 'stream' | 'post'

const CANDIDATES = {
  stream: [['mdpi', '180w'], ['hdpi', '750w'], ['xhdpi', '1500w']],
  post: [['mdpi', '180w'], ['hdpi', '750w'], ['xhdpi', '1500w'], ['optimized', '1920w']],
} as const satisfies Record<LightboxSources, readonly (readonly [keyof ResponsiveImage, string])[]>

/**
 * Port of `ImageRegion.renderAttachment` for a lightbox picture: a GIF plays from its `optimized`
 * file, a picture without an asset shows its own url, everything else gets `hdpi` plus the original's
 * `srcset` for where the lightbox was opened.
 */
const sourceOf = (region: ImageRegion, attachment: ResponsiveImage | undefined, sources: LightboxSources): Source => {
  if (!attachment) return { src: region.data.url }
  if (attachment.optimized?.metadata?.type === 'image/gif') return { src: attachment.optimized.url }
  const srcSet = CANDIDATES[sources]
    .flatMap(([key, width]) => (attachment[key]?.url ? [`${attachment[key].url} ${width}`] : []))
    .join(', ')
  return { src: attachment.hdpi?.url ?? region.data.url, srcSet: srcSet || undefined }
}

interface LightboxImageProps {
  pair: LightboxPair
  region: ImageRegion
  asset: Asset | undefined
  isSelected: boolean
  sources: LightboxSources
  /** The picture belongs to a comment (a comment's clips are sized from the comment column). */
  isComment: boolean
  /** The scaled size, once the picture has been measured. */
  size: Size | undefined
  onMeasure: (image: HTMLElement) => void
  onPick: (assetId: string, postId: string) => void
}

interface ClipProps extends Pick<LightboxImageProps, 'isSelected' | 'isComment' | 'size' | 'onMeasure'> {
  id: string
  attachment: ResponsiveImage
}

/**
 * `ImageRegion.renderVideoAttachment` in the lightbox: the clip at the size a list stream gives it,
 * measured as soon as it is on the page (it has no load event to wait for) and then scaled like a picture.
 */
const LightboxClip = ({ id, attachment, isSelected, isComment, size, onMeasure }: ClipProps) => {
  const video = useRef<HTMLVideoElement>(null)
  useLayoutEffect(() => {
    if (video.current) onMeasure(video.current)
  }, [onMeasure])
  return (
    <VideoAttachment
      ref={video}
      id={id}
      attachment={attachment}
      isGridMode={false}
      isComment={isComment}
      className={cn('ImageAttachment', isSelected && 'selected')}
      style={size}
    />
  )
}

/**
 * One picture of the queue (the original's `ImageRegion` with `isLightBoxImage`). An animated
 * upload plays its clip when the lightbox was opened from a stream (`shouldUseVideo`: not on a post
 * page, not on iOS).
 */
export const LightboxImage = ({ pair, region, asset, isSelected, sources, isComment, size, onMeasure, onPick }: LightboxImageProps) => {
  const canPlayClips = useCanPlayClips()
  const attachment = asset?.attachment
  const { src, srcSet } = sourceOf(region, attachment, sources)
  if (!src) return null
  const onClick = (event: MouseEvent): void => {
    if (!event.metaKey) onPick(pair.assetId, pair.postId)
  }
  const id = lightboxAssetDomId(pair)
  return (
    <div className="ImageRegion">
      <div className="LightBoxImage" onClick={onClick}>
        <div className="ImgHolderLightBox">
          {attachment?.video?.url && canPlayClips && sources === 'stream' ? (
            <LightboxClip id={id} attachment={attachment} isSelected={isSelected} isComment={isComment} size={size} onMeasure={onMeasure} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- measured at the size the original's srcset gives it, then scaled
            <img
              id={id}
              className={cn('ImageAttachment', isSelected && 'selected')}
              role="presentation"
              alt={region.data.alt?.replace(/\.(jpg|gif)$/, '') ?? ''}
              srcSet={srcSet}
              src={src}
              style={size}
              onLoad={(event) => onMeasure(event.currentTarget)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
