import type { ReactNode } from 'react'
import './post-hints.css'

/**
 * The original's `Hint`: the small black label that fades in above a hovered tool (hover-capable
 * devices only; always visible inside a pill). Its rules are in post-hints.css.
 */
export const Hint = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={className ? `Hint ${className}` : 'Hint'}>{children}</span>
)
