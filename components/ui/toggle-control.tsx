import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './toggle-control.module.css'

interface ToggleControlProps {
  id: string
  checked: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
  className?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  /** Drawn before the Yes / No text (onboarding puts a check or an X here). */
  children?: ReactNode
}

/** The original's `ToggleControl`: a pill that reads Yes (green) or No (grey) around a real checkbox. */
export const ToggleControl = ({ id, checked, disabled = false, onChange, className, children, ...aria }: ToggleControlProps) => (
  <label
    htmlFor={id}
    className={cn('ToggleControl', styles.toggle, checked && ['isChecked', styles.checked], disabled && styles.disabled, className)}
  >
    <input id={id} type="checkbox" role="switch" className="sr-only" checked={checked} disabled={disabled} onChange={() => onChange(!checked)} {...aria} />
    {children}
    <span>{checked ? 'Yes' : 'No'}</span>
  </label>
)
