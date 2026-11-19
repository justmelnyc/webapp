'use client'

import { useReducer } from 'react'

export interface CommentTextBlock {
  id: string
  kind: 'text'
  text: string
}

export interface CommentImageBlock {
  id: string
  kind: 'image'
  /** A blob: URL of the picked file, shown while (and after) it uploads. */
  previewUrl: string
  /** The stored image once the upload finished. */
  url: string | null
  /** The alt text an existing picture already carries (kept when the comment is edited). */
  alt?: string
  status: 'uploading' | 'done' | 'error'
}

export type CommentBlock = CommentTextBlock | CommentImageBlock

type Action =
  | { type: 'setText'; id: string; text: string }
  | { type: 'appendText'; text: string }
  | { type: 'addImage'; id: string; previewUrl: string; textId: string }
  | {
      type: 'updateImage'
      id: string
      patch: Partial<Pick<CommentImageBlock, 'url' | 'status'>>
      textId: string
    }
  | { type: 'remove'; id: string; textId: string }
  | { type: 'move'; id: string; delta: number }
  | { type: 'reset'; id: string }

let counter = 0
export const newBlockId = (): string => `comment-block-${(counter += 1)}`

const emptyText = (id: string): CommentTextBlock => ({ id, kind: 'text', text: '' })

/** The original's `addEmptyTextBlock`: always end on a text block, and never leave two empty ones. */
const withTrailingText = (blocks: CommentBlock[], textId: string): CommentBlock[] => {
  const last = blocks[blocks.length - 1]
  const beforeLast = blocks[blocks.length - 2]
  if (blocks.length > 1 && beforeLast?.kind === 'text' && last?.kind === 'text' && last.text === '')
    return blocks.slice(0, -1)
  if (!last || last.kind !== 'text') return [...blocks, emptyText(textId)]
  return blocks
}

export const commentBlocksReducer = (blocks: CommentBlock[], action: Action): CommentBlock[] => {
  switch (action.type) {
    case 'setText':
      return blocks.map((b) =>
        b.id === action.id && b.kind === 'text' ? { ...b, text: action.text } : b,
      )
    case 'appendText': {
      const index = blocks.map((b) => b.kind).lastIndexOf('text')
      return blocks.map((b, i) =>
        i === index && b.kind === 'text' ? { ...b, text: b.text + action.text } : b,
      )
    }
    case 'addImage': {
      const last = blocks[blocks.length - 1]
      // the original's `removeEmptyTextBlock`: the empty text block at the end makes room for the picture
      const kept = last?.kind === 'text' && last.text === '' ? blocks.slice(0, -1) : blocks
      const image: CommentImageBlock = {
        id: action.id,
        kind: 'image',
        previewUrl: action.previewUrl,
        url: null,
        status: 'uploading',
      }
      return withTrailingText([...kept, image], action.textId)
    }
    case 'updateImage':
      return blocks.map((b) =>
        b.id === action.id && b.kind === 'image' ? { ...b, ...action.patch } : b,
      )
    case 'remove':
      return withTrailingText(
        blocks.filter((b) => b.id !== action.id),
        action.textId,
      )
    case 'move': {
      const from = blocks.findIndex((b) => b.id === action.id)
      const to = from + action.delta
      if (from < 0 || to < 0 || to >= blocks.length) return blocks
      const moved = [...blocks]
      const [block] = moved.splice(from, 1)
      if (block) moved.splice(to, 0, block)
      return moved
    }
    case 'reset':
      return [emptyText(action.id)]
  }
}

/** The original's `hasContent`: more than one block, or text in the first. */
export const hasCommentContent = (blocks: CommentBlock[]): boolean => {
  const first = blocks[0]
  return blocks.length > 1 || (first?.kind === 'text' && first.text.trim().length > 0)
}

export const hasUploadsInFlight = (blocks: CommentBlock[]): boolean =>
  blocks.some((b) => b.kind === 'image' && b.status === 'uploading')

/** Postable: some text or a finished picture, nothing uploading, nothing failed. */
export const canPostComment = (blocks: CommentBlock[]): boolean =>
  !blocks.some((b) => b.kind === 'image' && b.status !== 'done') &&
  blocks.some((b) => (b.kind === 'text' ? b.text.trim().length > 0 : true))

export const useCommentBlocks = (initial?: CommentBlock[]) => {
  const [blocks, dispatch] = useReducer(
    commentBlocksReducer,
    initial,
    (start): CommentBlock[] => start ?? [emptyText(newBlockId())],
  )
  return {
    blocks,
    setText: (id: string, text: string): void => dispatch({ type: 'setText', id, text }),
    appendText: (text: string): void => dispatch({ type: 'appendText', text }),
    addImage: (previewUrl: string): string => {
      const id = newBlockId()
      dispatch({ type: 'addImage', id, previewUrl, textId: newBlockId() })
      return id
    },
    updateImage: (id: string, patch: Partial<Pick<CommentImageBlock, 'url' | 'status'>>): void =>
      dispatch({ type: 'updateImage', id, patch, textId: newBlockId() }),
    remove: (id: string): void => dispatch({ type: 'remove', id, textId: newBlockId() }),
    move: (id: string, delta: number): void => dispatch({ type: 'move', id, delta }),
    reset: (): void => dispatch({ type: 'reset', id: newBlockId() }),
  }
}
