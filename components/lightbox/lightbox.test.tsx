import { act, fireEvent, render as baseRender, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactElement } from 'react'
import { RegistrationDialogProvider } from '@/components/auth/registration-dialog'
import { PostBody } from '@/components/posts/post-body'
import { gqlPost, imageRegion, textRegion } from '@/test/fixtures/posts'
import { postSchema, type Post } from '@/types/post'
import { PostsLightbox } from './post-lightbox'

jest.mock('@/actions/post-actions', () => ({ setLoved: jest.fn(), setWatching: jest.fn() }))
jest.mock('@/actions/category-post-actions', () => ({ runCategoryPostAction: jest.fn() }))
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }), usePathname: () => '/discover' }))

const post = (id: string, images: number): Post =>
  postSchema.parse(
    gqlPost(id, { content: [textRegion(), ...Array.from({ length: images }, (_, i) => imageRegion(`${id}-a${i + 1}`))] }),
  )

const posts = [post('p1', 2), post('p2', 1)]

const render = (ui: ReactElement) =>
  baseRender(
    <QueryClientProvider client={new QueryClient()}>
      <RegistrationDialogProvider header={null}>{ui}</RegistrationDialogProvider>
    </QueryClientProvider>,
  )

const renderStream = () =>
  render(
    <PostsLightbox posts={posts} viewerId={null}>
      {posts.map((p) => (
        <PostBody key={p.id} postId={p.id} regions={p.content} assets={p.assets} />
      ))}
    </PostsLightbox>,
  )

const press = (key: string, init: KeyboardEventInit = {}): void => {
  act(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }))
  })
}

const pageImage = (id: string): HTMLElement => document.getElementById(`asset_${id}`) as HTMLElement
const selectedId = (): string | undefined => document.querySelector('.LightBoxQueue .ImageAttachment.selected')?.id
const open = (id = 'p1-a1_p1'): void => {
  fireEvent.click(pageImage(id))
}

beforeEach(() => {
  jest.useFakeTimers()
  window.scrollTo = jest.fn()
  window.matchMedia = jest.fn().mockReturnValue({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() })
})

afterEach(() => {
  jest.useRealTimers()
})

