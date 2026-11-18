import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './onboarding.module.css'

/** The original's `MainView.Onboarding`: the page content plus the offsets `.isOnboardingView` gives the main view. */
export const OnboardingView = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn('Onboarding', className, styles.view)}>{children}</div>
)

/** The original's `Title` (OnboardingParts.js): a black sentence and a grey one. */
export const OnboardingTitle = ({ text1, text2 }: { text1: string; text2: string }) => (
  <h1 className={styles.title}>
    <span>{text1}</span>
    <span>{text2}</span>
  </h1>
)
