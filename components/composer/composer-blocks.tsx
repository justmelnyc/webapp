'use client'

import { ImageBlock } from '@/components/composer/image-block'
import { RegionTools } from '@/components/composer/region-tools'
import { TextBlock } from '@/components/composer/text-block'
import type { ComposerBlock } from '@/stores/composer-store'
import styles from './omnibar.module.css'

interface ComposerBlocksProps {
  blocks: ComposerBlock[]
  onRetry: (id: string) => void
}

export const ComposerBlocks = ({ blocks, onRetry }: ComposerBlocksProps) => (
  <div className={`editor-region ${styles.region}`} data-num-blocks={blocks.length}>
    {blocks.map((block, index) => (
      <div key={block.id} className={`editor-block ${styles.block}`} data-block-id={block.id}>
        {block.kind === 'text' ? (
          <TextBlock block={block} autoFocus={index === 0} />
        ) : (
          <ImageBlock block={block} onRetry={onRetry} />
        )}
        <RegionTools id={block.id} />
      </div>
    ))}
  </div>
)
