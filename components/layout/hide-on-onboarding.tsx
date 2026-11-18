'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { isOnboardingPath } from './layout-routes'

/** The original hides the navbar (and footer) in onboarding: `.isOnboardingView ~ .Navbar { display: none }`. */
export const HideOnOnboarding = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  return isOnboardingPath(pathname) ? null : children
}
