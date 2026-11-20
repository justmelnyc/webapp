'use client'

import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { paginationOf, samePair, type Direction, type LightboxPair, type Pagination } from './lightbox-queue'
import { scrollToAsset } from './scroll-to-asset'

interface State {
  selected: LightboxPair | null
  /** The picture shown before this one; tells which way the queue moved. */
  previous: LightboxPair | null
}

type Action =
  | { type: 'toggle'; pair: LightboxPair }
  | { type: 'select'; pair: LightboxPair }
  | { type: 'close' }

const CLOSED: State = { selected: null, previous: null }

const reducer = (state: State, action: Action): State => {
  if (action.type === 'close') return CLOSED
  // `handleImageClick`: picking the selected picture again closes the lightbox
  if (action.type === 'toggle' && samePair(state.selected, action.pair)) return CLOSED
  if (samePair(state.selected, action.pair)) return state
  return { selected: action.pair, previous: state.selected }
}

export interface LightboxState {
  selected: LightboxPair | null
  direction: Direction
  pagination: Pagination
  toggle: (assetId: string, postId: string) => void
  advance: (direction: Direction) => void
  close: () => void
}

interface Options {
  /** A comment list scrolls the sidebar of a post page instead of the post. */
  isCommentStream: boolean
}

/**
 * The state of the original's LightBoxContainer: which picture is selected, its neighbours in the
 * queue, and the page scrolled along to the selected picture.
 */
export const useLightboxState = (pairs: LightboxPair[], { isCommentStream }: Options): LightboxState => {
  const [state, dispatch] = useReducer(reducer, CLOSED)
  // a picture that left the page (its post was removed or replaced) takes the lightbox with it
  const selected = state.selected && pairs.some((pair) => samePair(pair, state.selected)) ? state.selected : null
  const { previous } = state
  const pagination = useMemo(() => paginationOf(pairs, selected), [pairs, selected])
  // `prev` only when the picture right before the last selection was picked, like the original
  const direction: Direction = samePair(selected, paginationOf(pairs, previous).prev) ? 'prev' : 'next'

  useEffect(() => {
    if (selected) scrollToAsset(selected, isCommentStream)
  }, [selected, isCommentStream])

  const toggle = useCallback(
    (assetId: string, postId: string) => dispatch({ type: 'toggle', pair: { assetId, postId } }),
    [],
  )
  const close = useCallback(() => dispatch({ type: 'close' }), [])
  const advance = (to: Direction): void => {
    const pair = pagination[to]
    if (pair) dispatch({ type: 'select', pair })
  }

  return { selected, direction, pagination, toggle, advance, close }
}
