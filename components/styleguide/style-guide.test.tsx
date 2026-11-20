import { render, screen } from '@testing-library/react'
import * as icons from '@/components/icons'
import { ALL_TOKENS, BREAKPOINTS, COLOR_TOKENS } from '@/constants/design-tokens'
import { ICON_PARTS, ICONS } from './icon-section'
import { StyleGuide } from './style-guide'

describe('StyleGuide', () => {
  it('draws a section for each link of its contents line', () => {
    const { container } = render(<StyleGuide assetOrigin="http://api.test" avatarUrl="/icon.svg" />)
    const links = Array.from(container.querySelectorAll('nav a'))
    expect(links.length).toBe(8)
    for (const link of links) {
      const id = link.getAttribute('href')?.slice(1) ?? ''
      expect(container.querySelector(`section#${id}`)).not.toBeNull()
    }
  })

  it('shows every token of the data file by name', () => {
    const { container } = render(<StyleGuide assetOrigin="http://api.test" avatarUrl="/icon.svg" />)
    const shown = new Set(Array.from(container.querySelectorAll('code')).map((code) => code.textContent))
    const breakpoints = new Set<string>(BREAKPOINTS.map(({ token }) => token.name))
    const missing = ALL_TOKENS.filter(({ name }) => !breakpoints.has(name) && !shown.has(name)).map(({ name }) => name)
    expect(missing).toEqual([])
    for (const { token } of BREAKPOINTS) expect(shown.has(`@media (min-width: ${token.value})`)).toBe(true)
  })

  it('paints each colour swatch with its own token', () => {
    const { container } = render(<StyleGuide assetOrigin="http://api.test" avatarUrl="/icon.svg" />)
    const painted = Array.from(container.querySelectorAll<HTMLElement>('#colours li > div > div')).map((chip) => chip.style.backgroundColor)
    expect(painted).toEqual(COLOR_TOKENS.map(({ name }) => `var(${name})`))
  })

  it('lists every icon export except the building blocks', () => {
    const names = Object.keys(icons).filter((name) => !ICON_PARTS.has(name))
    expect(ICONS.map(([name]) => name).sort()).toEqual(names.sort())
    render(<StyleGuide assetOrigin="http://api.test" avatarUrl="/icon.svg" />)
    for (const name of names) expect(screen.getByTitle(name)).toBeInTheDocument()
  })
})
