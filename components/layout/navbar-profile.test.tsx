import { render, screen } from '@testing-library/react'
import { AppShell } from './app-shell'
import { NavbarAnalyticsLink, NavbarProfile } from './navbar-profile'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }), usePathname: () => '/' }))
jest.mock('@/actions/auth', () => ({ logout: jest.fn() }))

const labels = (): string[] =>
  [...screen.getByRole('navigation', { name: 'Profile' }).querySelectorAll('a')].map((link) => link.textContent ?? '')

describe('NavbarProfile', () => {
  it('lists the usual links', () => {
    render(
      <AppShell isLoggedIn>
        <NavbarProfile username="ada" avatarSrc={null} helpHref="/wtf" />
      </AppShell>,
    )
    expect(labels()).toEqual(['@ada', 'Invites', 'Loves', 'Giveaways', 'Invite', 'Settings', 'Help'])
  })

  it('puts Analytics after Settings for brands and staff, as a plain link to /manage', () => {
    render(
      <AppShell isLoggedIn>
        <NavbarProfile username="saoirse" avatarSrc={null} helpHref="/wtf">
          <NavbarAnalyticsLink />
        </NavbarProfile>
      </AppShell>,
    )
    expect(labels()).toEqual(['@saoirse', 'Invites', 'Loves', 'Giveaways', 'Invite', 'Settings', 'Analytics', 'Help'])
    expect(screen.getByRole('link', { name: 'Analytics' })).toHaveAttribute('href', '/manage')
  })
})
