import type { Emoji } from '@/lib/schemas/emoji'
import { EMOJI_REGEX, suggestEmoji, wordBeforeCaret } from './suggest-emoji'

const emoji = (name: string): Emoji => ({ name, imageUrl: `http://x/${name}.png` })
const set = ['smile', 'tada', 'heart', 'fire', 'eyes', 'sparkles', 'smirk'].map(emoji)
const noShuffle = (): number => 0

describe('wordBeforeCaret', () => {
  it('takes the characters back to the last whitespace', () => {
    expect(wordBeforeCaret('hello wor', 9)).toEqual({ word: 'wor', start: 6 })
  })

  it('stops at (and includes) a colon', () => {
    expect(wordBeforeCaret('hi:smi', 6)).toEqual({ word: ':smi', start: 2 })
  })

  it('only looks before the caret', () => {
    expect(wordBeforeCaret('hi :sm and more', 6)).toEqual({ word: ':sm', start: 3 })
  })
})

describe('EMOJI_REGEX', () => {
  it('matches a colon plus a partial name at the end of the word', () => {
    expect(EMOJI_REGEX.test(':smi')).toBe(true)
    expect(EMOJI_REGEX.test(':+')).toBe(true)
    expect(EMOJI_REGEX.test(':smile:')).toBe(false)
    expect(EMOJI_REGEX.test('smi')).toBe(false)
  })
})

describe('suggestEmoji', () => {
  it('keeps matches only, closest match (earlier position, then shorter name) first', () => {
    const names = suggestEmoji(':s', set, noShuffle).map((e) => e.name)
    expect(names).toEqual(['smile', 'smirk', 'sparkles', 'eyes'])
  })

  it('matches anywhere in the name and ignores case', () => {
    expect(suggestEmoji(':RE', set, noShuffle).map((e) => e.name)).toEqual(['fire'])
  })

  it('keeps the first two on top and shuffles the next fourteen before sorting', () => {
    const many = Array.from({ length: 20 }, (_, i) => emoji(`e${String(i).padStart(2, '0')}`))
    // an empty partial matches everything and the sort ties on length, so the shuffled order shows
    const names = suggestEmoji(':e', many, () => 0.999).map((e) => e.name)
    expect(names.slice(0, 2)).toEqual(['e00', 'e01'])
    expect(names).toHaveLength(20)
    expect(names.slice(16)).toEqual(['e16', 'e17', 'e18', 'e19'])
  })
})
