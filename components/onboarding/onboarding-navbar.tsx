import type { ComponentProps, ReactNode } from 'react'
import { ElloMark } from '@/components/icons'
import { cn } from '@/utils/cn'
import styles from './onboarding.module.css'

/** The original's `OnboardingNavbar`: the mark with the buttons that move through the steps. */
export const OnboardingNavbar = ({ children }: { children: ReactNode }) => (
  <header className={cn('OnboardingNavbar', styles.navbar)}>
    <ElloMark />
    {children}
  </header>
)

/** The green "next step" button. Put an `OnboardingDone` right after it and it makes room for it. */
export const OnboardingNext = ({ className, ...props }: ComponentProps<'button'>) => (
  <button className={cn(styles.next, className)} {...props} />
)

export const OnboardingDone = ({ className, ...props }: ComponentProps<'button'>) => (
  <button className={cn(styles.done, className)} {...props}>
    I&apos;m Done
  </button>
)
