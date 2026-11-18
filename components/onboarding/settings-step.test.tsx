import { render, screen } from '@testing-library/react'
import { isInfoBlank, SettingsStep } from './settings-step'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }) }))
jest.mock('@/actions/profile-actions', () => ({ saveInfo: jest.fn(), saveProfileImage: jest.fn() }))
jest.mock('@/lib/client/upload', () => ({ uploadImage: jest.fn() }))

const blank = { name: '', bio: '', location: '', links: [] }
const props = { avatarUrl: null, coverUrl: null, hasAvatar: false, hasCover: false, info: blank }

describe('isInfoBlank', () => {
  it('ignores the location, like the original', () => {
    expect(isInfoBlank(blank)).toBe(true)
    expect(isInfoBlank({ ...blank, location: 'Stockholm' })).toBe(true)
    expect(isInfoBlank({ ...blank, name: 'Ada' })).toBe(false)
    expect(isInfoBlank({ ...blank, bio: 'Hi' })).toBe(false)
    expect(isInfoBlank({ ...blank, links: [{ url: 'https://a.co', text: '' }] })).toBe(false)
  })
})

describe('SettingsStep', () => {
  it('disables next and hides "I\'m Done" while nothing is filled in', () => {
    render(<SettingsStep {...props} />)
    expect(screen.getByRole('button', { name: 'Get Hired & Collaborate' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: "I'm Done" })).not.toBeInTheDocument()
  })

  it('offers both once the profile has a name', () => {
    render(<SettingsStep {...props} info={{ ...blank, name: 'Ada' }} />)
    expect(screen.getByRole('button', { name: 'Get Hired & Collaborate' })).toBeEnabled()
    expect(screen.getByRole('button', { name: "I'm Done" })).toBeInTheDocument()
  })

  it('also counts a saved avatar', () => {
    render(<SettingsStep {...props} hasAvatar avatarUrl="http://x/a.jpg" />)
    expect(screen.getByRole('button', { name: 'Get Hired & Collaborate' })).toBeEnabled()
  })

  it('does not count an avatar the profile says is absent', () => {
    render(<SettingsStep {...props} avatarUrl="http://x/a.jpg" />)
    expect(screen.getByRole('button', { name: 'Get Hired & Collaborate' })).toBeDisabled()
  })
})
