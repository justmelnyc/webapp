import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useComposerStore } from '@/stores/composer-store'
import { useOnboardInviteStore } from '@/stores/onboard-invite-store'
import { SubmitButton } from './submit-button'

const open = jest.fn()
jest.mock('@/components/auth/registration-dialog', () => ({ useRegistrationDialog: () => ({ open }) }))

const invite = { id: '1435', title: 'Neon Nights Poster Series', slug: 'neon-nights' }

describe('SubmitButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.scrollTo = jest.fn()
    useComposerStore.getState().reset()
    useOnboardInviteStore.getState().reset()
  })

  it('opens the sign-up dialog for visitors instead of leaving the page', async () => {
    render(<SubmitButton isLoggedIn={false} invite={invite} />)
    await userEvent.click(screen.getByRole('button', { name: 'SUBMIT' }))
    expect(open).toHaveBeenCalledWith('artist-invites')
    expect(useComposerStore.getState().isOpen).toBe(false)
    expect(useOnboardInviteStore.getState().invite).toEqual(invite)
  })

  it('opens the omnibar for the invite when logged in', async () => {
    render(<SubmitButton isLoggedIn invite={invite} />)
    await userEvent.click(screen.getByRole('button', { name: 'SUBMIT' }))
    expect(open).not.toHaveBeenCalled()
    expect(useOnboardInviteStore.getState().invite).toBeNull()
    expect(useComposerStore.getState()).toMatchObject({ isOpen: true, artistInvite: { id: '1435', title: 'Neon Nights Poster Series' } })
  })
})
