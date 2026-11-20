/* eslint-disable */
// The mock's clock. Seed data is dated relative to an anchor (the moment the database was created,
// stored as db.seededAt), so a fresh database reads like a live site: the newest post is minutes old,
// then hours, then days, tapering off over a month. Pure: every function takes the anchor.
const MINUTE = 60000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const SPAN = 30 * DAY // how far back the oldest seeded post goes
const NEWEST = 2 * MINUTE // age of the newest one
const STEP = 4 * MINUTE // minimum spacing: keeps the first screens minutes and hours apart
const CURVE = 2.3 // > 1: dense near "now", sparse in the past

// Age in ms of item `index` out of `total` (0 is the newest). `jitter` is a number in [0, 1) that moves
// the item by less than half a slot, so the ages stay strictly increasing and never look evenly spaced.
const ageOf = (index, total, jitter = 0.5) => {
  const slot = Math.max(0, index + (jitter - 0.5) * 0.8)
  const last = Math.max(1, total - 1)
  return Math.round(NEWEST + slot * STEP + SPAN * (Math.min(slot, last) / last) ** CURVE)
}

const iso = ms => new Date(ms).toISOString()
const ago = (anchor, age) => iso(anchor - age)

// A moment between `from` and the anchor, `fraction` of the way (0 = at `from`, 1 = at the anchor).
// Used for comments and reposts: they come after the post and never after "now".
const between = (from, anchor, fraction) => iso(Math.min(anchor, Math.round(from + (anchor - from) * fraction)))

// The anchor of a database (older databases were seeded from fixed dates and have none)
const anchorOf = db => (typeof db.seededAt === 'number' ? db.seededAt : null)

module.exports = { MINUTE, HOUR, DAY, SPAN, ageOf, ago, between, iso, anchorOf }
