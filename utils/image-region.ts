import type { ResponsiveImage } from '@/types/image'

/** Ports of the size and source rules in the original's `regions/ImageRegion.js` and `selectors/gui.js`. */

export interface ImageMetadata {
  width: number
  height: number
  ratio: number
}

/** `getAttachmentMetadata`: the first of optimized, xhdpi, hdpi that says how big the picture is. */
export const attachmentMetadata = (attachment: ResponsiveImage): ImageMetadata | null => {
  const metadata = [attachment.optimized, attachment.xhdpi, attachment.hdpi]
    .map((version) => version?.metadata)
    .find((candidate) => !!candidate?.width)
  const width = Number(metadata?.width)
  const height = Number(metadata?.height)
  return width > 0 && height > 0 ? { width, height, ratio: width / height } : null
}

interface Constraint {
  /** The column in a grid, the content area in a list. */
  allowableWidth: number
  /** Comments in a grid sit next to an avatar. */
  widthOffset?: number
  isGridMode: boolean
}

/** `getImageDimensions`: as wide as the space allows, never past 1:1 or the tallest allowed cell. */
export const imageDimensions = (
  { height, ratio }: ImageMetadata,
  { allowableWidth, widthOffset = 0, isGridMode }: Constraint,
): { width: number; height: number } => {
  const maxCellHeight = isGridMode ? 1200 : 7500
  const constrained = Math.round((allowableWidth - widthOffset) * (1 / ratio))
  const fitted = Math.min(constrained, height, maxCellHeight)
  return { width: Math.round(fitted * ratio), height: fitted }
}

export interface StreamWidths {
  columnWidth: number
  contentWidth: number
  commentOffset: number
}

/** `selectColumnWidth`, `selectContentWidth` and `selectCommentOffset` for a window and its column count. */
export const streamWidths = (innerWidth: number, columnCount: number): StreamWidths => {
  const isMobile = innerWidth < 640
  const padding = isMobile ? 10 : columnCount >= 4 ? 40 : 20
  return {
    columnWidth: Math.round((innerWidth - (columnCount + 1) * padding) / columnCount),
    contentWidth: Math.round(innerWidth - padding * 2),
    commentOffset: isMobile ? 40 : 60,
  }
}

/** `isGif`: animated pictures play from their `optimized` file, without a `srcset`. */
export const isGif = (attachment: ResponsiveImage): boolean => attachment.optimized?.metadata?.type === 'image/gif'

/** The original drops the file extension it keeps in `alt` (`.jpg`, or `.gif` on a GIF). */
export const altOf = (alt: string | null | undefined, attachment?: ResponsiveImage | null): string =>
  (alt ?? '').replace(attachment && isGif(attachment) ? '.gif' : '.jpg', '')

/** `isIOS`: iOS will not autoplay the clips inline, so it gets the still. */
export const isIOS = (userAgent: string): boolean => /iPad|iPhone|iPod/i.test(userAgent)
