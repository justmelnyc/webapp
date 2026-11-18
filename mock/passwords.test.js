/** @jest-environment node */
const { hashPassword, verifyPassword, hasPassword, isAcceptablePassword } = require('./passwords')

describe('passwords', () => {
  it('hashes with a random salt and verifies the right password only', () => {
    const user = { passwordHash: hashPassword('correct horse') }
    expect(user.passwordHash).toMatch(/^scrypt\$[0-9a-f]+\$[0-9a-f]+$/)
    expect(hashPassword('correct horse')).not.toBe(user.passwordHash)
    expect(verifyPassword(user, 'correct horse')).toBe(true)
    expect(verifyPassword(user, 'wrong horse!')).toBe(false)
    expect(verifyPassword(user, undefined)).toBe(false)
  })

  it('lets users without a hash in with any 8 to 128 character password', () => {
    const seeded = { id: '1' }
    expect(hasPassword(seeded)).toBe(false)
    expect(verifyPassword(seeded, 'password')).toBe(true)
    expect(verifyPassword(seeded, 'short')).toBe(false)
    expect(isAcceptablePassword('x'.repeat(129))).toBe(false)
  })
})
