'use client'

import { useSyncExternalStore } from 'react'

/** The original's #root::after probe: 2 columns, 3 from 60em, then 4..7 at 85 / 107.5 / 130 / 152.5em. */
const BREAKS = ['(min-width: 60em)', '(min-width: 85em)', '(min-width: 107.5em)', '(min-width: 130em)', '(min-width: 152.5em)']
const MIN_COLUMNS = 2

const subscribe = (notify: () => void): (() => void) => {
  const lists = BREAKS.map((query) => window.matchMedia(query))
  lists.forEach((list) => list.addEventListener('change', notify))
  return () => lists.forEach((list) => list.removeEventListener('change', notify))
}

const getSnapshot = (): number =>
  MIN_COLUMNS + BREAKS.reduce((count, query) => count + (window.matchMedia(query).matches ? 1 : 0), 0)

/** Number of grid columns for the current viewport (2 on the server and during hydration). */
export const useColumnCount = (): number => useSyncExternalStore(subscribe, getSnapshot, () => MIN_COLUMNS)
