import { cn } from './cn'

describe('cn', () => {
  it('joins class names and skips falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })

  it('supports conditional objects and arrays', () => {
    expect(cn('a', { b: true, c: false }, ['d'])).toBe('a b d')
  })

  it('returns an empty string with no input', () => {
    expect(cn()).toBe('')
  })
})
