import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { AppShell } from '@/components/layout/app-shell'
import { HideOnOnboarding } from '@/components/layout/hide-on-onboarding'
import { Footer } from '@/components/layout/footer'
import { MainView } from '@/components/layout/main-view'
import { Navbar } from '@/components/layout/navbar'
import { Providers } from '@/components/providers'
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
  const viewer = await getViewer()
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell isLoggedIn={!!viewer}>
            <HideOnOnboarding>
              <Navbar viewer={viewer} />
            </HideOnOnboarding>
            <MainView>{children}</MainView>
            <Footer isLoggedIn={!!viewer} />
          </AppShell>
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
