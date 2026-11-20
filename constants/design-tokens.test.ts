import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ALL_TOKENS, BREAKPOINTS } from './design-tokens'

/** `--name: value;` declarations of tokens.css (the `--color-*: initial` namespace resets are not tokens). */
const parseTokens = (css: string): Map<string, string> => {
  const tokens = new Map<string, string>()
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const [, name, value] of withoutComments.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)) {
    if (name && value && value.trim() !== 'initial') tokens.set(name, value.trim())
  }
  return tokens
}

const inCss = parseTokens(readFileSync(join(process.cwd(), 'app/styles/tokens.css'), 'utf8'))
const inGuide = new Map(ALL_TOKENS.map((token) => [token.name as string, token.value]))

describe('design tokens', () => {
  it('finds the tokens in tokens.css', () => {
    expect(inCss.size).toBeGreaterThan(60)
    expect(inCss.get('--color-black')).toBe('#000')
  })

  it('lists every token of tokens.css in the style guide data', () => {
    const missing = [...inCss.keys()].filter((name) => !inGuide.has(name))
    expect(missing).toEqual([])
  })

  it('lists no token that tokens.css does not define', () => {
    const unknown = [...inGuide.keys()].filter((name) => !inCss.has(name))
    expect(unknown).toEqual([])
  })

  it('has the same value for every token', () => {
    const different = [...inGuide].filter(([name, value]) => inCss.get(name) !== value).map(([name]) => name)
    expect(different).toEqual([])
  })

  it('lists each token once', () => {
    expect(inGuide.size).toBe(ALL_TOKENS.length)
  })

  it('keeps the breakpoints 16px to the em, with max queries one pixel below', () => {
    for (const { token, px, max } of BREAKPOINTS) {
      expect(parseFloat(token.value) * 16).toBe(px)
      if (max) expect(parseFloat(max) * 16).toBe(px - 1)
    }
  })
})
