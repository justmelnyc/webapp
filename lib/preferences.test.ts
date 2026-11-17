import { preferencePatch } from './preferences'

describe('preferencePatch', () => {
  it('changes just the toggled key', () => {
    expect(preferencePatch('has_loves_enabled', false)).toEqual({ has_loves_enabled: false })
    expect(preferencePatch('is_public', true)).toEqual({ is_public: true })
  })

  it('turns off reposting and sharing when the profile becomes private', () => {
    expect(preferencePatch('is_public', false)).toEqual({
      is_public: false,
      has_reposting_enabled: false,
      has_sharing_enabled: false,
    })
  })
})
