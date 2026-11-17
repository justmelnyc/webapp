'use client'

import { Spinner } from '@/components/ui/spinner'
import { OutlineButton } from '@/components/ui/button'
import { useComposerStore, type ImageBlock as ImageBlockData } from '@/stores/composer-store'

interface ImageBlockProps {
  block: ImageBlockData
  onRetry: (id: string) => void
}

export const ImageBlock = ({ block, onRetry }: ImageBlockProps) => {
  const updateImage = useComposerStore((s) => s.updateImage)
  const removeBlock = useComposerStore((s) => s.removeBlock)
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-stone/40 relative inline-block max-w-full self-start">
        {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
        <img src={block.previewUrl} alt={block.alt || 'Upload preview'} className="max-h-96 max-w-full" />
        {block.status === 'uploading' && (
          <div className="bg-paper/60 absolute inset-0 flex items-center justify-center">
            <Spinner className="size-8" />
          </div>
        )}
        {block.status === 'error' && (
          <div className="bg-paper/80 absolute inset-0 flex items-center justify-center gap-2">
            <OutlineButton onClick={() => onRetry(block.id)}>Retry upload</OutlineButton>
            <OutlineButton onClick={() => removeBlock(block.id)}>Remove</OutlineButton>
          </div>
        )}
      </div>
      <input
        type="text"
        value={block.alt}
        onChange={(e) => updateImage(block.id, { alt: e.target.value })}
        aria-label="Image description"
        placeholder="Describe this image (optional)"
        className="border-stone w-full border-b bg-transparent py-1 text-sm outline-none"
      />
    </div>
  )
}
