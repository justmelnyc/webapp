import { signupErrorMessage } from './signup'

describe('signupErrorMessage', () => {
  it('reads the first attribute error', () => {
    const body = JSON.stringify({ errors: { attrs: { username: 'is invalid or has already been taken' } } })
    expect(signupErrorMessage(body)).toBe('username is invalid or has already been taken')
  })

  it('handles arrays and underscores', () => {
    const body = JSON.stringify({ errors: { attrs: { invitation_code: ['is not valid'] } } })
    expect(signupErrorMessage(body)).toBe('invitation code is not valid')
  })

  it('returns null for anything else', () => {
    expect(signupErrorMessage('nope')).toBeNull()
    expect(signupErrorMessage('{}')).toBeNull()
  })
})
