import { createContext, useContext } from 'react'
import { createStore, useStore, type StateCreator, type StoreApi } from 'zustand'
import { isEditorEmpty } from '@/utils/editor-html'

export interface TextBlock {
  id: string
  kind: 'text'
  /** The contenteditable's HTML (bold, italic and links), as the original's text block holds it. */
  text: string
}

/** A pasted video/audio link, resolved to the original's `embed` region data. */
export interface EmbedBlock {
  id: string
  kind: 'embed'
  service: string
  url: string
  thumbnailLargeUrl: string
  embedId: string
}

export interface ImageBlock {
  id: string
  kind: 'image'
  url: string | null
  previewUrl: string
  status: 'uploading' | 'done' | 'error'
  alt: string
}

export type ComposerBlock = TextBlock | ImageBlock | EmbedBlock

export type ComposerMode = 'post' | 'edit' | 'repost'

/** The invite a post is being submitted to (the original's editor `artistInvite`). */
export interface ComposerInvite {
  id: string
  title: string
}

export interface ComposerState {
  isOpen: boolean
  /** Set by an invite's SUBMIT button: the omnibar shows "Submit to: <title>" and the post becomes a submission. */
  artistInvite: ComposerInvite | null
  /** After a submission the omnibar shows "Submission received!" until it is dismissed (the original's `showArtistInviteSuccess`). */
  inviteSuccess: boolean
  openForInvite: (invite: ComposerInvite) => void
  /** Clears the draft but keeps the omnibar open on the success message. */
  finishInviteSubmission: () => void
  dismissInviteSuccess: () => void
  /** `edit` is the inline editor on an existing post (the original's `isPostEditing`). */
  mode: ComposerMode
  editingPostId: string | null
  blocks: ComposerBlock[]
  categoryIds: string[]
  /** The post-level buy link (the original's `postBuyLink`): applied to every block as `link_url`. */
  buyLink: string
  isSubmitting: boolean
  open: () => void
  close: () => void
  reset: () => void
  addText: () => string
  setText: (id: string, text: string) => void
  addImage: (previewUrl: string) => string
  /** Adds a resolved embed after the text it was pasted from, keeping an empty text block to type in. */
  addEmbed: (embed: Omit<EmbedBlock, 'id' | 'kind'>) => void
  /** Loads an existing post's blocks into this editor for the inline edit flow. */
  startEdit: (postId: string, blocks: ComposerBlock[], categoryIds: string[], buyLink: string) => void
  /** Opens the inline repost editor on `postId`: an empty draft that is posted as a repost. */
  startRepost: (postId: string) => void
  updateImage: (id: string, patch: Partial<Omit<ImageBlock, 'id' | 'kind'>>) => void
  removeBlock: (id: string) => void
  moveBlock: (id: string, direction: -1 | 1) => void
  toggleCategory: (id: string) => void
  /** The omnibar's category selector is single-choice; `null` clears it. */
  setCategory: (id: string | null) => void
  setBuyLink: (url: string | null) => void
  setSubmitting: (value: boolean) => void
}

let counter = 0
const newId = (): string => `block-${Date.now().toString(36)}-${counter++}`

const firstText = (): TextBlock => ({ id: newId(), kind: 'text', text: '' })

const revoke = (block: ComposerBlock): void => {
  if (block.kind === 'image' && block.previewUrl.startsWith('blob:')) URL.revokeObjectURL(block.previewUrl)
}

const composerCreator: StateCreator<ComposerState> = (set, get) => ({
  isOpen: false,
  artistInvite: null,
  inviteSuccess: false,
  mode: 'post',
  editingPostId: null,
  blocks: [],
  categoryIds: [],
  buyLink: '',
  isSubmitting: false,
  open: () => set((s) => ({ isOpen: true, blocks: s.blocks.length ? s.blocks : [firstText()] })),
  openForInvite: (artistInvite) => set((s) => ({ isOpen: true, artistInvite, blocks: s.blocks.length ? s.blocks : [firstText()] })),
  finishInviteSubmission: () => {
    get().blocks.forEach(revoke)
    set({ isOpen: true, artistInvite: null, inviteSuccess: true, mode: 'post', editingPostId: null, blocks: [], categoryIds: [], buyLink: '', isSubmitting: false })
  },
  dismissInviteSuccess: () => set({ isOpen: false, inviteSuccess: false }),
  close: () => set({ isOpen: false, inviteSuccess: false }),
  reset: () => {
    get().blocks.forEach(revoke)
    set({ isOpen: false, artistInvite: null, inviteSuccess: false, mode: 'post', editingPostId: null, blocks: [], categoryIds: [], buyLink: '', isSubmitting: false })
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
  addEmbed: (embed) =>
    set((s) => {
      const block: EmbedBlock = { id: newId(), kind: 'embed', ...embed }
      const blocks = s.blocks.filter((b, i) => !(b.kind === 'text' && isEditorEmpty(b.text) && i === s.blocks.length - 1))
      return { blocks: [...blocks, block, firstText()] }
    }),
  startRepost: (postId) =>
    set({ isOpen: true, mode: 'repost', editingPostId: postId, blocks: [firstText()], categoryIds: [], buyLink: '', isSubmitting: false }),
  startEdit: (postId, blocks, categoryIds, buyLink) =>
    set({ isOpen: true, mode: 'edit', editingPostId: postId, blocks, categoryIds, buyLink, isSubmitting: false }),
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
  setCategory: (id) => set({ categoryIds: id ? [id] : [] }),
  setBuyLink: (url) => set({ buyLink: url ?? '' }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
})

export const createComposerStore = (): StoreApi<ComposerState> => createStore<ComposerState>(composerCreator)

/** The omnibar's draft. The inline post editor gets its own store through `ComposerStoreContext`. */
export const omnibarStore = createComposerStore()
export const ComposerStoreContext = createContext<StoreApi<ComposerState>>(omnibarStore)
export const useComposerApi = (): StoreApi<ComposerState> => useContext(ComposerStoreContext)

export const useComposerStore = Object.assign(
  <T>(selector: (state: ComposerState) => T): T => useStore(useContext(ComposerStoreContext), selector),
  { getState: omnibarStore.getState, setState: omnibarStore.setState },
)

export const isDraftDirty = (blocks: ComposerBlock[]): boolean =>
  blocks.some((b) => (b.kind === 'text' ? !isEditorEmpty(b.text) : true))

export const hasUploadsInFlight = (blocks: ComposerBlock[]): boolean =>
  blocks.some((b) => b.kind === 'image' && b.status === 'uploading')

/** Postable: at least one non-empty text or finished image, nothing uploading, no failed images. */
export const canPost = (blocks: ComposerBlock[]): boolean => {
  if (hasUploadsInFlight(blocks)) return false
  if (blocks.some((b) => b.kind === 'image' && b.status === 'error')) return false
  return blocks.some((b) => {
    if (b.kind === 'text') return !isEditorEmpty(b.text)
    return b.kind === 'embed' || (b.status === 'done' && b.url !== null)
  })
}

/** The original's `hasMedia`: the Sell button needs an image (or embed) in the post. */
export const hasMedia = (blocks: ComposerBlock[]): boolean => blocks.some((b) => b.kind !== 'text')
