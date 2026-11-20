/* eslint-disable */
// Video attachments. The real API gives an animated upload a `video` rendition next to its stills; the app
// plays that (muted, looping) in streams and shows the still on the post page. An image region with
// `video: true` gets one here. The clip is a two second file of unchanging colour bars served by this
// server (assets/loop.mp4), so nothing new is fetched from outside and every frame is the same picture.
const media = require('./media')

const VIDEO_URL = `${media.HOST}/media/loop.mp4`

// the attachment of an image region: its stills, plus the clip when the region is a video
const attachment = (region, url, w, h) => ({
  ...media.responsive(url, w, h),
  ...(region.video ? { video: media.version(VIDEO_URL, w, h, 'video/mp4') } : {}),
})

const SEED_VIDEOS = [
  ['mara', 'Four seconds from the press this morning.', [1200, 800], 'vid0x3000'],
  ['jules', 'Loop test, sound off.', [900, 1200], 'vid1x3011'],
]

// Two seeded posts with a video attachment (idempotent: skipped once any exists)
const seedVideoPosts = (db, nextId, now = Date.parse('2026-11-02T08:00:00Z')) => {
  if (db.posts.some(p => p.regions.some(r => r.video))) return 0
  let added = 0
  SEED_VIDEOS.forEach(([username, caption, [width, height], token], n) => {
    const author = db.users.find(u => u.username === username)
    if (!author) return
    db.posts.push({
      id: nextId(), token, authorId: author.id,
      createdAt: new Date(now - n * 11 * 3600000).toISOString(),
      regions: [
        { kind: 'text', data: `<p>${caption}</p>` },
        { kind: 'image', data: { url: null, seed: `video-${username}-${n}` }, width, height, video: true },
      ],
      categoryIds: [], views: 60 + n * 17,
    })
    added += 1
  })
  return added
}

module.exports = { VIDEO_URL, attachment, seedVideoPosts }
