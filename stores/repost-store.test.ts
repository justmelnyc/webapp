import { useRepostStore } from './repost-store'

describe('repost store', () => {
  afterEach(() => useRepostStore.getState().stop())

  it('opens the editor on one post at a time', () => {
    useRepostStore.getState().start('1')
    useRepostStore.getState().start('2')
    expect(useRepostStore.getState().postId).toBe('2')
  })

  it('closes the editor', () => {
    useRepostStore.getState().start('1')
    useRepostStore.getState().stop()
    expect(useRepostStore.getState().postId).toBeNull()
  })
})
