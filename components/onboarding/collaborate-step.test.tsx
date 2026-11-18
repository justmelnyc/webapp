import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { savePreference } from '@/actions/profile-actions'
import { useToastStore } from '@/stores/toast-store'
import { CollaborateStep } from './collaborate-step'

const push = jest.fn()

jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
jest.mock('@/actions/profile-actions', () => ({ savePreference: jest.fn() }))

const saveMock = jest.mocked(savePreference)
const off = { is_hireable: false, is_collaborateable: false }

describe('CollaborateStep', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useToastStore.setState({ toasts: [] })
  })

  it('shows what the profile has now', () => {
    render(<CollaborateStep initial={{ is_hireable: true, is_collaborateable: false }} />)
    expect(screen.getByRole('switch', { name: 'Get Hired' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Collaborate' })).not.toBeChecked()
  })

  it('saves a toggle as is_hireable / is_collaborateable and flips it', async () => {
    saveMock.mockResolvedValue({ ok: true, data: undefined })
    render(<CollaborateStep initial={off} />)
    await userEvent.click(screen.getByRole('switch', { name: 'Collaborate' }))
    expect(saveMock).toHaveBeenCalledWith('is_collaborateable', true)
    expect(screen.getByRole('switch', { name: 'Collaborate' })).toBeChecked()
    await userEvent.click(screen.getByRole('switch', { name: 'Get Hired' }))
    expect(saveMock).toHaveBeenCalledWith('is_hireable', true)
  })

  it('puts the toggle back and toasts when saving fails', async () => {
    saveMock.mockResolvedValue({ ok: false, error: 'Could not reach the API' })
    render(<CollaborateStep initial={off} />)
    await userEvent.click(screen.getByRole('switch', { name: 'Get Hired' }))
    await waitFor(() => expect(screen.getByRole('switch', { name: 'Get Hired' })).not.toBeChecked())
    expect(useToastStore.getState().toasts[0]?.message).toBe('Could not reach the API')
  })

  it('finishes onboarding on the following feed', async () => {
    render(<CollaborateStep initial={off} />)
    await userEvent.click(screen.getByRole('button', { name: 'Get To The Goods' }))
    expect(push).toHaveBeenCalledWith('/following')
  })
})
