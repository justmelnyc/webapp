import { render } from '@testing-library/react'
import { responsive } from '@/test/fixtures/media'
import { imageRegion, textRegion } from '@/test/fixtures/posts'
import { regionSchema, type Asset, type Region } from '@/types/post'
import { PostBody } from './post-body'

const regions = (...input: unknown[]): Region[] => input.map((r) => regionSchema.parse(r))

describe('PostBody', () => {
  it('renders text regions as HTML', () => {
    const { container } = render(<PostBody regions={regions(textRegion('<p>Hello <strong>you</strong></p>'))} />)
    expect(container.querySelector('.rich-text strong')).toHaveTextContent('you')
  })

  it('uses the linked asset url and dimensions for image regions', () => {
    const assets: Asset[] = [{ id: 'a1', attachment: responsive('https://cdn.test/asset.jpg', 640, 480) }]
    const { container } = render(
      <PostBody regions={regions(imageRegion('a1', 'https://other.test/raw.jpg'))} assets={assets} />,
    )
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://cdn.test/asset.jpg')
    expect(img).toHaveAttribute('width', '640')
    expect(img).toHaveAttribute('height', '480')
    expect(img).toHaveAttribute('alt', 'A photo')
  })

  it('falls back to data.url and default dimensions when no asset matches', () => {
    const { container } = render(<PostBody regions={regions(imageRegion('missing', 'https://other.test/raw.jpg'))} />)
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://other.test/raw.jpg')
    expect(img).toHaveAttribute('width', '1200')
    expect(img).toHaveAttribute('height', '800')
  })

  it('applies the loading prop (lazy by default)', () => {
    const input = regions(imageRegion('x', 'https://o.test/a.jpg'))
    const lazy = render(<PostBody regions={input} />)
    expect(lazy.container.querySelector('img')).toHaveAttribute('loading', 'lazy')
    const eager = render(<PostBody regions={input} loading="eager" />)
    expect(eager.container.querySelector('img')).not.toHaveAttribute('loading', 'lazy')
  })

  it('skips image regions with no usable source', () => {
    const { container } = render(
      <PostBody regions={regions({ kind: 'image', data: { url: null }, links: null })} />,
    )
    expect(container.querySelector('img')).toBeNull()
  })

  it('skips embed regions', () => {
    const { container } = render(<PostBody regions={regions({ kind: 'embed', data: { service: 'youtube' } })} />)
    expect(container.firstElementChild?.children).toHaveLength(0)
  })

  it('renders nothing inside for an empty region list', () => {
    const { container } = render(<PostBody regions={[]} />)
    expect(container.firstElementChild).toBeEmptyDOMElement()
  })

  it('keeps region order', () => {
    const { container } = render(
      <PostBody regions={regions(textRegion('<p>first</p>'), imageRegion('x', 'https://o.test/a.jpg'), textRegion('<p>last</p>'))} />,
    )
    const tags = Array.from(container.firstElementChild?.children ?? [], (el) => el.tagName)
    expect(tags).toEqual(['DIV', 'IMG', 'DIV'])
  })
})
