/** Port of legacy/src/lib/number_to_human.js: 1200 -> `1.2K`, zero hidden unless `showZero`. */
export const numberToHuman = (value: number, showZero = true, precision = 1): string => {
  if (value === 0 && !showZero) return ''
  const factor = 10 ** precision
  const scale = (divisor: number): number => Math.round((value / divisor) * factor) / factor
  if (value >= 1e9) return `${scale(1e9)}B`
  if (value >= 1e6) return `${scale(1e6)}M`
  if (value >= 1e3) return `${scale(1e3)}K`
  return `${Math.round(value * factor) / factor}`
}
