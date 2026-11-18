/* eslint-disable */
// Artist invites: curated calls for work. Pure logic (seed, links, actions, pagination) so it can be
// unit tested; the HTTP side is routes/artist-invites.js. Records live in db.artistInvites and
// db.artistInviteSubmissions and persist with the rest of the db.
//
// A submission's `status` is one of unapproved | approved | selected | declined. Selected submissions
// also appear in the approved stream, as the real Ello did.
const media = require('./media')

const DAY = 86400000
const KEYS = ['unapproved', 'approved', 'selected', 'declined']
const STREAM_LABELS = { unapproved: 'Unapproved', approved: 'Approved', selected: 'Selected', declined: 'Declined' }
const PER_PAGE = 25
const SEED_VERSION = 2

const inviteSeeds = (now) => {
  const at = days => new Date(now + days * DAY).toISOString()
  return [
    {
      slug: 'neon-nights', title: 'Neon Nights Poster Series', inviteType: 'Poster Design', status: 'open',
      openedAt: at(-5), closedAt: at(12), admins: ['ada'],
      short: 'Gig posters for a fictional festival that only happens after dark.',
      counts: { approved: 30, selected: 4, unapproved: 6, declined: 3 },
    },
    {
      slug: 'tiny-worlds', title: 'Tiny Worlds', inviteType: 'Illustration', status: 'open',
      openedAt: at(-1), closedAt: at(40), admins: [],
      short: 'Whole landscapes in a few square inches. Small scale, big imagination.',
      counts: {},
    },
    {
      slug: 'after-the-rain', title: 'After The Rain', inviteType: 'Photography', status: 'upcoming',
      openedAt: at(10), closedAt: at(40), admins: [],
      short: 'Wet streets, steaming rooftops, the quiet right after a storm.',
      counts: {},
    },
    {
      slug: 'type-for-the-people', title: 'Type For The People', inviteType: 'Type Design', status: 'selecting',
      openedAt: at(-30), closedAt: at(-2), admins: ['ada'],
      short: 'Custom lettering and typefaces made for public signs and everyday places.',
      counts: { approved: 10, selected: 4, unapproved: 3, declined: 2 },
    },
    {
      slug: 'summer-zine', title: 'Summer Zine', inviteType: 'Zine Pages', status: 'closed',
      openedAt: at(-120), closedAt: at(-90), admins: [],
      short: 'Two pages each, one summer, one very long zine. The selections are in.',
      counts: { approved: 8, selected: 4 },
    },
    {
      slug: 'collage-month', title: 'Collage Month', inviteType: 'Collage', status: 'closed',
      openedAt: at(-200), closedAt: at(-170), admins: [],
      short: 'Scissors, glue and old magazines.',
      counts: { approved: 5, selected: 4 },
    },
    {
      slug: 'partner-open-call', title: 'Partner Open Call', inviteType: 'Open Call', status: 'open',
      openedAt: at(-3), closedAt: at(25), admins: [], redirectUrl: 'https://example.com/open-call',
      short: 'Hosted by one of our partners. Submissions happen on their site.',
      counts: {},
    },
  ]
}

const paragraphs = (...lines) => lines.map(l => `<p>${l}</p>`).join('')

const copyFor = (seed) => ({
  description: paragraphs(
    `${seed.short}`,
    `We are looking for ${seed.inviteType.toLowerCase()} that feels personal, surprising and finished. Tell us a story with your work and make it something you would be proud to see on a wall.`,
    'Selected artists are featured across Ello, shared with our community and paid for their work.',
  ),
  guide: [
    {
      title: 'The Brief',
      renderedBody: paragraphs(
        `Create new ${seed.inviteType.toLowerCase()} on the theme of <strong>${seed.title}</strong>. Previously published work is welcome if it fits the theme.`,
        'Include a short description of your process in the body of your post.',
      ),
    },
    {
      title: 'Requirements',
      renderedBody: '<ul><li>One submission per artist</li><li>At least one image, at most six</li><li>Add <em>#ello</em> to your post</li></ul>',
    },
    {
      title: 'How to Submit',
      renderedBody: paragraphs(
        'Press <strong>SUBMIT</strong>, add your work to the post that opens and publish it.',
        'We read every submission. Accepted work appears publicly on this page.',
      ),
    },
  ],
  submissionBodyBlock: `#${seed.slug.replace(/-/g, '')} `,
})

