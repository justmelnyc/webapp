import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { Providers } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Ello', template: '%s | Ello' },
  description: 'Ello, running against a local mock API.',
}

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body className="font-sans">
      <Providers>
        <Navbar />
        <main className="mx-auto max-w-[120rem] px-5 py-8">{children}</main>
        <Footer />
      </Providers>
    </body>
  </html>
)

export default RootLayout
