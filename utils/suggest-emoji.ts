import type { Emoji } from '@/lib/schemas/emoji'

/** The original's `emojiRegex` (completers/Completer.js): a `:` followed by the partial name at the end of the word. */
export const EMOJI_REGEX = /\s?:{1}(\w+|\+|-):{0}$/

const shuffle = <T>(list: T[], random: () => number): T[] => {
  const array = [...list]
  let m = array.length
  while (m) {
    m -= 1
    const i = Math.floor(random() * m)
    const t = array[m] as T
    array[m] = array[i] as T
    array[i] = t
  }
  return array
}

/**
 * The original's `suggestEmoji` (completers/EmojiSuggester.js): the first two emoji stay on top, the
 * next fourteen are shuffled, then matches sort by where the partial name sits and by name length.
 */
export const suggestEmoji = (
  word: string,
  emojis: Emoji[],
  random: () => number = Math.random,
): Emoji[] => {
  const topEmoji = emojis.slice(0, 2)
  const popEmoji = shuffle(emojis.slice(2, 16), random)
  const all = [...topEmoji, ...popEmoji, ...emojis.slice(16)]
  const partial = word.substring(word.lastIndexOf(':') + 1).toLowerCase()
  return all
    .filter((emoji) => emoji.name.indexOf(partial) !== -1)
    .sort((a, b) => {
      const ai = a.name.indexOf(partial)
      const bi = b.name.indexOf(partial)
      if (ai !== bi) return ai > bi ? 1 : -1
      if (a.name.length !== b.name.length) return a.name.length > b.name.length ? 1 : -1
      return 0
    })
}

/**
 * The original's `getWordFromSelection` for a plain text field: the characters before the caret back
 * to the previous whitespace, or to (and including) the previous `:`.
 */
export const wordBeforeCaret = (text: string, caret: number): { word: string; start: number } => {
  const end = Math.max(caret - 1, 0)
  const letters: string[] = []
  for (let index = end; index > -1; index -= 1) {
    const letter = text[index]
    if (!letter || /\s/.test(letter)) break
    letters.unshift(letter)
    if (letter === ':') break
  }
  return { word: letters.join(''), start: end - letters.length + 1 }
}
