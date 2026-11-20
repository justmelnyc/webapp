/* eslint-disable */
// Honest latency: in live mode every API answer waits a moment, as it would over a network, so loading
// states are visible. Off in static mode. MOCK_LATENCY is the average in ms (default 120, 0 turns it off).
const DEFAULT_MS = 120
const SLOW_SHARE = 0.05 // now and then a request is slow
const SLOW_FACTOR = 3
// pictures, uploads and the mock's own helper endpoints answer at once
const INSTANT = /^\/(img|images|mock-s3|mock|logos|exports)\/|^\/emojis\.json/

const averageMs = (env) => {
  const n = Number(env.MOCK_LATENCY)
  return env.MOCK_LATENCY !== undefined && Number.isFinite(n) && n >= 0 ? n : DEFAULT_MS
}

// How long this request waits: 0.4x to 1.6x the average, three times that for the occasional slow one
const delayFor = (path, average, rand) => {
  if (!average || INSTANT.test(path)) return 0
  const jittered = average * (0.4 + rand() * 1.2)
  return Math.round(rand() < SLOW_SHARE ? jittered * SLOW_FACTOR : jittered)
}

// A delay set while running (POST /mock/latency?ms=3000, routes/live.js) replaces the above: every API answer then
// waits exactly that long, in static mode too, until it is cleared again (no `ms`). It makes "what does the app
// draw while it waits" something a test can capture at a known moment.
const fixedMs = (value) => {
  const n = Number(value)
  return value !== undefined && value !== null && value !== '' && Number.isFinite(n) && n >= 0 ? Math.round(n) : null
}
const create = (enabled, env = process.env, rand = Math.random) => {
  let fixed = null
  const waitFor = (path) => {
    if (fixed !== null) return INSTANT.test(path) ? 0 : fixed
    return enabled ? delayFor(path, averageMs(env), rand) : 0
  }
  return {
    set: (value) => { fixed = fixedMs(value); return fixed },
    status: () => ({ fixedMs: fixed, averageMs: enabled ? averageMs(env) : 0 }),
    waitFor,
    middleware: (req, res, next) => { const ms = waitFor(req.path); return ms ? setTimeout(next, ms) : next() },
  }
}

const middleware = (enabled, env = process.env, rand = Math.random) => create(enabled, env, rand).middleware

module.exports = { create, middleware, delayFor, averageMs, fixedMs, DEFAULT_MS }
