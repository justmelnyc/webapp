/* eslint-disable */
// Resolves pasted media links into the embed regions the original's `post_previews` API returned, plus
// oEmbed-style metadata. No network: thumbnails come from the same seeded photo service as the rest of the mock.
const media = require('./media')

const prefixed = source => new RegExp(`(?:https?:\\/\\/)?(?:w{3}\\.)?${source}(?:\\/?|$|\\s|\\?|#)`)

// Same services (and regexes) as the web app's utils/embed-services.ts, which are the original's embetter ones.
const SERVICES = [
  { name: 'youtube', provider: 'YouTube', type: 'video', regex: /(?:.+?)?(?:youtube\.com\/v\/|watch\/|\?v=|&v=|youtu\.be\/|\/v=|^youtu\.be\/)([a-zA-Z0-9_-]{11})+/, link: id => `https://www.youtube.com/watch?v=${id}` },
  { name: 'vimeo', provider: 'Vimeo', type: 'video', regex: prefixed('vimeo.com\\/(\\S*)'), link: id => `https://vimeo.com/${id}` },
  { name: 'soundcloud', provider: 'SoundCloud', type: 'rich', regex: prefixed('(?:soundcloud.com|snd.sc)\\/([a-zA-Z0-9_-]*(?:\\/sets)?(?:\\/groups)?\\/[a-zA-Z0-9_-]*)'), link: id => `https://soundcloud.com/${id}` },
  { name: 'dailymotion', provider: 'Dailymotion', type: 'video', regex: prefixed('dailymotion.com\\/video\\/([a-zA-Z0-9-_]*)'), link: id => `http://www.dailymotion.com/video/${id}` },
  { name: 'mixcloud', provider: 'Mixcloud', type: 'rich', regex: prefixed('(?:mixcloud.com)\\/(.*\\/.*)'), link: id => `https://www.mixcloud.com/${id}` },
  { name: 'codepen', provider: 'CodePen', type: 'rich', regex: prefixed('(?:codepen.io)\\/([a-zA-Z0-9_\\-%]*\\/[a-zA-Z0-9_\\-%]*\\/[a-zA-Z0-9_\\-%]*)'), link: id => `https://codepen.io/${id.replace('/embed/', '/pen/')}` },
  { name: 'bandcamp', provider: 'Bandcamp', type: 'rich', regex: prefixed('([a-zA-Z0-9_\\-]*.bandcamp.com\\/(?:album|track)\\/[a-zA-Z0-9_\\-%]*)'), link: id => `https://${id}` },
  { name: 'ustream', provider: 'Ustream', type: 'video', regex: prefixed('(?:ustream.tv|ustre.am)\\/((?:(?:recorded|channel)\\/)?[a-zA-Z0-9_\\-%]*)'), link: id => `http://www.ustream.tv/${id}` },
]

const WIDTH = 1280
const HEIGHT = 720

// The first service whose regex matches, like the original's `checkForEmbeds`
const match = (text) => {
  const input = String(text || '')
  for (const service of SERVICES) {
    const m = input.match(service.regex)
    if (m && m[1]) return { service, id: m[1] }
  }
  return null
}

const titleFor = (service, id) => `${service.provider} ${service.type === 'video' ? 'video' : 'embed'} ${id.split('/').pop()}`

// oEmbed-style document for a URL, or null when no service recognises it
const resolve = (url) => {
  const found = match(url)
  if (!found) return null
  const { service, id } = found
  const link = service.link(id)
  return {
    version: '1.0',
    type: service.type,
    provider_name: service.provider,
    title: titleFor(service, id),
    author_name: service.provider,
    url: link,
    width: WIDTH,
    height: HEIGHT,
    thumbnail_url: media.photoUrl(`embed-${service.name}-${id}`, WIDTH, HEIGHT),
    thumbnail_width: WIDTH,
    thumbnail_height: HEIGHT,
    // what the app stores in a post's embed region
    region: { service: service.name, id, url: link, thumbnailLargeUrl: media.photoUrl(`embed-${service.name}-${id}`, WIDTH, HEIGHT) },
  }
}

// Three seeded posts with video / audio embeds (idempotent: skipped once any embed post exists)
const SEED_EMBEDS = [
  ['noor', 'Motion test for the new reel.', 'https://vimeo.com/76979871'],
  ['theo', 'Found this documentary at 2am and could not stop watching.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
  ['kofi', 'On repeat in the studio this week.', 'https://soundcloud.com/forss/flickermood'],
]

const seedEmbedPosts = (db, nextId, now = Date.parse('2026-11-02T10:30:00Z')) => {
  if (db.posts.some(p => p.regions.some(r => r.kind === 'embed'))) return 0
  SEED_EMBEDS.forEach(([username, caption, url], n) => {
    const author = db.users.find(u => u.username === username)
    const doc = resolve(url)
    if (!author || !doc) return
    db.posts.push({
      id: nextId(), token: `emb${n}x${2000 + n * 11}`, authorId: author.id,
      createdAt: new Date(now - n * 9 * 3600000).toISOString(),
      regions: [{ kind: 'text', data: `<p>${caption}</p>` }, { kind: 'embed', data: doc.region }],
      categoryIds: [String(1 + (n % 4))], views: 120 + n * 31,
    })
  })
  return SEED_EMBEDS.length
}

module.exports = { SERVICES, match, resolve, seedEmbedPosts }
