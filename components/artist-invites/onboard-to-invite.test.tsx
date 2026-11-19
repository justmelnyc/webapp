import { act, render } from '@testing-library/react'
import { useComposerStore } from '@/stores/composer-store'
import { useOnboardInviteStore } from '@/stores/onboard-invite-store'
import { OnboardToInvite } from './onboard-to-invite'

const invite = { id: '7', title: 'Neon Nights' }

describe('OnboardToInvite', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn()
    useComposerStore.getState().reset()
    useOnboardInviteStore.getState().reset()
  })

  it('leaves the omnibar closed for ordinary visits', () => {
    render(<OnboardToInvite invite={invite} />)
    expect(useComposerStore.getState().isOpen).toBe(false)
  })

  it('opens the omnibar for the invite once onboarding returned here, then clears the flag', () => {
    render(<OnboardToInvite invite={invite} />)
    act(() => {
      useOnboardInviteStore.getState().start({ ...invite, slug: 'neon-nights' })
      useOnboardInviteStore.getState().complete()
    })
    expect(useComposerStore.getState()).toMatchObject({ isOpen: true, artistInvite: invite })
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0 })
    expect(useOnboardInviteStore.getState().isCompleting).toBe(false)
  })

  it('opens it when the page mounts after onboarding already finished', () => {
    useOnboardInviteStore.getState().start({ ...invite, slug: 'neon-nights' })
    useOnboardInviteStore.getState().complete()
    render(<OnboardToInvite invite={invite} />)
    expect(useComposerStore.getState().isOpen).toBe(true)
  })
})
