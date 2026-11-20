import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { AppShell } from '@/components/layout/app-shell'
import { KeyboardShortcuts } from '@/components/layout/keyboard-shortcuts'
import { HideOnOnboarding } from '@/components/layout/hide-on-onboarding'
import { RegistrationDialogProvider } from '@/components/auth/registration-dialog'
import { Footer } from '@/components/layout/footer'
import { MainView } from '@/components/layout/main-view'
import { Navbar } from '@/components/layout/navbar'
import { PendingMain } from '@/components/layout/pending-main'
import { Providers } from '@/components/providers'
import { StaffProvider } from '@/components/ui/staff-context'
import { API_ORIGIN } from '@/lib/env'
import { getCategories, getPageHeader } from '@/services/content'
import { getSession } from '@/lib/session'
import { getViewer } from '@/services/viewer'

export const metadata: Metadata = {
  title: { default: 'Ello', template: '%s | Ello' },
  description: 'Ello, running against a local mock API.',
}

// The original's viewport meta (it also disables pinch zoom).
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

const RootLayout = async ({ children }: { children: ReactNode }) => {
  // The navbar's categories load alongside the viewer instead of after it (getCategories is cached per request).
  void getCategories().catch(() => null)
  // The sign-up dialog's photo (the original loads AUTHENTICATION headers for logged out visitors), asked for at
  // once when there is no session, and after the profile only when a session turns out to be expired.
  const loadPromo = () => getPageHeader('AUTHENTICATION').catch(() => null)
  const session = await getSession()
  const [viewer, earlyPromo] = await Promise.all([getViewer(), session ? null : loadPromo()])
  const authPromo = viewer ? null : (earlyPromo ?? (session ? await loadPromo() : null))
  return (
    <html lang="en">
      <body>
        <Providers>
          <RegistrationDialogProvider header={authPromo}>
            <StaffProvider isStaff={!!viewer?.isStaff}>
              <AppShell isLoggedIn={!!viewer}>
                <HideOnOnboarding>
                  <Navbar viewer={viewer} />
                </HideOnOnboarding>
                <PendingMain isLoggedIn={!!viewer} assetOrigin={API_ORIGIN} />
                <MainView>{children}</MainView>
                <Footer isLoggedIn={!!viewer} />
                <KeyboardShortcuts isLoggedIn={!!viewer} />
              </AppShell>
            </StaffProvider>
          </RegistrationDialogProvider>
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
