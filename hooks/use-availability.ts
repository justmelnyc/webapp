'use client'

import { useCallback, useRef, useState } from 'react'
import { checkAvailability } from '@/actions/account-actions'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import type { Availability } from '@/lib/schemas/profile'
import { CHECKING, INDETERMINATE, type CheckState } from '@/utils/availability'

/** The original debounces its availability requests by 666ms. */
export const AVAILABILITY_DELAY = 666

interface UseAvailabilityOptions {
  field: 'username' | 'email'
  /** The saved value: it is always fine, so it is never checked. */
  current: string
  /** Client-side failure message (no round trip needed), or null when the value looks usable. */
  clientError: (value: string) => string | null
  fromServer: (availability: Availability) => CheckState
}

/**
 * The original's SettingsContainer flow for one field: on change, bail out for the saved value, fail fast on
 * client errors, otherwise show "checking..." and ask the server 666ms after the last keystroke. A late
 * answer for an older value is dropped.
 */
export const useAvailability = ({ field, current, clientError, fromServer }: UseAvailabilityOptions) => {
  const [state, setState] = useState<CheckState>(INDETERMINATE)
  const latest = useRef(current)

  const ask = useDebouncedCallback(async (value: string): Promise<void> => {
    const result = await checkAvailability({ [field]: value })
    if (latest.current !== value) return
    setState(result.ok ? fromServer(result.data) : { ...INDETERMINATE })
  }, AVAILABILITY_DELAY)

  const check = useCallback(
    (raw: string): void => {
      const value = raw.trim()
      latest.current = value
      if (value === current || value === '') return setState(INDETERMINATE)
      const error = clientError(value)
      if (error) return setState({ status: 'failure', message: error, suggestions: [] })
      setState(CHECKING)
      ask(value)
    },
    [ask, clientError, current],
  )

  const reset = useCallback((): void => setState(INDETERMINATE), [])

  return { state, check, reset }
}
