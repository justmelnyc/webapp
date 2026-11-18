import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import treeStyles from './settings-tree.module.css'

interface ToggleProps {
  id: string
  checked: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
}

/** The original's `ToggleControl`: a 60x30 pill that reads Yes / No. */
const Toggle = ({ id, checked, disabled = false, onChange }: ToggleProps) => (
  <label
    htmlFor={id}
    className={cn(treeStyles.toggle, checked && ['isChecked', treeStyles.toggleChecked])}
    style={disabled ? { opacity: 0.25 } : undefined}
  >
    <input
      id={id}
      type="checkbox"
      role="switch"
      className="sr-only"
      checked={checked}
      disabled={disabled}
      aria-labelledby={`${id}-label`}
      aria-describedby={`${id}-info`}
      onChange={() => onChange(!checked)}
    />
    <span>{checked ? 'Yes' : 'No'}</span>
  </label>
)

interface PreferenceProps extends ToggleProps {
  term: string
  children: ReactNode
}

/** The original's `Preference`: a term and description with its toggle. */
export const Preference = ({ term, children, ...toggle }: PreferenceProps) => (
  <div className={cn('Preference', treeStyles.preference)}>
    <dl>
      <dt id={`${toggle.id}-label`}>{term}</dt>
      <dd id={`${toggle.id}-info`}>{children}</dd>
    </dl>
    <Toggle {...toggle} />
  </div>
)
