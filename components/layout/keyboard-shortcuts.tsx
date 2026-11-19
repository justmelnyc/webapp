'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { SHORTCUT_KEYS } from '@/constants/shortcut-keys'
import { HelpDialog } from './help-dialog'
import { useLayoutModeStore } from './layout-mode-store'
import { useKeyboardShortcuts, type ShortcutBindings } from './use-keyboard-shortcuts'

/** Port of KeyboardContainer's `shortcuts` (the `d` key is resolved separately). */
const NAVIGATION: Readonly<Record<string, string>> = {
  [SHORTCUT_KEYS.ARTIST_INVITES]: '/invites',
  [SHORTCUT_KEYS.EDITORIAL]: '/',
  [SHORTCUT_KEYS.FOLLOWING]: '/following',
  [SHORTCUT_KEYS.SEARCH]: '/search',
  [SHORTCUT_KEYS.NOTIFICATIONS]: '/notifications',
}

/** DiscoverContainer binds every `discover(/:stream)(/:kind)` path, but not `discover/all`. */
const isDiscoverStreamPath = (pathname: string): boolean =>
  /^\/discover(\/|$)/.test(pathname) && !/^\/discover\/all\b/.test(pathname)

/** The original closes whatever modal is open (`closeModal`); modals here own their state, so ask via Escape. */
const closeActiveModal = (): void => {
  const modals = document.querySelectorAll('.Modal')
  modals[modals.length - 1]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
}

/**
 * The original's KeyboardContainer: navigation keys and `?` only while logged in, `=` always.
 * Esc is handled by `Modal` itself.
 */
export const KeyboardShortcuts = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const router = useRouter()
  const pathname = usePathname()
  const toggleLayout = useLayoutModeStore((state) => state.toggle)
  const [isHelpOpen, setHelpOpen] = useState(false)
  // `selectDiscoverKeyType`: the viewer's last discover stream, forgotten on logout
  const discoverPath = useRef<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn) discoverPath.current = null
    else if (isDiscoverStreamPath(pathname)) discoverPath.current = pathname
  }, [isLoggedIn, pathname])

  const bindings: ShortcutBindings = { [SHORTCUT_KEYS.TOGGLE_LAYOUT]: toggleLayout }
  const loggedInBindings: Record<string, () => void> = {}
  for (const [key, path] of Object.entries(NAVIGATION)) loggedInBindings[key] = () => router.push(path)
  loggedInBindings[SHORTCUT_KEYS.DISCOVER] = () => router.push(discoverPath.current ?? '/discover')
  loggedInBindings[SHORTCUT_KEYS.HELP] = () => {
    if (document.body.classList.contains('isModalActive')) closeActiveModal()
    else setHelpOpen(true)
  }
  useKeyboardShortcuts(isLoggedIn ? { ...loggedInBindings, ...bindings } : bindings)

  if (!isLoggedIn || !isHelpOpen) return null
  return <HelpDialog onDismiss={() => setHelpOpen(false)} />
}
