import { render, screen } from '@testing-library/react'
import { ElloBuyButton, hasBuyLink } from './ello-buy-button'

describe('ElloBuyButton', () => {
  it('links to the buy URL in a new tab with the money icon', () => {
    const { container } = render(<ElloBuyButton to="https://shop.example.com/a" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://shop.example.com/a')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveClass('ElloBuyButton')
    expect(container.querySelector('.MoneyIcon')).not.toBeNull()
  })

  it('treats empty links as absent', () => {
    expect(hasBuyLink('')).toBe(false)
    expect(hasBuyLink(null)).toBe(false)
    expect(hasBuyLink('https://a.b')).toBe(true)
  })
})
