/** @jest-environment node */
/* eslint-disable */
const clock = require('./clock')

const NOW = Date.parse('2027-03-01T12:00:00.000Z')

describe('relative dating', () => {
  it('starts minutes ago and tapers off over a month', () => {
    const ages = Array.from({ length: 250 }, (_, i) => clock.ageOf(i, 250))
    expect(ages[0]).toBeLessThan(5 * clock.MINUTE)
    expect(ages[10]).toBeLessThan(2 * clock.HOUR)
    expect(ages[40]).toBeGreaterThan(6 * clock.HOUR)
    expect(ages[40]).toBeLessThan(clock.DAY)
    expect(ages[120]).toBeGreaterThan(3 * clock.DAY)
    expect(ages[249]).toBeGreaterThan(clock.SPAN)
    expect(ages[249]).toBeLessThan(clock.SPAN + clock.DAY)
    // the gaps grow: recent posts are close together, old ones days apart
    expect(ages[249] - ages[248]).toBeGreaterThan((ages[11] - ages[10]) * 10)
  })

  it('stays strictly ordered whatever the jitter', () => {
    const jitters = [0, 0.999, 0.5, 0.999, 0, 0, 0.999, 0.25]
    const ages = Array.from({ length: 80 }, (_, i) => clock.ageOf(i, 80, jitters[i % jitters.length]))
    ages.slice(1).forEach((age, i) => expect(age).toBeGreaterThan(ages[i]))
    expect(Math.min(...ages)).toBeGreaterThan(0)
  })

  it('dates from the anchor and never after it', () => {
    expect(clock.ago(NOW, 3 * clock.MINUTE)).toBe('2027-03-01T11:57:00.000Z')
    const posted = NOW - clock.HOUR
    expect(clock.between(posted, NOW, 0.5)).toBe('2027-03-01T11:30:00.000Z')
    expect(clock.between(posted, NOW, 4)).toBe('2027-03-01T12:00:00.000Z')
  })

  it('knows a database without an anchor is from the old seed', () => {
    expect(clock.anchorOf({ seededAt: NOW })).toBe(NOW)
    expect(clock.anchorOf({})).toBeNull()
  })
})
