import { render } from '@testing-library/react'
import { ArrowIcon, ElloLogoType, EyeIcon, FacebookIcon, SearchIcon } from '@/components/icons'

describe('icons', () => {
  it('renders SVGIcons as 20x20 with their class names', () => {
    const { container } = render(<EyeIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('EyeIcon', 'SVGIcon')
    expect(svg).toHaveAttribute('width', '20')
    expect(svg).toHaveAttribute('height', '20')
  })

  it('renders SVGBox icons with their explicit sizes', () => {
    const { container } = render(
      <>
        <ElloLogoType />
        <FacebookIcon />
      </>,
    )
    const [logo, social] = Array.from(container.querySelectorAll('svg'))
    expect(logo).toHaveAttribute('width', '60')
    expect(logo).toHaveAttribute('height', '20')
    expect(social).toHaveAttribute('width', '60')
  })

  it('only renders the animation rect when ArrowIcon isAnimated', () => {
    const plain = render(<ArrowIcon />)
    expect(plain.container.querySelector('rect')).toBeNull()
    const animated = render(<ArrowIcon isAnimated />)
    expect(animated.container.querySelector('rect')).not.toBeNull()
    expect(render(<SearchIcon />).container.querySelectorAll('circle')).toHaveLength(1)
  })
})
