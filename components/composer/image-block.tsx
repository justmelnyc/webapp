'use client'

import { ArrowIcon } from '@/components/icons'
import type { ImageBlock as ImageBlockData } from '@/stores/composer-store'
import styles from './omnibar.module.css'

interface ImageBlockProps {
  block: ImageBlockData
  onRetry: (id: string) => void
}

/** The original's ImageBlock: the picture, with a dimmed "busy" cover while it uploads. */
export const ImageBlock = ({ block, onRetry }: ImageBlockProps) => (
  <div className={`editable image ${styles.editable} ${styles.image}`}>
    {block.status === 'uploading' && (
      <div className={styles.busy} role="status" aria-label="Uploading">
        <div className={styles.busyArrow}>
          <ArrowIcon isAnimated />
        </div>
      </div>
    )}
    {block.status === 'error' && (
      <div className={styles.retry}>
        <button type="button" onClick={() => onRetry(block.id)}>
          Retry upload
        </button>
      </div>
    )}
    {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
    <img src={block.previewUrl} alt={block.alt || 'Upload preview'} />
  </div>
)
