import {
  emailClientError,
  emailFromServer,
  usernameClientError,
  usernameFromServer,
} from './availability'

describe('usernameClientError', () => {
  it('uses the original messages', () => {
    expect(usernameClientError('a b')).toBe('Username must not contain a space.')
    expect(usernameClientError('a!')).toBe('Username must only contain letters, numbers, underscores & dashes.')
    expect(usernameClientError('A-b_9')).toBeNull()
  })
})

describe('emailClientError', () => {
  it('accepts address-shaped values only', () => {
    expect(emailClientError('nope')).toBe('That email is invalid. Please try again.')
    expect(emailClientError('a@b.co')).toBeNull()
  })
})

describe('server states', () => {
  it('maps an available username to success', () => {
    expect(usernameFromServer({ username: true, suggestions: {} }).status).toBe('success')
  })

  it('maps a taken username to failure with suggestions', () => {
    const state = usernameFromServer({ username: false, suggestions: { username: ['ada1'] } })
    expect(state).toMatchObject({ status: 'failure', suggestions: ['ada1'] })
    expect(state.message).toMatch(/^Username already exists/)
  })

  it('maps emails, quoting a "did you mean" suggestion', () => {
    expect(emailFromServer({ email: true, suggestions: {} }).status).toBe('success')
    expect(emailFromServer({ email: false, suggestions: {} }).message).toBe('That email is invalid')
    expect(emailFromServer({ email: false, suggestions: { email: { full: 'a@gmail.com' } } }).message).toBe(
      'Did you mean a@gmail.com?',
    )
  })
})
