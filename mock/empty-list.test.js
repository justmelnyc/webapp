/**
 * @jest-environment node
 */
/* eslint-disable */
const { noContentWhenEmpty } = require('./empty-list')

const response = () => ({ code: null, ended: false, status(c) { this.code = c; return this }, end() { this.ended = true } })

describe('noContentWhenEmpty', () => {
  it('answers 204 for a search without results', () => {
    const res = response()
    expect(noContentWhenEmpty(res, 0)).toBe(true)
    expect(res.code).toBe(204)
    expect(res.ended).toBe(true)
  })

  it('leaves a search with results to the caller', () => {
    const res = response()
    expect(noContentWhenEmpty(res, 3)).toBe(false)
    expect(res.code).toBeNull()
    expect(res.ended).toBe(false)
  })
})
