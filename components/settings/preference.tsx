import type { ReactNode } from 'react'
import { ToggleControl } from '@/components/ui/toggle-control'
import { cn } from '@/utils/cn'
import treeStyles from './settings-tree.module.css'

interface ToggleProps {
  id: string
  checked: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
}

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
    <ToggleControl
      {...toggle}
      className={treeStyles.toggle}
      aria-labelledby={`${toggle.id}-label`}
      aria-describedby={`${toggle.id}-info`}
    />
  </div>
)
