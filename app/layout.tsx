import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { AppShell } from '@/components/layout/app-shell'
import { Footer } from '@/components/layout/footer'
import { MainView } from '@/components/layout/main-view'
import { Navbar } from '@/components/layout/navbar'
import { Providers } from '@/components/providers'
import { getViewer } from '@/services/viewer'

export const metadata: Metadata = {
  title: { default: 'Ello', template: '%s | Ello' },
  description: 'Ello, running against a local mock API.',
}

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const viewer = await getViewer()
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell isLoggedIn={!!viewer}>
            <Navbar viewer={viewer} />
            <MainView>{children}</MainView>
            <Footer isLoggedIn={!!viewer} />
          </AppShell>
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
