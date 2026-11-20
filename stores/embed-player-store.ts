import { create } from 'zustand'

interface EmbedPlayerState {
  /** The embed whose player was started with its play button; the original keeps one (`embetter.curPlayer`). */
  playingKey: string | null
  /** Starting a player takes the previous one down, like `EmbetterPlayer.play`. */
  play: (key: string) => void
  /** Takes the player down if it is the one playing. */
  stop: (key: string) => void
}

export const useEmbedPlayerStore = create<EmbedPlayerState>((set) => ({
  playingKey: null,
  play: (key) => set({ playingKey: key }),
  stop: (key) => set((state) => (state.playingKey === key ? { playingKey: null } : state)),
}))
