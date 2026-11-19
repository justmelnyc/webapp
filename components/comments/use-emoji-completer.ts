'use client'

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { Emoji } from '@/lib/schemas/emoji'
import { toast } from '@/stores/toast-store'
import { EMOJI_REGEX, suggestEmoji, wordBeforeCaret } from '@/utils/suggest-emoji'
import { textRangeRect } from '@/utils/text-range-rect'
import { loadEmojiSet } from './emoji-set'

export interface EmojiCompleterState {
  suggestions: Emoji[]
  selected: number
  top: number
  left: number
}

type Replace = (blockId: string, text: string, caret: number) => void

const NAVIGATION_KEYS = new Set(['Tab', 'Enter', 'Escape', 'ArrowUp', 'ArrowDown'])

/**
 * The original's `:` emoji completer (InputComponent.onKeyUp + InputContainer.onEmojiCompleter): after each
 * key, if the word before the caret is `:partial`, suggest emoji; Tab/arrows move, Enter picks, Esc closes.
 */
export const useEmojiCompleter = (replace: Replace) => {
  const [state, setState] = useState<EmojiCompleterState | null>(null)
  const target = useRef<{
    blockId: string
    field: HTMLTextAreaElement
    start: number
    end: number
  } | null>(null)
  const request = useRef(0)

  const hide = useCallback((): void => {
    request.current += 1
    target.current = null
    setState(null)
  }, [])

  // The original's Completer re-renders (and so re-measures the caret) on every scroll: follow the word.
  const isOpen = state !== null
  useEffect(() => {
    if (!isOpen) return
    const follow = (): void => {
      const current = target.current
      if (!current) return
      const rect = textRangeRect(current.field, current.start, current.end)
      setState((previous) =>
        previous ? { ...previous, top: rect.top + 20, left: rect.left } : previous,
      )
    }
    window.addEventListener('scroll', follow, true)
    window.addEventListener('resize', follow)
    return () => {
      window.removeEventListener('scroll', follow, true)
      window.removeEventListener('resize', follow)
    }
  }, [isOpen])

  const complete = useCallback(
    (name: string): void => {
      const current = target.current
      if (!current) return
      const { blockId, field, start, end } = current
      const value = `:${name}:`
      replace(
        blockId,
        field.value.slice(0, start) + value + field.value.slice(end),
        start + value.length,
      )
      hide()
    },
    [replace, hide],
  )

  const onKeyUp = (blockId: string, e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (NAVIGATION_KEYS.has(e.key)) return
    const field = e.currentTarget
    const end = field.selectionStart
    const { word, start } = wordBeforeCaret(field.value, end)
    if (!EMOJI_REGEX.test(word)) return hide()
    const id = (request.current += 1)
    void (async () => {
      const result = await loadEmojiSet()
      if (!result.ok) return toast.error(result.error)
      if (id !== request.current) return
      const rect = textRangeRect(field, start, end)
      target.current = { blockId, field, start, end }
      setState({
        suggestions: suggestEmoji(word, result.data.emojis),
        selected: 0,
        top: rect.top + 20,
        left: rect.left,
      })
    })()
  }

  /** Returns true when the key was taken by the completer (the caller must not handle it). */
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): boolean => {
    if (!state || state.suggestions.length === 0) return false
    const count = state.suggestions.length
    const move = (delta: number): void => {
      e.preventDefault()
      setState({ ...state, selected: (state.selected + delta + count) % count })
    }
    if ((!e.shiftKey && e.key === 'Tab') || e.key === 'ArrowDown') move(1)
    else if ((e.shiftKey && e.key === 'Tab') || e.key === 'ArrowUp') move(-1)
    else if (e.key === 'Enter') {
      e.preventDefault()
      const picked = state.suggestions[state.selected]
      if (picked) complete(picked.name)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      hide()
    } else return false
    return true
  }

  return { state, onKeyUp, onKeyDown, complete, hide }
}
