'use client'

import { useOptimistic, useTransition } from 'react'
import { savePreference } from '@/actions/profile-actions'
import { TreeSection } from '@/components/settings/tree-section'
import type { PreferenceSection } from '@/services/settings'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'
import treeStyles from './settings-tree.module.css'

interface PreferenceTogglesProps {
  sections: PreferenceSection[]
}

type Values = Record<string, boolean>

interface ToggleProps {
  id: string
  checked: boolean
  disabled: boolean
  onChange: (next: boolean) => void
}

/** The original's `ToggleControl`: a 60x30 pill that reads Yes / No. */
const Toggle = ({ id, checked, disabled, onChange }: ToggleProps) => (
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

export const PreferenceToggles = ({ sections }: PreferenceTogglesProps) => {
  const initial: Values = Object.fromEntries(sections.flatMap((s) => s.items.map((i) => [i.key, i.value])))
  const [values, setOptimistic] = useOptimistic<Values, { key: string; value: boolean }>(
    initial,
    (state, { key, value }) => ({ ...state, [key]: value }),
  )
  const [, startTransition] = useTransition()

  const toggle = (key: string, value: boolean): void => {
    startTransition(async () => {
      setOptimistic({ key, value })
      const result = await savePreference(key, value)
      if (!result.ok) toast.error(result.error)
    })
  }

  return (
    <>
      {sections.map((section) => (
        <TreeSection key={section.label} title={section.label}>
          {section.items.map((item) => {
            const id = `pref-${item.key}`
            // The original disables sharing while the profile is private.
            const disabled = item.key === 'has_sharing_enabled' && values.is_public === false
            return (
              <div key={item.key} className={cn('Preference', treeStyles.preference)}>
                <dl>
                  <dt id={`${id}-label`}>{item.label}</dt>
                  <dd id={`${id}-info`}>{item.info}</dd>
                </dl>
                <Toggle id={id} checked={values[item.key] ?? false} disabled={disabled} onChange={(v) => toggle(item.key, v)} />
              </div>
            )
          })}
        </TreeSection>
      ))}
    </>
  )
}
