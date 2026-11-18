import { hasMedia, useComposerStore } from './composer-store'

describe('composer buy link', () => {
  beforeEach(() => useComposerStore.getState().reset())

  it('stores, removes and resets the link', () => {
    const { setBuyLink } = useComposerStore.getState()
    setBuyLink('https://shop.example.com/x')
    expect(useComposerStore.getState().buyLink).toBe('https://shop.example.com/x')
    setBuyLink(null)
    expect(useComposerStore.getState().buyLink).toBe('')
    setBuyLink('https://a.example.com')
    useComposerStore.getState().reset()
    expect(useComposerStore.getState().buyLink).toBe('')
  })

  it('needs an image before selling', () => {
    useComposerStore.getState().open()
    expect(hasMedia(useComposerStore.getState().blocks)).toBe(false)
    useComposerStore.getState().addImage('blob:x')
    expect(hasMedia(useComposerStore.getState().blocks)).toBe(true)
  })
})
