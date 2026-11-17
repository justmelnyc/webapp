import { timeAgo } from './time'

const NOW = Date.parse('2026-06-15T12:00:00.000Z')
const ago = (seconds: number): string => new Date(NOW - seconds * 1000).toISOString()

describe('timeAgo', () => {
  it.each([
    [0, '0s'],
    [30, '30s'],
    [59, '59s'],
    [60, '1m'],
    [300, '5m'],
    [3599, '59m'],
    [3600, '1h'],
    [86_399, '23h'],
    [86_400, '1d'],
    [6 * 86_400, '6d'],
    // weeks win over days from 7 days up (the doc comment on timeAgo says `16d`)
    [16 * 86_400, '16d'],
    [604_800, '7d'],
    [2_592_000, '1mo'],
    [31_536_000, '1y'],
    [3 * 31_536_000, '3y'],
  ])('formats %i seconds as %s', (seconds, expected) => {
    expect(timeAgo(ago(seconds), NOW)).toBe(expected)
  })

  it('clamps future timestamps to 0s', () => {
    expect(timeAgo(ago(-500), NOW)).toBe('0s')
  })

  it('floors partial units', () => {
    expect(timeAgo(ago(119), NOW)).toBe('1m')
  })

  it('defaults now to Date.now()', () => {
    jest.useFakeTimers().setSystemTime(NOW)
    expect(timeAgo(ago(120))).toBe('2m')
    jest.useRealTimers()
  })
})
