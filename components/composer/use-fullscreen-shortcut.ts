'use client'

import { useEffect, useState } from 'react'

const SEQUENCE = ['g', 'm']
const SEQUENCE_TIMEOUT_MS = 1000

/** Mousetrap does not fire shortcuts while typing in a field or an editable. */
const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

/** The original's `g m` shortcut (SHORTCUT_KEYS.FULLSCREEN) toggling the omnibar's full screen mode. */
export const useFullscreenShortcut = (enabled: boolean): boolean => {
  const [isFullScreen, setFullScreen] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let progress = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    const reset = (): void => {
      progress = 0
      clearTimeout(timer)
    }
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return
      if (e.key.toLowerCase() !== SEQUENCE[progress]) {
        reset()
        return
      }
      progress += 1
      clearTimeout(timer)
      timer = setTimeout(reset, SEQUENCE_TIMEOUT_MS)
      if (progress === SEQUENCE.length) {
        reset()
        setFullScreen((value) => !value)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      reset()
    }
  }, [enabled])

  return enabled && isFullScreen
}
