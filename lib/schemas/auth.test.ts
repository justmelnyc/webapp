import { loginSchema } from './auth'

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    expect(loginSchema.safeParse({ usernameOrEmail: 'ada', password: 'password1' }).success).toBe(true)
  })

  it('trims the username', () => {
    const result = loginSchema.parse({ usernameOrEmail: '  ada@example.com  ', password: 'password1' })
    expect(result.usernameOrEmail).toBe('ada@example.com')
  })

  it('rejects blank usernames (including whitespace-only)', () => {
    for (const usernameOrEmail of ['', '   ']) {
      const result = loginSchema.safeParse({ usernameOrEmail, password: 'password1' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('Enter your username or email')
    }
  })

  it('requires passwords of at least 8 characters', () => {
    const short = loginSchema.safeParse({ usernameOrEmail: 'ada', password: '1234567' })
    expect(short.success).toBe(false)
    expect(short.error?.issues[0]?.message).toBe('Passwords are at least 8 characters')
    expect(loginSchema.safeParse({ usernameOrEmail: 'ada', password: '12345678' }).success).toBe(true)
  })

  it('does not trim passwords', () => {
    expect(loginSchema.safeParse({ usernameOrEmail: 'ada', password: '       a' }).success).toBe(true)
  })

  it('rejects missing fields', () => {
    expect(loginSchema.safeParse({}).success).toBe(false)
  })
})
