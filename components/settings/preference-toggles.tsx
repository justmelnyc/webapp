'use client'

import { useOptimistic, useTransition } from 'react'
import { savePreference } from '@/actions/profile-actions'
import type { PreferenceSection } from '@/services/settings'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'

interface PreferenceTogglesProps {
  sections: PreferenceSection[]
}

type Values = Record<string, boolean>

interface SwitchProps {
  id: string
  checked: boolean
  onChange: (next: boolean) => void
}

const Switch = ({ id, checked, onChange }: SwitchProps) => (
  <button
    type="button"
    role="switch"
    id={id}
    aria-checked={checked}
    aria-labelledby={`${id}-label`}
    aria-describedby={`${id}-info`}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative h-6 w-11 shrink-0 rounded-full transition-colors',
      checked ? 'bg-ello-green' : 'bg-stone',
    )}
  >
    <span
      className={cn(
        'bg-paper absolute top-0.5 left-0.5 size-5 rounded-full transition-transform',
        checked && 'translate-x-5',
      )}
    />
  </button>
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
    <div className="flex flex-col gap-8">
      {sections.map((section) => (
        <section key={section.label} className="flex flex-col gap-4">
          <h3 className="text-slate text-xs tracking-wide uppercase">{section.label}</h3>
          {section.items.map((item) => (
            <div key={item.key} className="flex items-start justify-between gap-4">
              <div>
                <p id={`pref-${item.key}-label`} className="text-base">{item.label}</p>
                <p id={`pref-${item.key}-info`} className="text-slate text-sm">{item.info}</p>
              </div>
              <Switch id={`pref-${item.key}`} checked={values[item.key] ?? false} onChange={(v) => toggle(item.key, v)} />
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
