const UNITS: [string, number][] = [
  ['y', 31_536_000],
  ['mo', 2_592_000],
  ['w', 604_800],
  ['d', 86_400],
  ['h', 3_600],
  ['m', 60],
]

/** Compact relative time like `30s`, `5m`, `16d`. */
export const timeAgo = (iso: string, now: number = Date.now()): string => {
  const seconds = Math.max(0, Math.floor((now - Date.parse(iso)) / 1000))
  for (const [label, size] of UNITS) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${label}`
  }
  return `${seconds}s`
}
