import { useStreamCommentsStore } from './stream-comments-store'

const state = () => useStreamCommentsStore.getState()

describe('stream comments store', () => {
  beforeEach(() => useStreamCommentsStore.setState({ open: {}, seeMore: null }))

  it('toggles a post open and closed, independently of other posts', () => {
    state().toggle('a')
    state().toggle('b')
    expect(state().open).toEqual({ a: 'tool', b: 'tool' })
    state().toggle('a')
    expect(state().open).toEqual({ b: 'tool' })
  })

  it('show opens from the lightbox and never closes or relabels an open post', () => {
    state().show('a')
    state().show('a')
    expect(state().open).toEqual({ a: 'lightbox' })
    state().toggle('b')
    state().show('b')
    expect(state().open.b).toBe('tool')
  })

  it('the comment tool closes comments the lightbox opened', () => {
    state().show('a')
    state().toggle('a')
    expect(state().open).toEqual({})
  })

  it('remembers a followed "See More" for its post, once', () => {
    state().followSeeMore('a')
    expect(state().takeSeeMore('b')).toBe(false)
    expect(state().takeSeeMore('a')).toBe(true)
    expect(state().takeSeeMore('a')).toBe(false)
  })
})
