/* eslint-disable */
// Image URL builders. Real face photos (pravatar) and seeded photos (picsum)
// by default; MOCK_OFFLINE=1 serves generated SVG placeholders from this server.
const PORT = process.env.MOCK_PORT || 7770
const HOST = process.env.MOCK_HOST || `http://localhost:${PORT}`
const OFFLINE = process.env.MOCK_OFFLINE === '1'
const enc = encodeURIComponent

const placeholder = (w, h, label) => `${HOST}/img/${w}x${h}/${enc(label)}.svg`

const avatarUrl = (seed, size) => (OFFLINE
  ? placeholder(size, size, seed)
  : `https://i.pravatar.cc/${size}?u=${enc(seed)}`)

const photoUrl = (seed, w, h) => (OFFLINE
  ? placeholder(w, h, seed)
  : `https://picsum.photos/seed/${enc(seed)}/${w}/${h}`)

const version = (url, width, height, type = 'image/jpeg') => ({
  url,
  metadata: { height, width, type, size: width * height },
})

// A single image offered at every density the app asks for
const responsive = (url, w, h) => ({
  xhdpi: version(url, w, h),
  hdpi: version(url, w, h),
  mdpi: version(url, w, h),
  ldpi: version(url, w, h),
  optimized: version(url, w, h),
  original: version(url, w, h),
  video: null,
})

const avatar = (user) => {
  const url = size => user.avatarUrl || avatarUrl(user.username, size)
  return {
    small: version(url(60), 60, 60),
    regular: version(url(120), 120, 120),
    large: version(url(240), 240, 240),
    original: version(url(240), 240, 240),
  }
}

const coverImage = (user) => {
  const url = user.coverUrl || (user.hasCover === false ? null : photoUrl(`${user.username}-cover`, 1600, 600))
  return url ? responsive(url, 1600, 600) : null
}

module.exports = { HOST, PORT, placeholder, avatarUrl, photoUrl, version, responsive, avatar, coverImage }
