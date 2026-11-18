'use client'

import type { EmbedBlock as EmbedBlockData } from '@/stores/composer-store'
import '@/components/posts/embetter.css'
import styles from './omnibar.module.css'

/** The original's EmbedBlock: embetter's static markup (thumbnail linking to the media) inside an editable. */
export const EmbedBlock = ({ block }: { block: EmbedBlockData }) => (
  <div className={`editable embed ${styles.editable}`}>
    <div className="embetter" {...{ [`data-${block.service}-id`]: block.embedId }}>
      <a href={block.url} target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element -- the original's plain thumbnail */}
        <img src={block.thumbnailLargeUrl} alt={block.service} />
      </a>
    </div>
  </div>
)
