import { cn } from '@/utils/cn'
import styles from './background-image.module.css'

type Overlay = 3 | 4 | 5 | 6

interface BackgroundImageProps {
  src: string | null | undefined
  /** The original's `hasOverlayN` modifier: a black tint of N/10 over the image. */
  overlay?: Overlay
}

const OVERLAY_CLASS: Record<Overlay, string | undefined> = {
  3: styles.overlay3,
  4: styles.overlay4,
  5: styles.overlay5,
  6: styles.overlay6,
}

/** The original's `.BackgroundImage`: an absolutely positioned cover image with a tint. */
export const BackgroundImage = ({ src, overlay }: BackgroundImageProps) => (
  <div className={cn('BackgroundImage', styles.root, overlay && OVERLAY_CLASS[overlay])}>
    <figure className={styles.image} style={src ? { backgroundImage: `url("${src}")` } : undefined} />
  </div>
)
