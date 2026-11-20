/* eslint-disable */
// Runs live.js on a timer while the mock is up, and remembers who is logged in so the activity can be aimed
// at them. Settings (environment):
//   MOCK_LIVE=0            static mode: no background activity, no latency (what visual diffing needs)
//   MOCK_LIVE=1            force it on for a database made by the old seed (off there by default)
//   MOCK_LIVE_INTERVAL=20  average seconds between two actions (each gap is jittered 0.4x to 1.6x)
//   MOCK_LIVE_MAX_POSTS / MOCK_LIVE_MAX_COMMENTS   growth caps (see live.prune)
const live = require('./live')

const DEFAULT_INTERVAL = 20
const PRESENT_FOR = 30 * 60000 // someone counts as logged in for half an hour after their last request
const IDLE_AFTER = 10 * 60000 // with nobody around the pace drops...
const IDLE_SLOWDOWN = 6 // ...to a sixth
const DEFAULT_VIEWER = '1' // ada, the default login, until somebody else shows up

// On unless switched off. A database from the old seed stays static unless asked: other tools may be
// comparing two apps against it, and its weeks-old posts would sit oddly under brand new ones.
const isEnabled = (env, db) => {
  if (env.MOCK_LIVE === '0') return false
  if (env.MOCK_LIVE === '1') return true
  return (db.seedVersion || 1) >= 2
}

const number = (value, fallback, min) => {
  const n = Number(value)
  return Number.isFinite(n) && n >= min ? n : fallback
}
const intervalMs = env => number(env.MOCK_LIVE_INTERVAL, DEFAULT_INTERVAL, 0.05) * 1000
const capsOf = env => ({
  maxPosts: number(env.MOCK_LIVE_MAX_POSTS, live.CAPS.maxPosts, 0),
  maxComments: number(env.MOCK_LIVE_MAX_COMMENTS, live.CAPS.maxComments, 0),
})

// The gap before the next action: jittered, and longer when nobody has asked for anything in a while
const nextDelay = (base, rand, idle) => Math.round(base * (0.4 + rand() * 1.2) * (idle ? IDLE_SLOWDOWN : 1))

// Who is around: everyone seen recently, else whoever was seen last, else the default login
const viewersOf = (seen, now) => {
  const entries = [...seen.entries()]
  const present = entries.filter(([, at]) => now - at < PRESENT_FOR).map(([id]) => id)
  if (present.length) return present
  const last = entries.sort((a, b) => b[1] - a[1])[0]
  return [last ? last[0] : DEFAULT_VIEWER]
}

// The stateful part. `deps` are the mock's own modules (injected so this file stays testable).
const create = ({ db, save, nextId, sync, env = process.env, log = console.log }) => {
  const seen = new Map()
  const recent = []
  let lastRequest = 0
  let timer = null

  const describe = (a) => {
    if (a.kind === 'post') return `@${a.by} posted ${a.post}`
    if (a.kind === 'follow') return `@${a.by} followed @${a.of}`
    if (a.reply) return `@${a.by} answered in the thread of ${a.post}`
    const verb = { love: 'loved', comment: 'commented on', repost: 'reposted' }[a.kind]
    return `@${a.by} ${verb} @${a.of}'s ${a.post}`
  }

  const act = (now = Date.now(), rand = Math.random) => {
    const action = live.step(db, { now, rand, nextId, viewerIds: viewersOf(seen, now).filter(id => db.users.some(u => u.id === id)) })
    if (!action) return null
    live.prune(db, capsOf(env))
    save()
    sync() // loves, comments, follows and reposts become notifications here
    recent.unshift({ ...action, at: new Date(now).toISOString() })
    recent.length = Math.min(recent.length, 30)
    log(`  live: ${describe(action)}`)
    return action
  }

  const schedule = () => {
    const idle = Date.now() - lastRequest > IDLE_AFTER
    timer = setTimeout(() => { act(); schedule() }, nextDelay(intervalMs(env), Math.random, idle))
    timer.unref()
  }

  return {
    enabled: isEnabled(env, db),
    start: () => { if (isEnabled(env, db) && !timer) schedule() },
    stop: () => { clearTimeout(timer); timer = null },
    act,
    // called for every request: `viewerId` is who the bearer token says is asking (null when logged out)
    touch: (viewerId, now = Date.now()) => { lastRequest = now; if (viewerId) seen.set(viewerId, now) },
    status: () => ({
      enabled: isEnabled(env, db), running: !!timer, intervalSeconds: intervalMs(env) / 1000, caps: capsOf(env),
      viewers: viewersOf(seen, Date.now()), seedVersion: db.seedVersion || 1, seededAt: db.seededAt ? new Date(db.seededAt).toISOString() : null,
      livePosts: db.posts.filter(p => p.live).length, liveComments: db.comments.filter(c => c.live).length, recent,
    }),
  }
}

module.exports = { create, isEnabled, intervalMs, capsOf, nextDelay, viewersOf, DEFAULT_INTERVAL, PRESENT_FOR, IDLE_SLOWDOWN }
