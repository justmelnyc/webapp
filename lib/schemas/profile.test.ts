import { credentialsSchema, creatorTypeIdsSchema, infoSchema, newPasswordSchema } from './profile'

describe('newPasswordSchema', () => {
  it('treats an empty field as "keep my password"', () => {
    expect(newPasswordSchema.safeParse('').success).toBe(true)
  })

  it('needs 8 to 128 characters otherwise, with the original message', () => {
    const short = newPasswordSchema.safeParse('1234567')
    expect(short.success).toBe(false)
    expect(short.error?.issues[0]?.message).toBe('Password must be at least 8 characters.')
    expect(newPasswordSchema.safeParse('12345678').success).toBe(true)
    expect(newPasswordSchema.safeParse('x'.repeat(128)).success).toBe(true)
    expect(newPasswordSchema.safeParse('x'.repeat(129)).success).toBe(false)
  })
})

describe('credentialsSchema', () => {
  const valid = { username: 'ada', email: 'ada@example.com', password: '', currentPassword: '' }

  it('accepts the unchanged credentials', () => {
    expect(credentialsSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a bad email or username', () => {
    expect(credentialsSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false)
    expect(credentialsSchema.safeParse({ ...valid, username: 'Has Space' }).success).toBe(false)
  })
})

describe('infoSchema', () => {
  it('validates links as full URLs', () => {
    const base = { name: '', bio: '', location: '' }
    expect(infoSchema.safeParse({ ...base, links: [{ url: 'https://example.com', text: '' }] }).success).toBe(true)
    expect(infoSchema.safeParse({ ...base, links: [{ url: 'example', text: '' }] }).success).toBe(false)
  })
})

describe('creatorTypeIdsSchema', () => {
  it('takes category ids as positive integers', () => {
    expect(creatorTypeIdsSchema.safeParse([1, 3]).success).toBe(true)
    expect(creatorTypeIdsSchema.safeParse(['1']).success).toBe(false)
    expect(creatorTypeIdsSchema.safeParse([0]).success).toBe(false)
  })
})
