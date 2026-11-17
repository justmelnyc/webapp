'use client'

import { BlockControls } from '@/components/composer/block-controls'
import { ImageBlock } from '@/components/composer/image-block'
import { TextBlock } from '@/components/composer/text-block'
import type { ComposerBlock } from '@/stores/composer-store'

interface ComposerBlocksProps {
  blocks: ComposerBlock[]
  onRetry: (id: string) => void
}

export const ComposerBlocks = ({ blocks, onRetry }: ComposerBlocksProps) => (
  <ol className="flex flex-col gap-4">
    {blocks.map((block, index) => (
      <li key={block.id} className="border-stone flex items-start gap-2 border-b pb-4">
        <div className="min-w-0 flex-1">
          {block.kind === 'text' ? (
            <TextBlock block={block} autoFocus={index === 0} />
          ) : (
            <ImageBlock block={block} onRetry={onRetry} />
          )}
        </div>
        {blocks.length > 1 && <BlockControls id={block.id} index={index} count={blocks.length} />}
      </li>
    ))}
  </ol>
)
