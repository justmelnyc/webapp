import { numberToHuman } from './number-to-human'

describe('numberToHuman', () => {
  it('leaves small numbers alone and hides zero on request', () => {
    expect(numberToHuman(705)).toBe('705')
    expect(numberToHuman(0)).toBe('0')
    expect(numberToHuman(0, false)).toBe('')
  })

  it('abbreviates thousands, millions and billions to one decimal', () => {
    expect(numberToHuman(1000)).toBe('1K')
    expect(numberToHuman(1250)).toBe('1.3K')
    expect(numberToHuman(2_500_000)).toBe('2.5M')
    expect(numberToHuman(3_000_000_000)).toBe('3B')
  })
})
