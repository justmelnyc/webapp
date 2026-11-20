const fs = require('fs')
const path = require('path')
const { attachment, seedVideoPosts, VIDEO_URL } = require('./video')

const users = [{ id: '3', username: 'mara' }, { id: '4', username: 'jules' }]
const counter = () => { let n = 100; return () => String(++n) }

describe('video attachments', () => {
  it('gives a video region the clip next to its stills', () => {
    const video = attachment({ video: true }, 'https://x/still.jpg', 1200, 800)
    expect(video.video).toEqual({ url: VIDEO_URL, metadata: { width: 1200, height: 800, type: 'video/mp4', size: 960000 } })
    expect(video.hdpi.url).toBe('https://x/still.jpg')
  })

  it('leaves other pictures without one', () => {
    expect(attachment({}, 'https://x/still.jpg', 1200, 800).video).toBeNull()
  })

  it('seeds its posts once, with the same tokens every time', () => {
    const db = { users, posts: [] }
    expect(seedVideoPosts(db, counter())).toBe(2)
    expect(seedVideoPosts(db, counter())).toBe(0)
    expect(db.posts.map(p => p.token)).toEqual(['vid0x3000', 'vid1x3011'])
    expect(db.posts.every(p => p.regions.some(r => r.kind === 'image' && r.video))).toBe(true)
  })

  it('dates them from the moment it is given', () => {
    const db = { users, posts: [] }
    seedVideoPosts(db, counter(), Date.parse('2026-01-02T00:00:00Z'))
    expect(db.posts[0].createdAt).toBe('2026-01-02T00:00:00.000Z')
    expect(db.posts[1].createdAt).toBe('2026-01-01T13:00:00.000Z')
  })

  it('skips authors that are not there', () => {
    expect(seedVideoPosts({ users: [users[0]], posts: [] }, counter())).toBe(1)
  })

  it('ships the clip it serves', () => {
    const clip = fs.readFileSync(path.join(__dirname, 'assets', 'loop.mp4'))
    expect(clip.subarray(4, 8).toString()).toBe('ftyp')
  })
})
