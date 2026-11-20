/**
 * @jest-environment node
 */
/* eslint-disable */
const cors = require('./cors')

const response = () => ({ headers: null, status: null, set(h) { this.headers = h }, sendStatus(s) { this.status = s } })

describe('cors', () => {
  it('exposes the paging headers, so a page from another origin can follow rel="next" past page 2', () => {
    expect(cors.HEADERS['Access-Control-Expose-Headers'].split(', ')).toEqual(['Link', 'X-Total-Pages', 'X-Total-Pages-Remaining', 'X-TotalCount'])
    expect(cors.HEADERS['Access-Control-Allow-Origin']).toBe('*')
  })

  it('sets the headers and lets ordinary requests through', () => {
    const res = response()
    expect(cors.apply({ method: 'GET' }, res)).toBe(false)
    expect(res.headers).toBe(cors.HEADERS)
    expect(res.status).toBeNull()
  })

  it('answers a preflight itself', () => {
    const res = response()
    expect(cors.apply({ method: 'OPTIONS' }, res)).toBe(true)
    expect(res.status).toBe(204)
    expect(res.headers).toBe(cors.HEADERS)
  })
})
