/* eslint-disable */
const { create, delayFor, averageMs, fixedMs } = require('./latency')

describe('latency', () => {
  it('jitters around the average and leaves pictures and helper endpoints alone', () => {
    expect(delayFor('/api/v2/profile', 100, () => 0.5)).toBe(100)
    expect(delayFor('/img/a.jpg', 100, () => 0.5)).toBe(0)
    expect(delayFor('/mock/live', 100, () => 0.5)).toBe(0)
    expect(averageMs({ MOCK_LATENCY: '0' })).toBe(0)
  })

  it('is off in static mode until a fixed delay is set', () => {
    const latency = create(false, {}, () => 0.5)
    expect(latency.waitFor('/api/v2/profile')).toBe(0)
    expect(latency.set('3000')).toBe(3000)
    expect(latency.waitFor('/api/v2/profile')).toBe(3000)
    expect(latency.waitFor('/img/a.jpg')).toBe(0)
    expect(latency.status()).toEqual({ fixedMs: 3000, averageMs: 0 })
  })

  it('a fixed delay replaces the jittered one and clearing it brings that back', () => {
    const latency = create(true, { MOCK_LATENCY: '200' }, () => 0.5)
    expect(latency.waitFor('/api/v2/profile')).toBe(200)
    latency.set(0)
    expect(latency.waitFor('/api/v2/profile')).toBe(0)
    latency.set(undefined)
    expect(latency.waitFor('/api/v2/profile')).toBe(200)
  })

  it('only takes sensible numbers', () => {
    expect(fixedMs('abc')).toBeNull()
    expect(fixedMs('')).toBeNull()
    expect(fixedMs(-5)).toBeNull()
    expect(fixedMs('1500.4')).toBe(1500)
  })

  it('waits before passing the request on', () => {
    jest.useFakeTimers()
    const latency = create(false)
    latency.set(50)
    const next = jest.fn()
    latency.middleware({ path: '/api/v2/profile' }, {}, next)
    expect(next).not.toHaveBeenCalled()
    jest.advanceTimersByTime(50)
    expect(next).toHaveBeenCalledTimes(1)
    jest.useRealTimers()
  })
})
