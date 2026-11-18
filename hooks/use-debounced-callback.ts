import { useCallback, useEffect, useRef } from 'react'

/**
 * A function that runs `callback` once `delay` ms have passed without another call (the original's lodash
 * `debounce`). The latest `callback` runs, and a pending call is dropped on unmount.
 */
export const useDebouncedCallback = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
): ((...args: Args) => void) => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef(callback)

  useEffect(() => {
    latest.current = callback
  })

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  return useCallback(
    (...args: Args) => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => latest.current(...args), delay)
    },
    [delay],
  )
}
