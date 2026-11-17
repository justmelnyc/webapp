import type { Avatar, ImageVersion, ResponsiveImage } from '@/types/image'

type ResponsiveKey = keyof ResponsiveImage

const RESPONSIVE_ORDER: ResponsiveKey[] = ['optimized', 'xhdpi', 'hdpi', 'mdpi', 'ldpi', 'original']

/** First available URL, preferring the optimized rendition. */
export const responsiveUrl = (image: ResponsiveImage | null | undefined): string | null => {
  if (!image) return null
  for (const key of RESPONSIVE_ORDER) {
    const url = image[key]?.url
    if (url) return url
  }
  return null
}

export const responsiveVersion = (image: ResponsiveImage | null | undefined): ImageVersion | null => {
  if (!image) return null
  for (const key of RESPONSIVE_ORDER) {
    const version = image[key]
    if (version?.url) return version
  }
  return null
}

export type AvatarSize = keyof Avatar

export const avatarUrl = (avatar: Avatar | null | undefined, size: AvatarSize = 'regular'): string | null =>
  avatar?.[size]?.url ?? avatar?.regular?.url ?? avatar?.original?.url ?? null
