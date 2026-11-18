import { lowercaseUsernamePath } from './lowercase-username'

describe('lowercaseUsernamePath', () => {
  it('lowercases the username segment and keeps the rest', () => {
    expect(lowercaseUsernamePath('/Ada')).toBe('/ada')
    expect(lowercaseUsernamePath('/Ada/followers')).toBe('/ada/followers')
    expect(lowercaseUsernamePath('/Ada/post/AbC123')).toBe('/ada/post/AbC123')
  })

  it('leaves lowercase paths, the root and internal paths alone', () => {
    expect(lowercaseUsernamePath('/ada/post/AbC123')).toBeNull()
    expect(lowercaseUsernamePath('/')).toBeNull()
    expect(lowercaseUsernamePath('/_next/Static')).toBeNull()
  })
})
