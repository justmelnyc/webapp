/* eslint-disable */
// v2 REST for artist invites (JSON as the original app reads it: `artistInvites`, `artistInviteSubmissions`
// with a `linked` section), the admin selection actions, and generated logo SVGs.
const express = require('express')
const { db, save, postById, userById } = require('../db')
const media = require('../media')
const { flatPost, flatUser, postRegions } = require('../serialize')
const ai = require('../artist-invites')
const { viewerId } = require('./auth')

const router = express.Router()

const image = (seed, w, h) => media.responsive(media.photoUrl(seed, w, h), w, h)

const invitePayload = (invite, viewer, detail) => ({
  id: invite.id,
  slug: invite.slug,
  title: invite.title,
  inviteType: invite.inviteType,
  status: invite.status,
  openedAt: invite.openedAt,
  closedAt: invite.closedAt,
  shortDescription: invite.shortDescription,
  redirectUrl: invite.redirectUrl,
  headerImage: image(`invite-${invite.slug}-header`, 1920, 1080),
  logoImage: media.responsive(`${media.HOST}/logos/${invite.slug}.svg`, 600, 300),
  ...(detail ? {
    description: invite.description,
    guide: invite.guide,
    submissionBodyBlock: invite.submissionBodyBlock,
    links: ai.linksFor(invite, viewer),
  } : {}),
})

const inviteByRef = ref => db.artistInvites.find(i => (String(ref).startsWith('~') ? i.slug === String(ref).slice(1) : i.id === String(ref)))

const submissionPayload = (submission, invite, viewer) => ({
  id: submission.id,
  status: submission.status,
  actions: ai.isAdmin(invite, viewer) ? ai.actionsFor(submission) : null,
  links: { post: { id: submission.postId, type: 'posts' }, artistInvite: { id: invite.id, type: 'artist_invites' } },
})

const linkedFor = (submissions, viewer) => {
  const posts = submissions.map(s => postById(s.postId)).filter(Boolean)
  const authors = [...new Set(posts.map(p => p.authorId))].map(userById).filter(Boolean)
  return {
    posts: posts.map(p => flatPost(p, viewer)),
    users: authors.map(u => flatUser(u, viewer)),
    assets: posts.flatMap(p => postRegions(p).assets),
  }
}

router.get('/api/v2/artist_invites', (req, res) => {
  const viewer = viewerId(req)
  const order = { open: 0, selecting: 1, upcoming: 2, closed: 3 }
  const invites = [...db.artistInvites].sort((a, b) => order[a.status] - order[b.status])
  const { items, totalPages, totalCount, page } = ai.paginate(invites, req.query.page, parseInt(req.query.per_page, 10) || 20)
  res.set({ 'X-Total-Pages': String(totalPages), 'X-Total-Pages-Remaining': String(totalPages - page), 'X-TotalCount': String(totalCount) })
  res.json({ artistInvites: items.map(i => invitePayload(i, viewer, false)) })
})

router.get('/api/v2/artist_invites/:ref', (req, res) => {
  const invite = inviteByRef(req.params.ref)
  if (!invite) return res.status(404).json({ error: 'not found' })
  return res.json({ artistInvites: invitePayload(invite, viewerId(req), true) })
})

router.get('/api/v2/artist_invites/:ref/:stream', (req, res) => {
  const invite = inviteByRef(req.params.ref)
  const key = String(req.params.stream).replace(/_submissions$/, '')
  const viewer = viewerId(req)
  if (!invite || !ai.visibleKeys(invite, viewer).includes(key)) return res.status(404).json({ error: 'not found' })
  const perPage = parseInt(req.query.per_page, 10) || ai.PER_PAGE
  const { items, page, totalPages, totalCount } = ai.paginate(ai.streamOf(db, invite, key), req.query.page, perPage)
  const headers = { 'X-Total-Pages': String(totalPages), 'X-Total-Pages-Remaining': String(totalPages - page), 'X-TotalCount': String(totalCount) }
  if (page < totalPages) {
    const next = new URLSearchParams({ ...req.query, page: String(page + 1) })
    headers.Link = `<${req.protocol}://${req.get('host')}${req.path}?${next}>; rel="next"`
  }
  res.set(headers).json({
    artistInviteSubmissions: items.map(s => submissionPayload(s, invite, viewer)),
    linked: linkedFor(items, viewer),
  })
})

// Admin selection: approve, decline, select, unapprove, unselect
router.patch('/api/v2/artist_invite_submissions/:id/:action', (req, res) => {
  const submission = db.artistInviteSubmissions.find(s => s.id === req.params.id)
  const invite = submission && db.artistInvites.find(i => i.id === submission.inviteId)
  const viewer = viewerId(req)
  if (!invite || !ai.isAdmin(invite, viewer)) return res.status(404).json({ error: 'not found' })
  if (!ai.applyAction(submission, req.params.action)) return res.status(422).json({ error: 'invalid action' })
  save()
  return res.json({ artistInviteSubmissions: submissionPayload(submission, invite, viewer), linked: linkedFor([submission], viewer) })
})

// Transparent white wordmark for an invite's logo
router.get('/logos/:slug.svg', (req, res) => {
  const invite = inviteByRef(`~${req.params.slug}`)
  const words = (invite ? invite.title : req.params.slug).toUpperCase().split(/\s+/)
  const lines = words.length > 3 ? [words.slice(0, 2).join(' '), words.slice(2).join(' ')] : [words.join(' ')]
  const escape = s => s.replace(/[<>&"]/g, '')
  const text = lines.map((l, i) => `<text x="300" y="${150 + (i - (lines.length - 1) / 2) * 56}" fill="#fff" font-family="Helvetica, Arial, sans-serif" font-weight="900" font-size="48" text-anchor="middle" dominant-baseline="middle">${escape(l)}</text>`).join('')
  res.type('image/svg+xml').send(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300">${text}</svg>`)
})

module.exports = { router }
