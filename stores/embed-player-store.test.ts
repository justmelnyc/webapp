import { useEmbedPlayerStore } from './embed-player-store'

describe('embed player store', () => {
  beforeEach(() => useEmbedPlayerStore.setState({ playingKey: null }))

  it('keeps one player: starting another replaces it', () => {
    useEmbedPlayerStore.getState().play('a')
    useEmbedPlayerStore.getState().play('b')
    expect(useEmbedPlayerStore.getState().playingKey).toBe('b')
  })

  it('only stops the player that is playing', () => {
    useEmbedPlayerStore.getState().play('a')
    useEmbedPlayerStore.getState().stop('b')
    expect(useEmbedPlayerStore.getState().playingKey).toBe('a')
    useEmbedPlayerStore.getState().stop('a')
    expect(useEmbedPlayerStore.getState().playingKey).toBeNull()
  })
})
