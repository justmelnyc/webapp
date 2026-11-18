import Link from 'next/link'
import type { CSSProperties, MouseEventHandler } from 'react'
import { ElloImage } from '@/components/ui/ello-image'
import { cn } from '@/utils/cn'
import styles from './avatar.module.css'

interface AvatarProps {
  src: string | null | undefined
  name: string
  /**
   * Fixed pixel size of the circle. Omit it to get the original's responsive size
   * (30px below 60em, 40px from 60em up).
   */
  size?: number
  className?: string
  /** Renders the avatar as a link, like the original's `to`. */
  href?: string
  /** Renders the avatar as a button, like the original's `onClick`. */
  onClick?: MouseEventHandler<HTMLButtonElement>
  'aria-label'?: string
}

const AvatarImage = ({ src, name, size }: { src: string; name: string; size: number }) => (
  <ElloImage src={src} alt={name} width={size} height={size} className={styles.image} />
)

export const Avatar = ({ src, name, size, className, href, onClick, 'aria-label': ariaLabel }: AvatarProps) => {
  const classes = cn('Avatar', styles.avatar, className)
  const style: CSSProperties | undefined = size ? { width: size, height: size } : undefined
  const image = src ? <AvatarImage src={src} name={name} size={size ?? 120} /> : null

  if (href) {
    return (
      <Link href={href} className={classes} style={style} aria-label={ariaLabel}>
        {image}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button type="button" className={classes} style={style} onClick={onClick} aria-label={ariaLabel}>
        {image}
      </button>
    )
  }
  return (
    <span className={classes} style={style}>
      {image}
    </span>
  )
}
