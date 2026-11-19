'use client'

import { cn } from '@/utils/cn'
import { CommentImageBlock } from './comment-image-block'
import { CommentRegionTools } from './comment-region-tools'
import { CommentTextBlock } from './comment-text-block'
import type { CommentEditor } from './use-comment-editor'
import styles from './comment-editor.module.css'

interface CommentBlocksRegionProps {
  editor: CommentEditor
  /** Prefix of the textareas' ids: the first is `<idBase>-body`, the next `<idBase>-body-1`, ... */
  idBase: string
}

/** The original's `.editor-region`: one block per text or picture, each with its RegionTools. */
export const CommentBlocksRegion = ({ editor, idBase }: CommentBlocksRegionProps) => {
  const { blocks, fields, uploads, completer, tooLong, setText, remove, move } = editor
  return (
    <div className={cn('editor-region', styles.region)} data-num-blocks={blocks.length}>
      {blocks.map((block, index) => (
        <div key={block.id} className={cn('editor-block', styles.block)} data-block-id={block.id}>
          {block.kind === 'text' ? (
            <CommentTextBlock
              block={block}
              inputId={`${idBase}-body${index === 0 ? '' : `-${index}`}`}
              label={index === 0 ? 'Comment' : `Comment, part ${index + 1}`}
              fieldRef={(node) => {
                if (node) fields.current.set(block.id, node)
                else fields.current.delete(block.id)
              }}
              invalid={tooLong}
              onChange={setText}
              onKeyUp={completer.onKeyUp}
              onKeyDown={completer.onKeyDown}
            />
          ) : (
            <CommentImageBlock block={block} onRetry={uploads.retry} />
          )}
          <CommentRegionTools
            id={block.id}
            onRemove={(id) => {
              uploads.forget(id)
              remove(id)
            }}
            onMove={move}
          />
        </div>
      ))}
    </div>
  )
}
