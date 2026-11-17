import { useEffect, useState } from 'react'

/**
 * The original only shows a field's error one second after the last keystroke
 * (`delayedShowUserError = debounce(..., 1000)`). Returns true once `value` has been quiet that long.
 */
export const useQuietFor = (value: string, ms = 1000): boolean => {
  const [quietValue, setQuietValue] = useState<string | null>(null)
  useEffect(() => {
    const timer = setTimeout(() => setQuietValue(value), ms)
    return () => clearTimeout(timer)
  }, [value, ms])
  return quietValue === value
}
