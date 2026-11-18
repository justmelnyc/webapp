import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

/**
 * The original's `main.MainView`: a plain white block. It has NO padding of its own; every page
 * view offsets itself below the fixed 80px navbar (heroes use padding-top 80/85, see
 * HeroRenderables.js). Pass extra classes (e.g. `Discover`) through `className`.
 */
export const MainView = ({ children, className }: { children: ReactNode; className?: string }) => (
  <main className={cn(className, 'MainView bg-white')}>
    {children}
  </main>
)