// Statuses per submission, grouped in a stable order
const statusList = counts => KEYS.flatMap(k => Array(counts[k] || 0).fill(k))

const buildArtistInvites = ({ users, posts, now = Date.parse('2026-11-18T12:00:00Z'), nextId }) => {
  const usable = posts.filter(p => !p.repostOfId)
  const invites = []
  const submissions = []
  inviteSeeds(now).forEach((seed, n) => {
    const invite = {
      id: nextId(), slug: seed.slug, title: seed.title, inviteType: seed.inviteType, status: seed.status,
      openedAt: seed.openedAt, closedAt: seed.closedAt, shortDescription: paragraphs(seed.short),
      redirectUrl: seed.redirectUrl || null, adminIds: seed.admins.map(name => (users.find(u => u.username === name) || {}).id).filter(Boolean),
      ...copyFor(seed),
    }
    invites.push(invite)
    statusList(seed.counts).forEach((status, i) => {
      const post = usable[(n * 7 + i) % usable.length]
      if (!post) return
      submissions.push({
        id: nextId(), inviteId: invite.id, postId: post.id, status,
        createdAt: new Date(Date.parse(seed.openedAt) + (i + 1) * 3 * 3600000).toISOString(),
      })
    })
  })
  return { invites, submissions }
}

const seedArtistInvites = (db, nextId, now) => {
  if (db.artistInvites && db.artistInvitesSeed === SEED_VERSION) return 0
  const { invites, submissions } = buildArtistInvites({ users: db.users, posts: db.posts, now, nextId })
  db.artistInvites = invites
  db.artistInvitesSeed = SEED_VERSION
  db.artistInviteSubmissions = submissions
  return invites.length
}

const isAdmin = (invite, viewerId) => !!viewerId && invite.adminIds.includes(viewerId)

// `closed` shows the curators' picks first; open and selecting only show accepted work; admins see every stream
const visibleKeys = (invite, viewerId) => {
  if (invite.status === 'upcoming') return []
  if (isAdmin(invite, viewerId)) return ['unapproved', 'approved', 'selected', 'declined']
  return invite.status === 'closed' ? ['approved', 'selected'] : ['approved']
}

const streamPath = (invite, key) => `/api/v2/artist_invites/${invite.id}/${key}_submissions?status=${key}`

const linksFor = (invite, viewerId) => visibleKeys(invite, viewerId).reduce((links, key) => ({
  ...links,
  [`${key}Submissions`]: { type: 'artist_invite_submission_stream', href: streamPath(invite, key), label: STREAM_LABELS[key] },
}), {})

const inStream = (submission, key) => (key === 'approved' ? ['approved', 'selected'].includes(submission.status) : submission.status === key)

const streamOf = (db, invite, key) => db.artistInviteSubmissions
  .filter(s => s.inviteId === invite.id && inStream(s, key))
  .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

const ACTIONS = {
  approve: { label: 'Approve', status: 'approved' },
  decline: { label: 'Decline', status: 'declined' },
  select: { label: 'Select', status: 'selected' },
  unapprove: { label: 'Unapprove', status: 'unapproved' },
  unselect: { label: 'Unselect', status: 'approved' },
}
const ACTIONS_BY_STATUS = {
  unapproved: ['approve', 'decline'],
  approved: ['select', 'unapprove'],
  selected: ['unselect'],
  declined: ['approve'],
}

const actionsFor = (submission) => ACTIONS_BY_STATUS[submission.status].reduce((acc, type) => ({
  ...acc,
  [type]: { href: `/api/v2/artist_invite_submissions/${submission.id}/${type}`, label: ACTIONS[type].label, method: 'PATCH', body: { status: ACTIONS[type].status } },
}), {})

// Returns the changed submission, or null when the action is not allowed for its current status
const applyAction = (submission, type) => {
  if (!ACTIONS_BY_STATUS[submission.status].includes(type)) return null
  submission.status = ACTIONS[type].status
  return submission
}

const paginate = (list, page = 1, perPage = PER_PAGE) => {
  const p = Math.max(1, parseInt(page, 10) || 1)
  const totalPages = Math.max(1, Math.ceil(list.length / perPage))
  return { items: list.slice((p - 1) * perPage, p * perPage), page: p, totalPages, totalCount: list.length }
}

module.exports = {
  KEYS, PER_PAGE, buildArtistInvites, seedArtistInvites, isAdmin, visibleKeys, linksFor, streamOf, inStream,
  actionsFor, applyAction, paginate,
}
