import { canPost, createComposerStore, isDraftDirty } from './composer-store'

const embed = { service: 'youtube', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailLargeUrl: 'https://x/t.jpg', embedId: 'dQw4w9WgXcQ' }

describe('composer store: embeds', () => {
  it('adds an embed, drops the empty trailing text and leaves a new one to type in', () => {
    const store = createComposerStore()
    store.getState().open()
    store.getState().addEmbed(embed)
    const kinds = store.getState().blocks.map((b) => b.kind)
    expect(kinds).toEqual(['embed', 'text'])
    expect(canPost(store.getState().blocks)).toBe(true)
  })

  it('treats leftover markup as an empty draft', () => {
    const store = createComposerStore()
    store.getState().open()
    store.getState().setText(store.getState().blocks[0]!.id, '<br>')
    expect(isDraftDirty(store.getState().blocks)).toBe(false)
    expect(canPost(store.getState().blocks)).toBe(false)
  })
})

describe('composer store: editing a post', () => {
  it('has its own draft per store and resets back to post mode', () => {
    const omnibar = createComposerStore()
    const inline = createComposerStore()
    inline.getState().startEdit('9', [{ id: 'a', kind: 'text', text: 'hello' }], ['2'], '')
    expect(inline.getState()).toMatchObject({ mode: 'edit', editingPostId: '9', isOpen: true, categoryIds: ['2'] })
    expect(omnibar.getState().blocks).toEqual([])
    inline.getState().reset()
    expect(inline.getState()).toMatchObject({ mode: 'post', editingPostId: null, isOpen: false })
  })
})
