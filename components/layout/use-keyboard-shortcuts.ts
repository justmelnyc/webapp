'use client'

import { useEffect, useRef } from 'react'
import { isTyping } from '@/utils/is-typing'

export type ShortcutBindings = Readonly<Record<string, () => void>>

/**
 * A small stand-in for Mousetrap (single keys only, matched on `event.key`): runs the binding for the
 * pressed key unless a modifier is held or the user is typing in a field.
 */
export const useKeyboardShortcuts = (bindings: ShortcutBindings): void => {
  const latest = useRef(bindings)
  useEffect(() => {
    latest.current = bindings
  })

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return
      const run = Object.hasOwn(latest.current, e.key) ? latest.current[e.key] : undefined
      run?.()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])
}
