/** @jest-environment node */
/* eslint-disable */
jest.mock('./db', () => ({ db: {}, save: jest.fn(), nextId: jest.fn(), userById: jest.fn() }))

const { build, rng } = require('./seed')
const runner = require('./live-runner')
const latency = require('./latency')

const NOW = Date.parse('2027-03-01T12:00:00.000Z')

describe('live mode switch', () => {
  it('is on for the living seed, off for MOCK_LIVE=0 and for an old database unless forced', () => {
    expect(runner.isEnabled({}, { seedVersion: 2 })).toBe(true)
    expect(runner.isEnabled({ MOCK_LIVE: '0' }, { seedVersion: 2 })).toBe(false)
    expect(runner.isEnabled({}, {})).toBe(false)
    expect(runner.isEnabled({ MOCK_LIVE: '1' }, {})).toBe(true)
  })

  it('reads the pace and the caps from the environment, ignoring nonsense', () => {
    expect(runner.intervalMs({})).toBe(runner.DEFAULT_INTERVAL * 1000)
    expect(runner.intervalMs({ MOCK_LIVE_INTERVAL: '5' })).toBe(5000)
    expect(runner.intervalMs({ MOCK_LIVE_INTERVAL: 'soon' })).toBe(runner.DEFAULT_INTERVAL * 1000)
    expect(runner.intervalMs({ MOCK_LIVE_INTERVAL: '0' })).toBe(runner.DEFAULT_INTERVAL * 1000)
    expect(runner.capsOf({ MOCK_LIVE_MAX_POSTS: '30' })).toEqual({ maxPosts: 30, maxComments: 600 })
  })

  it('jitters the gap around the interval and slows down when nobody is around', () => {
    expect(runner.nextDelay(20000, () => 0, false)).toBe(8000)
    expect(runner.nextDelay(20000, () => 0.5, false)).toBe(20000)
    expect(runner.nextDelay(20000, () => 0.999, false)).toBeLessThan(32000)
    expect(runner.nextDelay(20000, () => 0.5, true)).toBe(20000 * runner.IDLE_SLOWDOWN)
  })

  it('aims at everyone seen recently, else at whoever was seen last, else at ada', () => {
    expect(runner.viewersOf(new Map(), NOW)).toEqual(['1'])
    const seen = new Map([['4', NOW - 1000], ['7', NOW - 60000], ['9', NOW - runner.PRESENT_FOR - 1]])
    expect(runner.viewersOf(seen, NOW)).toEqual(['4', '7'])
    expect(runner.viewersOf(seen, NOW + 2 * runner.PRESENT_FOR)).toEqual(['4'])
  })
})

describe('the runner', () => {
  const setup = (env = {}) => {
    const db = build(NOW)
    const deps = { db, save: jest.fn(), sync: jest.fn(), nextId: () => String(++db.seq), env, log: jest.fn() }
    return { db, deps, live: runner.create(deps) }
  }

  it('acts, saves, syncs notifications and remembers what happened', () => {
    const { deps, live } = setup()
    live.touch('5', NOW)
    const rand = rng(5)
    const actions = Array.from({ length: 40 }, (_, i) => live.act(NOW + i * 1000, rand))
    expect(actions.every(Boolean)).toBe(true)
    expect(actions.some(a => a.by === 'theo')).toBe(false) // user 5 is logged in
    expect(deps.save).toHaveBeenCalledTimes(40)
    expect(deps.sync).toHaveBeenCalledTimes(40)
    expect(deps.log).toHaveBeenCalledWith(expect.stringMatching(/^  live: @\w+ /))
    expect(live.status()).toMatchObject({ enabled: true, running: false, intervalSeconds: 20, seedVersion: 2 })
    expect(live.status().recent).toHaveLength(30)
    expect(live.status().recent[0]).toMatchObject({ ...actions[39], at: new Date(NOW + 39000).toISOString() })
  })

  it('applies the growth caps as it goes', () => {
    const { db, live } = setup({ MOCK_LIVE_MAX_POSTS: '3', MOCK_LIVE_MAX_COMMENTS: '4' })
    const rand = rng(9)
    for (let i = 0; i < 400; i += 1) live.act(NOW + i * 1000, rand)
    expect(db.posts.filter(p => p.live && !p.repostOfId).length).toBeLessThanOrEqual(3)
    expect(db.comments.filter(c => c.live).length).toBeLessThanOrEqual(4)
  })

  it('does not start a timer in static mode', () => {
    jest.useFakeTimers()
    const { deps, live } = setup({ MOCK_LIVE: '0' })
    live.start()
    jest.advanceTimersByTime(3600000)
    expect(deps.save).not.toHaveBeenCalled()
    expect(live.status().running).toBe(false)
    const on = setup({ MOCK_LIVE_INTERVAL: '1' })
    on.live.start()
    jest.advanceTimersByTime(600000)
    expect(on.deps.save.mock.calls.length).toBeGreaterThan(40)
    on.live.stop()
    jest.useRealTimers()
  })
})

describe('latency', () => {
  it('waits around the average on API calls and not at all on pictures or helpers', () => {
    expect(latency.delayFor('/api/v3/graphql', 120, () => 0.5)).toBe(120)
    expect(latency.delayFor('/api/v2/profile', 120, () => 0.99)).toBeLessThanOrEqual(192)
    expect(latency.delayFor('/api/v2/profile', 100, () => 0.01)).toBe(Math.round(100 * (0.4 + 0.012) * 3)) // the slow one
    ;['/img/100x100/a.svg', '/mock-s3/uploads/a.png', '/images/emoji/smile.png', '/mock/live', '/emojis.json'].forEach((path) => {
      expect(latency.delayFor(path, 120, () => 0.5)).toBe(0)
    })
    expect(latency.delayFor('/api/v3/graphql', 0, () => 0.5)).toBe(0)
  })

  it('reads MOCK_LATENCY and is skipped entirely when live mode is off', () => {
    expect(latency.averageMs({})).toBe(latency.DEFAULT_MS)
    expect(latency.averageMs({ MOCK_LATENCY: '0' })).toBe(0)
    expect(latency.averageMs({ MOCK_LATENCY: '400' })).toBe(400)
    expect(latency.averageMs({ MOCK_LATENCY: 'x' })).toBe(latency.DEFAULT_MS)
    const next = jest.fn()
    latency.middleware(false, {}, () => 0.5)({ path: '/api/v2/profile' }, {}, next)
    expect(next).toHaveBeenCalledTimes(1)
    jest.useFakeTimers()
    latency.middleware(true, {}, () => 0.5)({ path: '/api/v2/profile' }, {}, next)
    expect(next).toHaveBeenCalledTimes(1)
    jest.advanceTimersByTime(120)
    expect(next).toHaveBeenCalledTimes(2)
    jest.useRealTimers()
  })
})
