import type { Avatar, ImageVersion, ResponsiveImage } from '@/types/image'

export const version = (url: string, width: number, height: number): ImageVersion => ({
  url,
  metadata: { height, width, type: 'image/jpeg', size: width * height },
})

/** Same shape as mock/media.js `responsive` (including the extra `video: null`). */
export const responsive = (url: string, w: number, h: number): ResponsiveImage & { video: null } => ({
  xhdpi: version(url, w, h),
  hdpi: version(url, w, h),
  mdpi: version(url, w, h),
  ldpi: version(url, w, h),
  optimized: version(url, w, h),
  original: version(url, w, h),
  video: null,
})

/** Same shape as mock/media.js `avatar`. */
export const avatar = (username: string): Avatar => {
  const url = (size: number) => `https://i.pravatar.cc/${size}?u=${username}`
  return {
    small: version(url(60), 60, 60),
    regular: version(url(120), 120, 120),
    large: version(url(240), 240, 240),
    original: version(url(240), 240, 240),
  }
}
