import { fireEvent, render } from '@testing-library/react'
import { responsive, version } from '@/test/fixtures/media'
import { imageRegion } from '@/test/fixtures/posts'
import { imageRegionSchema, type Asset } from '@/types/post'
import { ImageRegionView } from './image-region'

let pathname = '/discover'
jest.mock('next/navigation', () => ({ usePathname: () => pathname }))

const region = (linkUrl: string | null = null) => imageRegionSchema.parse({ ...imageRegion('a1'), linkUrl })
const still: Asset[] = [{ id: 'a1', attachment: responsive('https://cdn.test/still.jpg', 1200, 800) }]
const clip: Asset[] = [
  { id: 'a1', attachment: { ...responsive('https://cdn.test/still.jpg', 1200, 800), video: version('https://cdn.test/clip.mp4', 1200, 800) } },
]

const view = (props: Partial<Parameters<typeof ImageRegionView>[0]> = {}) =>
  render(<ImageRegionView postId="p1" region={region()} assets={still} loading="lazy" owner="post" {...props} />)

const setUserAgent = (value: string): void => {
  Object.defineProperty(window.navigator, 'userAgent', { value, configurable: true })
}
const DESKTOP = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/130.0 Safari/537.36'

describe('ImageRegionView', () => {
  beforeEach(() => {
    pathname = '/discover'
    setUserAgent(DESKTOP)
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true })
    window.matchMedia = jest.fn().mockReturnValue({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() })
  })

  it('hides the picture until it has loaded', () => {
    const { container } = view()
    expect(container.querySelector('.ImageRegion')).toHaveClass('isRequesting')
    fireEvent.load(container.querySelector('img') as HTMLImageElement)
    expect(container.querySelector('.ImageRegion')).not.toHaveClass('isRequesting')
  })

  it('marks a picture that cannot load and leaves the browser to draw it', () => {
    const { container } = view({ detailPath: '/ada/post/tok', region: imageRegionSchema.parse({ ...imageRegion('a1'), data: { url: 'x', alt: '' } }) })
    fireEvent.error(container.querySelector('img') as HTMLImageElement)
    expect(container.querySelector('.ImageRegion')).toHaveClass('isFailing')
    const img = container.querySelector('img') as HTMLImageElement
    expect(img).not.toHaveAttribute('width')
    expect(img).not.toHaveAttribute('alt')
  })

  it('plays the clip of a video attachment in a list, sized to the content width', () => {
    const { container } = view({ assets: clip })
    const video = container.querySelector('video') as HTMLVideoElement
    expect(video).toHaveAttribute('width', '1200')
    expect(video).toHaveAttribute('height', '800')
    expect(video).toHaveAttribute('loop')
    expect(video).toHaveAttribute('playsinline')
    expect(video.muted).toBe(true)
    expect(video.querySelector('source')).toHaveAttribute('src', 'https://cdn.test/clip.mp4')
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('.ImageRegion')).not.toHaveClass('isRequesting')
  })

  it('links the clip to the post in a grid, sized to the column', () => {
    const { container } = view({ assets: clip, detailPath: '/ada/post/tok' })
    const video = container.querySelector('a[href="/ada/post/tok"] video') as HTMLVideoElement
    // no media query matches here: two columns of (1280 - 3 * 20) / 2
    expect(video).toHaveAttribute('width', '611')
    expect(video).toHaveAttribute('height', '407')
  })

  it('shows the still on iOS', () => {
    setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')
    const { container } = view({ assets: clip })
    expect(container.querySelector('video')).toBeNull()
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://cdn.test/still.jpg')
  })

  it('shows the still in a comment on a post page, the clip in a comment elsewhere', () => {
    pathname = '/ada/post/tok'
    expect(view({ assets: clip, owner: 'comment' }).container.querySelector('video')).toBeNull()
    expect(view({ assets: clip }).container.querySelector('video')).not.toBeNull()
    pathname = '/following'
    const video = view({ assets: clip, owner: 'comment' }).container.querySelector('video')
    expect(video).toHaveAttribute('width', '650')
  })

  it('draws the buy button on a post picture and moves the lightbox trigger aside', () => {
    const { container } = view({ region: region('https://shop.test/a') })
    expect(container.querySelector('a.ElloBuyButton')).toHaveAttribute('href', 'https://shop.test/a')
    expect(container.querySelector('.lightbox-trigger')).toHaveClass('with-buy')
  })

  it('leaves the buy button out of comments', () => {
    const { container } = view({ region: region('https://shop.test/a'), owner: 'comment' })
    expect(container.querySelector('.ElloBuyButton')).toBeNull()
  })

  it('plays a GIF from its optimized file without a srcset', () => {
    const gif: Asset[] = [
      { id: 'a1', attachment: { ...responsive('https://cdn.test/h.gif', 400, 300), optimized: { url: 'https://cdn.test/o.gif', metadata: { width: 400, height: 300, type: 'image/gif' } } } },
    ]
    const list = view({ assets: gif }).container.querySelector('img')
    expect(list).toHaveAttribute('src', 'https://cdn.test/o.gif')
    expect(list).not.toHaveAttribute('srcset')
    const grid = view({ assets: gif, detailPath: '/ada/post/tok' }).container.querySelector('img')
    expect(grid).toHaveAttribute('src', 'https://cdn.test/o.gif')
  })
})
