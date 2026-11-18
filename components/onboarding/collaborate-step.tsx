'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { savePreference } from '@/actions/profile-actions'
import { CheckIcon, XIcon } from '@/components/icons'
import { ONBOARDING_ROUTES } from '@/constants/onboarding'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'
import styles from './collaborate.module.css'
import { OnboardingNavbar, OnboardingNext } from './onboarding-navbar'
import { OnboardingView } from './onboarding-view'

export const COLLABORATE_PREFERENCES = [
  {
    id: 'isHireable',
    key: 'is_hireable',
    term: 'Get Hired',
    desc: 'Enable brands, publications, and people that want to pay you for your work to email you.',
  },
  {
    id: 'isCollaborateable',
    key: 'is_collaborateable',
    term: 'Collaborate',
    desc: 'Enable fellow creators that want to collaborate to email you.',
  },
] as const

type Values = Record<(typeof COLLABORATE_PREFERENCES)[number]['key'], boolean>

interface OnboardingPreferenceProps {
  id: string
  term: string
  checked: boolean
  onChange: (next: boolean) => void
  children: string
}

/** The original's `Preference` + `ToggleControl` as they look in onboarding: a big Yes / No button with an icon. */
const OnboardingPreference = ({ id, term, checked, onChange, children }: OnboardingPreferenceProps) => (
  <div className={cn('Preference OnboardingPreference', styles.preference)}>
    <dl>
      <dt id={`${id}-label`}>{term}</dt>
      <dd>{children}</dd>
    </dl>
    <label htmlFor={id} className={cn(styles.toggle, checked && ['isChecked', styles.checked])}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className="sr-only"
        checked={checked}
        aria-labelledby={`${id}-label`}
        onChange={() => onChange(!checked)}
      />
      <span className={styles.icon} style={{ marginTop: checked ? -4 : -2 }}>
        {checked ? <CheckIcon /> : <XIcon />}
      </span>
      <span>{checked ? 'Yes' : 'No'}</span>
    </label>
  </div>
)

/** `/onboarding/collaborate`: the Get Hired and Collaborate toggles, saved as they change. */
export const CollaborateStep = ({ initial }: { initial: Values }) => {
  const router = useRouter()
  const [values, setValues] = useState(initial)

  const change = (key: keyof Values, value: boolean): void => {
    setValues((current) => ({ ...current, [key]: value }))
    void savePreference(key, value).then((result) => {
      if (result.ok) return
      setValues((current) => ({ ...current, [key]: !value }))
      toast.error(result.error)
    })
  }

  return (
    <OnboardingView className="OnboardingCollaborate">
      <div className={styles.preferences}>
        {COLLABORATE_PREFERENCES.map(({ id, key, term, desc }) => (
          <OnboardingPreference key={id} id={id} term={term} checked={values[key]} onChange={(next) => change(key, next)}>
            {desc}
          </OnboardingPreference>
        ))}
      </div>
      <OnboardingNavbar>
        <OnboardingNext onClick={() => router.push(ONBOARDING_ROUTES.done)}>Get To The Goods</OnboardingNext>
      </OnboardingNavbar>
    </OnboardingView>
  )
}
