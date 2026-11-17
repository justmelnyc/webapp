const BILLION = 1_000_000_000
const MILLION = 1_000_000
const THOUSAND = 1_000

/** Port of the original's lib/number_to_human.js (one decimal, K / M / B suffixes). */
export const numberToHuman = (value: number, showZero = true, precision = 1): string => {
  if (value === 0 && !showZero) return ''
  const factor = 10 ** precision
  const [divisor, suffix] =
    value >= BILLION ? [BILLION, 'B'] : value >= MILLION ? [MILLION, 'M'] : value >= THOUSAND ? [THOUSAND, 'K'] : [1, '']
  const rounded = Math.round((value / divisor) * factor) / factor
  const parts = `${rounded}`.split('.')
  const text = parts[parts.length - 1] === '0' ? parts[0] : `${rounded}`
  return `${text}${suffix}`
}
