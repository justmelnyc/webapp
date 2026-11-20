import { act, fireEvent, render } from '@testing-library/react'
import { useEmbedPlayerStore } from '@/stores/embed-player-store'
import { EmbedRegion } from './embed-region'

let pathname = '/discover'
jest.mock('next/navigation', () => ({ usePathname: () => pathname }))

const youtube = { service: 'youtube', id: 'dQw4w9WgXcQ', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailLargeUrl: 'https://cdn.test/yt.jpg' }
const vimeo = { service: 'vimeo', id: '76979871', url: 'https://vimeo.com/76979871', thumbnailLargeUrl: 'https://cdn.test/vimeo.jpg' }

const setUserAgent = (value: string): void => {
  Object.defineProperty(window.navigator, 'userAgent', { value, configurable: true })
}

describe('EmbedRegion', () => {
  beforeEach(() => {
    pathname = '/discover'
    useEmbedPlayerStore.setState({ playingKey: null })
    setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/130.0 Safari/537.36')
  })

  it('shows the thumbnail with a play button and no player', () => {
    const { container } = render(<EmbedRegion {...youtube} detailPath="/theo/post/tok" />)
    const player = container.querySelector('.EmbedRegion.youtube > .embetter') as HTMLElement
    expect(player).toHaveAttribute('data-youtube-id', 'dQw4w9WgXcQ')
    expect(player).toHaveClass('embetter-ready')
    expect(player).not.toHaveClass('embetter-playing')
    expect(container.querySelector('a.EmbedRegionContent')).toHaveAttribute('href', '/theo/post/tok')
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://cdn.test/yt.jpg')
    expect(container.querySelector('.embetter-play-button')).not.toBeNull()
    expect(container.querySelector('iframe')).toBeNull()
  })

  it('links the thumbnail to the post page it is on', () => {
    pathname = '/theo/post/tok'
    const { container } = render(<EmbedRegion {...youtube} />)
    expect(container.querySelector('a.EmbedRegionContent')).toHaveAttribute('href', '/theo/post/tok')
  })

  it('links to the embedded url where there is no post to go to', () => {
    const { container } = render(<EmbedRegion {...youtube} />)
    expect(container.querySelector('a.EmbedRegionContent')).toHaveAttribute('href', youtube.url)
  })

  it('draws the player without the browser frame', () => {
    const { container } = render(<EmbedRegion {...youtube} />)
    fireEvent.click(container.querySelector('.embetter-play-button') as HTMLElement)
    expect(container.querySelector('iframe')).toHaveAttribute('frameborder', '0')
    expect(container.querySelector('iframe')).toHaveAttribute('scrolling', 'no')
  })

  it('swaps in the autoplaying player on play', () => {
    const { container } = render(<EmbedRegion {...youtube} />)
    fireEvent.click(container.querySelector('.embetter-play-button') as HTMLElement)
    expect(container.querySelector('.embetter')).toHaveClass('embetter-playing')
    expect(container.querySelector('iframe')?.getAttribute('src')).toContain('youtube.com/embed/dQw4w9WgXcQ')
    expect(container.querySelector('iframe')?.getAttribute('src')).toContain('autoplay=1')
  })

  it('takes the previous player down when another starts', () => {
    const { container } = render(
      <>
        <EmbedRegion {...youtube} />
        <EmbedRegion {...vimeo} />
      </>,
    )
    const [first, second] = Array.from(container.querySelectorAll('.embetter-play-button'))
    fireEvent.click(first as HTMLElement)
    fireEvent.click(second as HTMLElement)
    expect(container.querySelectorAll('iframe')).toHaveLength(1)
    expect(container.querySelector('.youtube .embetter')).not.toHaveClass('embetter-playing')
    expect(container.querySelector('.vimeo iframe')).not.toBeNull()
  })

  it('forgets the player when it leaves the page', () => {
    const { container, unmount } = render(<EmbedRegion {...youtube} />)
    fireEvent.click(container.querySelector('.embetter-play-button') as HTMLElement)
    expect(useEmbedPlayerStore.getState().playingKey).not.toBeNull()
    unmount()
    expect(useEmbedPlayerStore.getState().playingKey).toBeNull()
  })

  it('falls back to the black placeholder when the thumbnail fails', () => {
    const { container } = render(<EmbedRegion {...youtube} />)
    fireEvent.error(container.querySelector('img') as HTMLImageElement)
    expect(container.querySelector('img')?.getAttribute('src')).toMatch(/^data:image\/png/)
  })

  describe('on a phone', () => {
    const place = (element: Element, top: number, bottom: number): void => {
      element.getBoundingClientRect = () => ({ top, bottom, left: 0, right: 300, width: 300, height: bottom - top, x: 0, y: top, toJSON: () => ({}) })
    }

    beforeEach(() => {
      jest.useFakeTimers()
      setUserAgent('Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/130.0 Mobile Safari/537.36')
      Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
    })
    afterEach(() => jest.useRealTimers())

    it('puts the player in place, without autoplay, while the embed is entirely on screen', () => {
      const { container } = render(<EmbedRegion {...vimeo} />)
      const player = container.querySelector('.embetter') as HTMLElement
      place(player, 100, 400)
      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(container.querySelector('iframe')?.getAttribute('src')).not.toContain('autoplay')
      place(player, -200, 100)
      act(() => {
        fireEvent.scroll(window)
        jest.advanceTimersByTime(500)
      })
      expect(container.querySelector('iframe')).toBeNull()
    })

    it('leaves codepen alone', () => {
      const { container } = render(<EmbedRegion service="codepen" id="a/pen/b" url="https://codepen.io/a/pen/b" thumbnailLargeUrl="https://cdn.test/c.jpg" />)
      place(container.querySelector('.embetter') as HTMLElement, 100, 400)
      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(container.querySelector('iframe')).toBeNull()
    })
  })
})
