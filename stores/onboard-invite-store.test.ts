import { finishOnboarding, useOnboardInviteStore } from './onboard-invite-store'

const invite = { id: '7', title: 'Neon Nights', slug: 'neon-nights' }

describe('onboard invite store', () => {
  beforeEach(() => useOnboardInviteStore.getState().reset())

  it('ends onboarding where it normally does when no invite started it', () => {
    expect(finishOnboarding('/following')).toBe('/following')
    expect(useOnboardInviteStore.getState().isCompleting).toBe(false)
  })

  it('returns to the invite, once, and marks the flow as completing', () => {
    useOnboardInviteStore.getState().start(invite)
    expect(finishOnboarding('/following')).toBe('/invites/neon-nights')
    expect(useOnboardInviteStore.getState()).toMatchObject({ invite: null, isCompleting: true })
    expect(finishOnboarding('/following')).toBe('/following')
  })

  it('reset clears everything', () => {
    useOnboardInviteStore.getState().start(invite)
    useOnboardInviteStore.getState().complete()
    useOnboardInviteStore.getState().reset()
    expect(useOnboardInviteStore.getState()).toMatchObject({ invite: null, isCompleting: false })
  })
})
