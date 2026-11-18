import { embedPlayerSrc, matchEmbed } from './embed-services'

describe('matchEmbed', () => {
  it('recognises YouTube links in their usual shapes', () => {
    expect(matchEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
      service: 'youtube',
      id: 'dQw4w9WgXcQ',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    })
    expect(matchEmbed('https://youtu.be/dQw4w9WgXcQ')?.id).toBe('dQw4w9WgXcQ')
  })
  it('recognises Vimeo, SoundCloud and Dailymotion', () => {
    expect(matchEmbed('https://vimeo.com/76979871')).toMatchObject({ service: 'vimeo', id: '76979871' })
    expect(matchEmbed('https://soundcloud.com/artist/track-name')).toMatchObject({
      service: 'soundcloud',
      id: 'artist/track-name',
    })
    expect(matchEmbed('https://www.dailymotion.com/video/x7tgad0')).toMatchObject({ service: 'dailymotion', id: 'x7tgad0' })
  })
  it('ignores ordinary text and links', () => {
    expect(matchEmbed('just some words')).toBeNull()
    expect(matchEmbed('https://ello.co/discover')).toBeNull()
  })
})

describe('embedPlayerSrc', () => {
  it('builds an autoplaying player url and rejects unknown services', () => {
    expect(embedPlayerSrc('youtube', 'dQw4w9WgXcQ', true)).toContain('/embed/dQw4w9WgXcQ?')
    expect(embedPlayerSrc('youtube', 'dQw4w9WgXcQ', true)).toContain('autoplay=1')
    expect(embedPlayerSrc('youtube', 'dQw4w9WgXcQ', false)).not.toContain('autoplay')
    expect(embedPlayerSrc('nope', 'x', true)).toBeNull()
  })
})
