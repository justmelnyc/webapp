import { create } from 'zustand'

export interface TextBlock {
  id: string
  kind: 'text'
  text: string
}

export interface ImageBlock {
  id: string
  kind: 'image'
  url: string | null
  previewUrl: string
  status: 'uploading' | 'done' | 'error'
  alt: string
}

export type ComposerBlock = TextBlock | ImageBlock

interface ComposerState {
  isOpen: boolean
  blocks: ComposerBlock[]
  categoryIds: string[]
  isSubmitting: boolean
  open: () => void
  close: () => void
  reset: () => void
  addText: () => string
  setText: (id: string, text: string) => void
  addImage: (previewUrl: string) => string
  updateImage: (id: string, patch: Partial<Omit<ImageBlock, 'id' | 'kind'>>) => void
  removeBlock: (id: string) => void
  moveBlock: (id: string, direction: -1 | 1) => void
  toggleCategory: (id: string) => void
  setSubmitting: (value: boolean) => void
}

let counter = 0
const newId = (): string => `block-${Date.now().toString(36)}-${counter++}`

const firstText = (): TextBlock => ({ id: newId(), kind: 'text', text: '' })

const revoke = (block: ComposerBlock): void => {
  if (block.kind === 'image' && block.previewUrl.startsWith('blob:')) URL.revokeObjectURL(block.previewUrl)
}

export const useComposerStore = create<ComposerState>((set, get) => ({
  isOpen: false,
  blocks: [],
  categoryIds: [],
  isSubmitting: false,
  open: () => set((s) => ({ isOpen: true, blocks: s.blocks.length ? s.blocks : [firstText()] })),
  close: () => set({ isOpen: false }),
  reset: () => {
    get().blocks.forEach(revoke)
    set({ isOpen: false, blocks: [], categoryIds: [], isSubmitting: false })
  },
  addText: () => {
    const block = firstText()
    set((s) => ({ blocks: [...s.blocks, block] }))
    return block.id
  },
  // Committed on every change (never on blur) so text can't be lost.
  setText: (id, text) =>
    set((s) => ({ blocks: s.blocks.map((b) => (b.id === id && b.kind === 'text' ? { ...b, text } : b)) })),
  addImage: (previewUrl) => {
    const id = newId()
    const block: ImageBlock = { id, kind: 'image', url: null, previewUrl, status: 'uploading', alt: '' }
    set((s) => {
      // Reuse a trailing empty text block's slot: keep it after the image so the user can keep typing.
      const last = s.blocks[s.blocks.length - 1]
      if (last?.kind === 'text' && last.text === '' && s.blocks.length === 1) return { blocks: [block, last] }
      return { blocks: [...s.blocks, block] }
    })
    return id
  },
  updateImage: (id, patch) =>
    set((s) => ({ blocks: s.blocks.map((b) => (b.id === id && b.kind === 'image' ? { ...b, ...patch } : b)) })),
  removeBlock: (id) => {
    const target = get().blocks.find((b) => b.id === id)
    if (target) revoke(target)
    set((s) => ({ blocks: s.blocks.filter((b) => b.id !== id) }))
  },
  moveBlock: (id, direction) =>
    set((s) => {
      const from = s.blocks.findIndex((b) => b.id === id)
      const to = from + direction
      if (from < 0 || to < 0 || to >= s.blocks.length) return s
      const blocks = [...s.blocks]
      const [moved] = blocks.splice(from, 1)
      if (moved) blocks.splice(to, 0, moved)
      return { blocks }
    }),
  toggleCategory: (id) =>
    set((s) => ({
      categoryIds: s.categoryIds.includes(id) ? s.categoryIds.filter((c) => c !== id) : [...s.categoryIds, id],
    })),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
}))

export const isDraftDirty = (blocks: ComposerBlock[]): boolean =>
  blocks.some((b) => (b.kind === 'text' ? b.text.trim() !== '' : true))

export const hasUploadsInFlight = (blocks: ComposerBlock[]): boolean =>
  blocks.some((b) => b.kind === 'image' && b.status === 'uploading')

/** Postable: at least one non-empty text or finished image, nothing uploading, no failed images. */
export const canPost = (blocks: ComposerBlock[]): boolean => {
  if (hasUploadsInFlight(blocks)) return false
  if (blocks.some((b) => b.kind === 'image' && b.status === 'error')) return false
  return blocks.some((b) => (b.kind === 'text' ? b.text.trim() !== '' : b.status === 'done' && b.url !== null))
}