describe('lightbox', () => {
  it('opens on the clicked picture as a modal dialog with the whole queue', () => {
    renderStream()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    open('p1-a2_p1')
    expect(screen.getByRole('dialog', { name: 'Lightbox' })).toHaveAttribute('aria-modal', 'true')
    expect(selectedId()).toBe('lightBoxAsset_p1-a2_p1')
    expect(document.querySelectorAll('.LightBoxQueue .ImageAttachment')).toHaveLength(3)
    expect(document.querySelectorAll('.LightBoxQueue > .Post.isPostHeaderHidden')).toHaveLength(2)
    expect(document.body).toHaveClass('isLightBoxActive')
    expect(screen.getByRole('dialog')).toHaveFocus()
  })

  it('offers Previous and Next only where the queue goes on', () => {
    renderStream()
    open()
    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(selectedId()).toBe('lightBoxAsset_p1-a2_p1')
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(selectedId()).toBe('lightBoxAsset_p2-a1_p2')
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
    expect(selectedId()).toBe('lightBoxAsset_p1-a2_p1')
  })

  it.each(['ArrowRight', 'k', ']', '6'])('steps forward with %s and stops at the end', (key) => {
    renderStream()
    open()
    press(key)
    expect(selectedId()).toBe('lightBoxAsset_p1-a2_p1')
    press(key)
    press(key)
    expect(selectedId()).toBe('lightBoxAsset_p2-a1_p2')
  })

  it.each(['ArrowLeft', 'j', '[', '4'])('steps back with %s and stops at the start', (key) => {
    renderStream()
    open('p2-a1_p2')
    press(key)
    expect(selectedId()).toBe('lightBoxAsset_p1-a2_p1')
    press(key)
    press(key)
    expect(selectedId()).toBe('lightBoxAsset_p1-a1_p1')
  })

  it.each(['Escape', '5'])('closes with %s and hands the page back', (key) => {
    renderStream()
    open()
    press(key)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.body).not.toHaveClass('isLightBoxActive')
  })

  it('ignores its keys with a modifier held and once it is closed', () => {
    renderStream()
    open()
    press('k', { metaKey: true })
    expect(selectedId()).toBe('lightBoxAsset_p1-a1_p1')
    press('Escape')
    press('k')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('moves to another picture of the queue on click and closes on the selected one', () => {
    renderStream()
    open()
    fireEvent.click(document.getElementById('lightBoxAsset_p2-a1_p2') as HTMLElement)
    expect(selectedId()).toBe('lightBoxAsset_p2-a1_p2')
    fireEvent.click(document.getElementById('lightBoxAsset_p2-a1_p2') as HTMLElement)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes on the mask and the close button, but not on a post tool', () => {
    renderStream()
    open()
    fireEvent.click(document.querySelector('.LightBoxMask .LoveTool') as HTMLElement)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(document.querySelector('.LightBox') as HTMLElement)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    open()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not open with ⌘ held', () => {
    renderStream()
    fireEvent.click(pageImage('p1-a1_p1'), { metaKey: true })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('scrolls the page along to the selected picture', () => {
    renderStream()
    open()
    press('k')
    expect(window.scrollTo).toHaveBeenCalledTimes(2)
  })

  it('shows the queue after the opening delay and centres the selected picture', () => {
    renderStream()
    open()
    const box = document.querySelector('.LightBox') as HTMLElement
    const queue = document.querySelector('.LightBoxQueue') as HTMLElement
    expect(box).toHaveClass('loading')
    act(() => jest.advanceTimersByTime(200))
    expect(box).not.toHaveClass('loading')
    expect(box).not.toHaveClass('loaded')
    // jsdom has no layout: a zero-width picture is centred at half the viewport
    expect(queue.style.transform).toBe(`translateX(${window.innerWidth / 2}px)`)
    expect(queue).toHaveClass('transition')
    act(() => jest.advanceTimersByTime(200))
    expect(box).toHaveClass('loaded')
  })

  it('scales a picture to the viewport once it has loaded', () => {
    renderStream()
    open()
    const image = document.getElementById('lightBoxAsset_p1-a1_p1') as HTMLImageElement
    Object.defineProperty(image, 'clientWidth', { value: 500 })
    Object.defineProperty(image, 'clientHeight', { value: 500 })
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
    fireEvent.load(image)
    expect(image).toHaveStyle({ width: '820px', height: '820px' })
    Object.defineProperty(window, 'innerHeight', { value: 500, configurable: true })
    fireEvent(window, new Event('resize'))
    // the original debounces resizes (100ms, then a frame) before it rescales
    expect(image).toHaveStyle({ width: '820px', height: '820px' })
    act(() => jest.advanceTimersByTime(150))
    expect(image).toHaveStyle({ width: '420px', height: '420px' })
  })

  it('keeps a picture as it is through a resize that ends at the size it started from', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
    renderStream()
    open()
    const image = document.getElementById('lightBoxAsset_p1-a1_p1') as HTMLImageElement
    Object.defineProperty(image, 'clientWidth', { value: 333 })
    Object.defineProperty(image, 'clientHeight', { value: 500 })
    fireEvent.load(image)
    const { width, height } = image.style
    Object.defineProperty(window, 'innerHeight', { value: 500, configurable: true })
    fireEvent(window, new Event('resize'))
    Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
    fireEvent(window, new Event('resize'))
    act(() => jest.advanceTimersByTime(500))
    expect(image.style.width).toBe(width)
    expect(image.style.height).toBe(height)
  })

  it('plays the clip of a video attachment opened from a stream, scaled like a picture', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
    const clientSize = (name: 'width' | 'height') => ({ configurable: true, get(this: HTMLVideoElement) { return Number(this.getAttribute(name)) } })
    Object.defineProperty(HTMLVideoElement.prototype, 'clientWidth', clientSize('width'))
    Object.defineProperty(HTMLVideoElement.prototype, 'clientHeight', clientSize('height'))
    const first = posts[0] as (typeof posts)[number]
    const asset = first.assets[0] as (typeof first.assets)[number]
    const metadata = { width: 1200, height: 800, size: 1, type: 'image/jpeg' }
    const still = { url: 'https://cdn.test/still.jpg', metadata }
    const attachment = { ...asset.attachment, original: still, optimized: still, xhdpi: still, hdpi: still, video: { url: 'https://cdn.test/clip.mp4', metadata } }
    const clipPost = { ...first, assets: [{ ...asset, attachment }, ...first.assets.slice(1)] }
    render(
      <PostsLightbox posts={[clipPost]} viewerId={null}>
        <PostBody postId={clipPost.id} regions={clipPost.content} assets={clipPost.assets} />
      </PostsLightbox>,
    )
    fireEvent.click(document.getElementById('asset_p1-a1_p1') as HTMLElement)
    const clip = document.getElementById('lightBoxAsset_p1-a1_p1') as HTMLVideoElement
    expect(clip.tagName).toBe('VIDEO')
    expect(clip).toHaveClass('ImageAttachment', 'selected')
    expect(clip.querySelector('source')).toHaveAttribute('src', 'https://cdn.test/clip.mp4')
    // 1200 x 800 on screen, scaled to the 1100px the padded viewport leaves
    expect(clip).toHaveAttribute('width', '1200')
    expect(clip.style.width).toBe('1100px')
    Reflect.deleteProperty(HTMLVideoElement.prototype, 'clientWidth')
    Reflect.deleteProperty(HTMLVideoElement.prototype, 'clientHeight')
  })
})
