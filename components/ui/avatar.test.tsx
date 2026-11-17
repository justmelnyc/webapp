import { render, screen } from '@testing-library/react'
import { Avatar } from './avatar'

describe('Avatar', () => {
  it('renders an image with the name as alt and the requested size', () => {
    render(<Avatar src="https://cdn.test/a.png" name="ada" size={64} />)
    const img = screen.getByRole('img', { name: 'ada' })
    expect(img).toHaveAttribute('src', 'https://cdn.test/a.png')
    expect(img).toHaveAttribute('width', '64')
    expect(img).toHaveAttribute('height', '64')
  })

  it.each([null, undefined, ''])('renders a blank circle, like the original, when src is %p', (src) => {
    const { container } = render(<Avatar src={src} name="grace" size={40} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(container.firstElementChild).toHaveStyle({ width: '40px', height: '40px' })
  })

  it('uses the responsive size when none is given', () => {
    const { container } = render(<Avatar src={null} name="x" />)
    expect(container.firstElementChild).not.toHaveAttribute('style')
  })

  it('merges a custom className', () => {
    const { container } = render(<Avatar src={null} name="x" className="ring-2" />)
    expect(container.firstElementChild).toHaveClass('Avatar', 'ring-2')
  })

  it('renders a link or a button when asked to', () => {
    const { rerender } = render(<Avatar src={null} name="x" href="/ada" aria-label="Profile" />)
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/ada')
    rerender(<Avatar src={null} name="x" onClick={() => undefined} aria-label="Menu" />)
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument()
  })
})
