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

  it.each([null, undefined, ''])('falls back to the uppercase-styled initial when src is %p', (src) => {
    const { container } = render(<Avatar src={src} name="grace" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('g')).toBeInTheDocument()
    expect(container.firstElementChild).toHaveStyle({ width: '40px', height: '40px' })
  })

  it('merges a custom className', () => {
    const { container } = render(<Avatar src={null} name="x" className="ring-2" />)
    expect(container.firstElementChild).toHaveClass('ring-2', 'rounded-full')
  })
})
