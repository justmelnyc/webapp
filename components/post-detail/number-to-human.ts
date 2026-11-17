/** Ported from legacy/src/lib/number_to_human.js. */
const UNITS: Array<{ size: number; suffix: string }> = [
  { size: 1_000_000_000, suffix: 'B' },
  { size: 1_000_000, suffix: 'M' },
  { size: 1_000, suffix: 'K' },
]

export const numberToHuman = (value: number, showZero: boolean = true): string => {
  if (value === 0 && !showZero) return ''
  const unit = UNITS.find(({ size }) => value >= size)
  const rounded = Math.round((value / (unit?.size ?? 1)) * 10) / 10
  return `${rounded}${unit?.suffix ?? ''}`
}
