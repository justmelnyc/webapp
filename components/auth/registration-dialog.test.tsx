import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PageHeader } from '@/types/content'
import { RegistrationDialogProvider, useRegistrationDialog } from './registration-dialog'

let pathname = '/invites/neon-nights'
jest.mock('next/navigation', () => ({ usePathname: () => pathname, useRouter: () => ({ replace: jest.fn(), refresh: jest.fn() }) }))
jest.mock('@/actions/signup-actions', () => ({ checkSignupEmail: jest.fn(), signup: jest.fn() }))
jest.mock('@/actions/account-actions', () => ({ checkAvailability: jest.fn() }))

const header: PageHeader = {
  id: '1',
  kind: 'AUTHENTICATION',
  image: { hdpi: { url: 'http://x/y.jpg' } },
  user: { id: '1', username: 'ada', avatar: null },
} as unknown as PageHeader

const Trigger = () => {
  const { open } = useRegistrationDialog()
  return <button onClick={() => open('follow-button')}>open</button>
}

const setup = (promo: PageHeader | null) =>
  render(
    <RegistrationDialogProvider header={promo}>
      <Trigger />
    </RegistrationDialogProvider>,
  )

describe('RegistrationDialogProvider', () => {
  beforeEach(() => {
    pathname = '/invites/neon-nights'
  })

  it('opens the join form with the promo credits and closes on the X', async () => {
    setup(header)
    await userEvent.click(screen.getByText('open'))
    expect(screen.getByRole('dialog', { name: 'Sign up' })).toBeInTheDocument()
    expect(screen.getByText('Join The Creators Network.')).toBeInTheDocument()
    expect(screen.getByText('@ada')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does nothing without a promo header', async () => {
    setup(null)
    await userEvent.click(screen.getByText('open'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does nothing on the authentication pages', async () => {
    pathname = '/enter'
    setup(header)
    await userEvent.click(screen.getByText('open'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
