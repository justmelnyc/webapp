/* eslint-disable */
// Comment bodies: one text region, or the stored regions in order when the comment carries pictures
const media = require('./media')

// A picture is stored with its `url` (uploads) or, for seeded comments, a `seed` for the photo service
const urlOf = r => r.url || media.photoUrl(r.seed, r.width, r.height)

// Comment content: one text region, or the stored regions in order when the comment carries pictures
const commentContent = (c) => {
  const assets = []
  const content = (c.regions || [{ kind: 'text', text: c.text }]).map((r, i) => {
    if (r.kind !== 'image') return { kind: 'text', data: `<p>${r.text}</p>`, linkUrl: null, links: null }
    const id = `${c.id}-a${i}`
    assets.push({ id, attachment: media.responsive(urlOf(r), r.width, r.height) })
    return { kind: 'image', data: { url: urlOf(r), alt: r.alt || '' }, linkUrl: null, links: { assets: id } }
  })
  return { content, assets }
}

// v2 comment as the comments reducer stores it
const flatComment = (c) => {
  if (!c.regions) {
    const text = { kind: 'text', data: `<p>${c.text}</p>` }
    return {
      id: c.id, postId: c.postId, authorId: c.authorId, createdAt: c.createdAt,
      body: [{ kind: 'text', data: c.text }], content: [text], summary: [text],
    }
  }
  const { content, assets } = commentContent(c)
  const byId = assets.reduce((m, a) => ({ ...m, [a.id]: a }), {})
  const withAsset = content.map(r => (r.kind === 'image' ? { ...r, asset: byId[r.links.assets] } : r))
  const body = c.regions.map(r => (r.kind === 'image' ? { kind: 'image', data: { url: urlOf(r), alt: r.alt || '' } } : { kind: 'text', data: r.text }))
  return { id: c.id, postId: c.postId, authorId: c.authorId, createdAt: c.createdAt, body, content: withAsset, summary: withAsset }
}

module.exports = { commentContent, flatComment }
