import { timeAgoInWords } from './time-ago-in-words'

const NOW = Date.parse('2026-01-31T12:00:00Z')
const ago = (seconds: number): string => timeAgoInWords(new Date(NOW - seconds * 1000).toISOString(), NOW)

describe('timeAgoInWords', () => {
  it('words the first minute', () => {
    expect(ago(3)).toBe('<5s')
    expect(ago(30)).toBe('30s')
    expect(ago(50)).toBe('<1m')
  })

  it('counts minutes, hours and days', () => {
    expect(ago(5 * 60)).toBe('5m')
    expect(ago(3 * 3600)).toBe('3h')
    expect(ago(30 * 3600)).toBe('1d')
    expect(ago(16.6 * 86_400)).toBe('17d')
  })

  it('never prefixes an age with "~" (the original turns its "about" prefix off)', () => {
    expect(ago(50 * 60)).toBe('1h')
    expect(ago(20 * 3600)).toBe('20h')
  })

  it('switches to months and years', () => {
    expect(ago(40 * 86_400)).toBe('1mth')
    expect(ago(200 * 86_400)).toBe('7mth')
    expect(ago(400 * 86_400)).toBe('1y')
  })
})
