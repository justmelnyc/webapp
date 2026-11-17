import { canPost, useComposerStore } from '@/stores/composer-store'

describe('composer store', () => {
  beforeEach(() => useComposerStore.getState().reset())

  it('commits text on every change and gates posting', () => {
    const { open, setText } = useComposerStore.getState()
    open()
    const first = useComposerStore.getState().blocks[0]
    expect(first?.kind).toBe('text')
    expect(canPost(useComposerStore.getState().blocks)).toBe(false)
    setText(first!.id, 'hi')
    expect(canPost(useComposerStore.getState().blocks)).toBe(true)
  })

  it('blocks posting while an image uploads', () => {
    const { addImage, updateImage, setText, open } = useComposerStore.getState()
    open()
    setText(useComposerStore.getState().blocks[0]!.id, 'hi')
    const id = addImage('data:x')
    expect(canPost(useComposerStore.getState().blocks)).toBe(false)
    updateImage(id, { status: 'done', url: 'http://x/y.png' })
    expect(canPost(useComposerStore.getState().blocks)).toBe(true)
  })
})
