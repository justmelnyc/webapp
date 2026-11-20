'use client'

import { ArrowIcon } from '@/components/icons'
import type { CommentImageBlock as CommentImageBlockData } from './use-comment-blocks'
import parts from '@/components/ui/editor-parts.module.css'
import styles from './comment-editor.module.css'

interface CommentImageBlockProps {
  block: CommentImageBlockData
  onRetry: (id: string) => void
}

/** The original's ImageBlock: the picture, with a dimmed "busy" cover while it uploads. */
export const CommentImageBlock = ({ block, onRetry }: CommentImageBlockProps) => (
  <div className={`editable image ${styles.imageBlock}`}>
    {block.status === 'uploading' ? (
      <div className={parts.busy} role="status" aria-label="Uploading">
        <div className={parts.busyArrow}>
          <ArrowIcon isAnimated />
        </div>
      </div>
    ) : null}
    {block.status === 'error' ? (
      <div className={parts.busy}>
        <button type="button" className={styles.retry} onClick={() => onRetry(block.id)}>
          Retry upload
        </button>
      </div>
    ) : null}
    {/* eslint-disable-next-line @next/next/no-img-element -- the original's plain editor preview (blob URL) */}
    <img alt="" src={block.previewUrl} />
  </div>
)
