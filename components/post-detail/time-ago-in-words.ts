/** Ported from legacy/src/lib/time_ago_in_words.js (`Date#timeAgoInWords`). */
const MINUTES_IN_YEAR = 525_600
const MINUTES_IN_QUARTER_YEAR = 131_400
const MINUTES_IN_THREE_QUARTERS_YEAR = 394_200

const secondsInWords = (seconds: number): string => {
  if (seconds < 5) return '<5s'
  if (seconds <= 9) return '<10s'
  if (seconds <= 19) return '<20s'
  if (seconds <= 39) return '30s'
  if (seconds <= 59) return '<1m'
  return '1m'
}

const yearsInWords = (minutes: number): string => {
  const remainder = minutes % MINUTES_IN_YEAR
  const years = Math.floor(minutes / MINUTES_IN_YEAR)
  if (remainder < MINUTES_IN_QUARTER_YEAR) return `~${years}y`
  if (remainder < MINUTES_IN_THREE_QUARTERS_YEAR) return `+${years}y`
  return `<${years + 1}y`
}

export const timeAgoInWords = (iso: string, now: number = Date.now()): string => {
  const seconds = Math.round(Math.abs((now - new Date(iso).getTime()) / 1000))
  const minutes = Math.round(seconds / 60)
  if (minutes <= 1) return secondsInWords(seconds)
  if (minutes <= 45) return `${minutes}m`
  if (minutes <= 90) return '~1h'
  if (minutes <= 1440) return `~${Math.round(minutes / 60)}h`
  if (minutes <= 2520) return '1d'
  if (minutes <= 43_200) return `${Math.round(minutes / 1440)}d`
  if (minutes <= 86_400) return `~${Math.round(minutes / 43_200)}mth`
  if (minutes <= MINUTES_IN_YEAR) return `${Math.round(minutes / 43_200)}mth`
  return yearsInWords(minutes)
}
