import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegistrationDialogProvider } from '@/components/auth/registration-dialog'
import type { PageHeader } from '@/types/content'
import { WatchTool } from './post-tool-actions'

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
}))
jest.mock('@/actions/post-actions', () => ({ setWatching: jest.fn(), setLoved: jest.fn() }))
jest.mock('@/actions/signup-actions', () => ({ checkSignupEmail: jest.fn(), signup: jest.fn() }))
jest.mock('@/actions/account-actions', () => ({ checkAvailability: jest.fn() }))

const promo = {
  id: '1',
  kind: 'AUTHENTICATION',
  image: { hdpi: { url: 'http://x/y.jpg' } },
  user: { id: '1', username: 'ada', avatar: null },
} as unknown as PageHeader

describe('logged-out post tools', () => {
  it('the watch tool opens the sign-up dialog like the original', async () => {
    render(
      <RegistrationDialogProvider header={promo}>
        <WatchTool postId="p1" watching={false} signedIn={false} />
      </RegistrationDialogProvider>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('dialog', { name: 'Sign up' })).toBeInTheDocument()
  })
})
