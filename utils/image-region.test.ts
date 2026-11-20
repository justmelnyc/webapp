import { responsive, version } from '@/test/fixtures/media'
import { altOf, attachmentMetadata, imageDimensions, isGif, isIOS, streamWidths } from './image-region'

describe('attachmentMetadata', () => {
  it('reads the optimized size first', () => {
    expect(attachmentMetadata(responsive('https://x/a.jpg', 1200, 800))).toEqual({ width: 1200, height: 800, ratio: 1.5 })
  })

  it('falls back to xhdpi, then hdpi', () => {
    const attachment = { ...responsive('https://x/a.jpg', 900, 1200), optimized: { url: 'https://x/a.jpg', metadata: null } }
    expect(attachmentMetadata(attachment)?.width).toBe(900)
  })

  it('is null without a size', () => {
    expect(attachmentMetadata({ hdpi: { url: 'https://x/a.jpg', metadata: null } })).toBeNull()
  })
})

describe('imageDimensions', () => {
  const metadata = { width: 1200, height: 800, ratio: 1.5 }

  it('fits the column in a grid', () => {
    expect(imageDimensions(metadata, { allowableWidth: 380, isGridMode: true })).toEqual({ width: 380, height: 253 })
  })

  it('never goes past 1:1', () => {
    expect(imageDimensions(metadata, { allowableWidth: 1880, isGridMode: false })).toEqual({ width: 1200, height: 800 })
  })

  it('caps a grid cell at 1200 high', () => {
    const tall = { width: 1000, height: 5000, ratio: 0.2 }
    expect(imageDimensions(tall, { allowableWidth: 400, isGridMode: true })).toEqual({ width: 240, height: 1200 })
  })

  it('leaves room for the avatar next to a grid comment', () => {
    expect(imageDimensions(metadata, { allowableWidth: 380, widthOffset: 60, isGridMode: true })).toEqual({ width: 320, height: 213 })
  })
})

describe('streamWidths', () => {
  it('uses 10px gutters on a phone', () => {
    expect(streamWidths(375, 2)).toEqual({ columnWidth: 173, contentWidth: 355, commentOffset: 40 })
  })

  it('uses 20px gutters up to three columns', () => {
    expect(streamWidths(1280, 3)).toEqual({ columnWidth: 400, contentWidth: 1240, commentOffset: 60 })
  })

  it('uses 40px gutters from four columns', () => {
    expect(streamWidths(1440, 4)).toEqual({ columnWidth: 310, contentWidth: 1360, commentOffset: 60 })
  })
})

describe('isGif, altOf, isIOS', () => {
  const gif = { ...responsive('https://x/a.gif', 10, 10), optimized: { ...version('https://x/a.gif', 10, 10), metadata: { type: 'image/gif' } } }

  it('knows a GIF by its optimized type', () => {
    expect(isGif(gif)).toBe(true)
    expect(isGif(responsive('https://x/a.jpg', 10, 10))).toBe(false)
  })

  it('drops the extension from alt', () => {
    expect(altOf('sunset.jpg')).toBe('sunset')
    expect(altOf('loop.gif', gif)).toBe('loop')
    expect(altOf(null)).toBe('')
  })

  it('spots iOS', () => {
    expect(isIOS('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe(true)
    expect(isIOS('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/130')).toBe(false)
  })
})
