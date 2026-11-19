import type { Comment } from '@/types/post'
import { commentHtmlToText } from '@/utils/comment-text'
import { newBlockId, type CommentBlock } from './use-comment-blocks'
import type { CommentRegionInput } from '@/lib/comment-regions'

/**
 * The original loads a comment's regions into the editor as blocks (text regions as text blocks,
 * image regions as pictures) and then `addEmptyTextBlock`s: the editor always ends on a text block.
 */
export const blocksOfComment = (comment: Comment): CommentBlock[] => {
  const blocks = comment.content.flatMap((region): CommentBlock[] => {
    if (region.kind === 'text') {
      return [{ id: newBlockId(), kind: 'text', text: commentHtmlToText(region.data) }]
    }
    if (region.kind === 'image' && region.data.url) {
      return [
        {
          id: newBlockId(),
          kind: 'image',
          previewUrl: region.data.url,
          url: region.data.url,
          status: 'done',
          ...(region.data.alt ? { alt: region.data.alt } : {}),
        },
      ]
    }
    return []
  })
  if (blocks[blocks.length - 1]?.kind !== 'text') {
    blocks.push({ id: newBlockId(), kind: 'text', text: '' })
  }
  return blocks
}

/** The blocks as the regions the API takes (pictures still uploading have no URL yet and are left out). */
export const regionsOfBlocks = (blocks: CommentBlock[]): CommentRegionInput[] =>
  blocks.flatMap((block): CommentRegionInput[] => {
    if (block.kind === 'image') {
      return block.url ? [{ kind: 'image', url: block.url, ...(block.alt ? { alt: block.alt } : {}) }] : []
    }
    return block.text.trim() ? [{ kind: 'text', text: block.text }] : []
  })
