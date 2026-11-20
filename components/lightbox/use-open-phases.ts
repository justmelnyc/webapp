'use client'

import { useEffect, useState } from 'react'

const LOADED_DELAY = 200

export interface OpenPhases {
  /** The queue is still hidden (`.LightBox.loading`). */
  loading: boolean
  /** The queue has faded in; from now on it animates when it moves (`.LightBox.loaded`). */
  loaded: boolean
}

/** Port of `removeLoadingClass`: the queue fades in a moment after opening, and only then animates. */
export const useOpenPhases = (openDelay: number): OpenPhases => {
  const [phase, setPhase] = useState<'loading' | 'shown' | 'loaded'>('loading')

  useEffect(() => {
    let loaded: ReturnType<typeof setTimeout> | undefined
    const shown = setTimeout(() => {
      setPhase('shown')
      loaded = setTimeout(() => setPhase('loaded'), LOADED_DELAY)
    }, openDelay)
    return () => {
      clearTimeout(shown)
      clearTimeout(loaded)
    }
  }, [openDelay])

  return { loading: phase === 'loading', loaded: phase === 'loaded' }
}
