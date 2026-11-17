'use client'

import { useSyncExternalStore } from 'react'

interface BeaconProps {
  /** localStorage key the original used to remember dismissal (e.g. lastFollowingBeaconVersion). */
  storageKey: string
  /** Bump to show the beacon again to people who dismissed an older one. */
  version: string
  /** The broadcast message. */
  text: string
  /** Wrapper classes: where the original places it (below the navbar, or under a hero). */
  className?: string
}

const listeners = new Set<() => void>()
const dismissedThisSession = new Set<string>()

const subscribe = (notify: () => void): (() => void) => {
  listeners.add(notify)
  return () => listeners.delete(notify)
}

const readDismissed = (key: string, version: string): boolean => {
  try {
    return window.localStorage.getItem(key) === version
  } catch {
    return false
  }
}

/**
 * The original's dismissible `ZeroStream` broadcast (zeros/Zeros.js via heros/HeroRenderables.js
 * `HeroBroadcast`). Dismissal is remembered in localStorage under the original's key.
 */
export const Beacon = ({ storageKey, version, text, className }: BeaconProps) => {
  // Shown while hydrating (the server cannot know), then hidden if it was dismissed before.
  const dismissed = useSyncExternalStore(
    subscribe,
    () => dismissedThisSession.has(storageKey) || readDismissed(storageKey, version),
    () => false,
  )

  const dismiss = (): void => {
    dismissedThisSession.add(storageKey)
    try {
      window.localStorage.setItem(storageKey, version)
    } catch {
      // Not persisted (private mode): it just comes back next visit.
    }
    listeners.forEach((notify) => notify())
  }

  return (
    <div className={className}>
      {!dismissed && (
        <div className="relative mx-auto my-0 max-w-[540px] bg-white px-10 py-[53px]">
          <h2 className="text-18 bp2:text-24">{text}</h2>
          <button type="button" onClick={dismiss} className="text-14 text-gaa hover:text-black mt-20 transition-colors">
            <span>Close</span>
          </button>
        </div>
      )}
    </div>
  )
}
