import { numberToHuman } from '@/components/profile/number-to-human'

describe('numberToHuman', () => {
  it('formats like the original', () => {
    expect(numberToHuman(7)).toBe('7')
    expect(numberToHuman(2900)).toBe('2.9K')
    expect(numberToHuman(3000)).toBe('3K')
    expect(numberToHuman(1_250_000)).toBe('1.3M')
  })

  it('can hide zero', () => {
    expect(numberToHuman(0, false)).toBe('')
    expect(numberToHuman(0)).toBe('0')
  })
})
