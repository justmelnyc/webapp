'use client'

import type { CSSProperties, Ref } from 'react'
import { useStreamWidths } from '@/components/posts/use-stream-widths'
import type { ResponsiveImage } from '@/types/image'
import { attachmentMetadata, imageDimensions } from '@/utils/image-region'

/** Comments outside a grid are laid out 650 wide (`CommentContainer`). */
const COMMENT_CONTENT_WIDTH = 650

interface VideoAttachmentProps {
  id?: string
  /** The attachment whose `video` rendition plays; its stills say how big the picture is. */
  attachment: ResponsiveImage
  isGridMode: boolean
  isComment: boolean
  /** The lightbox adds `selected` and, once the clip is measured, its scaled size. */
  className?: string
  style?: CSSProperties
  ref?: Ref<HTMLVideoElement>
}

/**
 * The original's `VideoAsset`: an animated upload's clip, playing silently in a loop where the still
 * would be. It has no intrinsic layout of its own: `ImageRegion.getImageDimensions` fits it to the grid
 * column or the list's content width.
 */
export const VideoAttachment = ({ id, attachment, isGridMode, isComment, className = 'ImageAttachment', style, ref }: VideoAttachmentProps) => {
  const { columnWidth, contentWidth, commentOffset } = useStreamWidths()
  const metadata = attachmentMetadata(attachment)
  const listWidth = isComment ? COMMENT_CONTENT_WIDTH : contentWidth
  const size = metadata
    ? imageDimensions(metadata, {
        allowableWidth: isGridMode ? columnWidth : listWidth,
        widthOffset: isGridMode && isComment ? commentOffset : 0,
        isGridMode,
      })
    : {}
  return (
    <video ref={ref} id={id} autoPlay loop muted playsInline {...size} className={className} style={style}>
      <track kind="captions" />
      <source src={attachment.video?.url ?? undefined} />
    </video>
  )
}
