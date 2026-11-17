import type { CSSProperties } from 'react'
import type { PageHeader } from '@/types/content'
import { cn } from '@/utils/cn'
import styles from './hero-image.module.css'

type HeroImageVars = CSSProperties & { '--hdpi'?: string; '--xhdpi'?: string }

const toUrl = (url: string | null | undefined): string | undefined => (url ? `url("${url}")` : undefined)

/**
 * The original's BackgroundImage (class "hasOverlay4"): the header image as a cover background,
 * darkened by a 40% overlay. The original picks hdpi up to 1200px wide and xhdpi above; both are
 * passed as custom properties and switched in CSS so the server render is already correct.
 */
export const HeroImage = ({ image }: { image: PageHeader['image'] }) => {
  const hdpi = image?.hdpi?.url ?? image?.xhdpi?.url
  const xhdpi = image?.xhdpi?.url ?? image?.hdpi?.url
  const style: HeroImageVars = { '--hdpi': toUrl(hdpi), '--xhdpi': toUrl(xhdpi) }
  return (
    <div className={cn('BackgroundImage', styles.background, 'hasOverlay4')}>
      <figure className={styles.figure} style={style} />
    </div>
  )
}
