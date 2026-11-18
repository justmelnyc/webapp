/** @jest-environment node */
const { createReset, consumeReset, TTL_MS } = require('./resets')
const { verifyPassword, hasPassword } = require('./passwords')

const makeDb = () => ({ users: [{ id: '1', username: 'ada', email: 'ada@example.com' }] })

describe('password resets', () => {
  it('creates a token for a known email, case-insensitively, and none for an unknown one', () => {
    const db = makeDb()
    expect(createReset(db, 'nobody@example.com')).toBeNull()
    const reset = createReset(db, 'ADA@example.com')
    expect(reset).toMatchObject({ userId: '1', email: 'ada@example.com' })
    expect(reset.token).toMatch(/^[0-9a-f]{32}$/)
    expect(db.resetTokens).toHaveLength(1)
  })

  it('keeps only the newest token per user', () => {
    const db = makeDb()
    const first = createReset(db, 'ada@example.com')
    const second = createReset(db, 'ada@example.com')
    expect(db.resetTokens.map(t => t.token)).toEqual([second.token])
    expect(consumeReset(db, first.token, 'new password').status).toBe('expired')
  })

  it('sets the password once and burns the token', () => {
    const db = makeDb()
    const { token } = createReset(db, 'ada@example.com')
    const result = consumeReset(db, token, 'a brand new one')
    expect(result.status).toBe('ok')
    expect(hasPassword(db.users[0])).toBe(true)
    expect(verifyPassword(db.users[0], 'a brand new one')).toBe(true)
    expect(consumeReset(db, token, 'another one!!').status).toBe('expired')
  })

  it('rejects unacceptable passwords without using the token', () => {
    const db = makeDb()
    const { token } = createReset(db, 'ada@example.com')
    expect(consumeReset(db, token, 'short').status).toBe('invalid')
    expect(consumeReset(db, token, 'long enough now').status).toBe('ok')
  })

  it('expires tokens after an hour and rejects unknown ones', () => {
    const db = makeDb()
    const { token, createdAt } = createReset(db, 'ada@example.com', 1000)
    expect(consumeReset(db, token, 'long enough now', createdAt + TTL_MS).status).toBe('expired')
    expect(consumeReset(db, 'nope', 'long enough now').status).toBe('expired')
  })
})
