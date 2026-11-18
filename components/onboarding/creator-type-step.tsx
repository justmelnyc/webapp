'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { completeCreatorTypeStep } from '@/actions/onboarding-actions'
import { saveCreatorTypes } from '@/actions/profile-actions'
import { ONBOARDING_ROUTES } from '@/constants/onboarding'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { toast } from '@/stores/toast-store'
import type { CreatorTypes } from '@/services/settings'
import { cn } from '@/utils/cn'
import styles from './creator-type.module.css'
import { OnboardingNavbar, OnboardingNext } from './onboarding-navbar'

/** The original's CreatorTypeContainer saves a second after the last click. */
const SAVE_DELAY = 1000

const toggleId = (ids: number[], id: number): number[] =>
  ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id]

/** `/onboarding/creator-type`: "I am here as" An Artist / A Fan, then the categories an artist makes. */
export const CreatorTypeStep = ({ categories, selectedIds }: CreatorTypes) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [ids, setIds] = useState(selectedIds)
  // Unlike in settings, neither is picked until someone clicks.
  const [artist, setArtist] = useState(selectedIds.length > 0)
  const [fan, setFan] = useState(false)
  const save = useDebouncedCallback((next: number[]): void => {
    void saveCreatorTypes(next).then((result) => {
      if (!result.ok) toast.error(result.error)
    })
  }, SAVE_DELAY)

  const pickFan = (): void => {
    setArtist(false)
    setFan(true)
    setIds([])
    save([])
  }

  const pickCategory = (id: number): void => {
    const next = toggleId(ids, id)
    setIds(next)
    save(next)
  }

  const next = (): void => {
    startTransition(async () => {
      const result = await completeCreatorTypeStep()
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      router.push(ONBOARDING_ROUTES.categories)
    })
  }

  return (
    <div className={styles.container}>
      <div className={cn('inOnboarding', styles.box)}>
        <h2 className={styles.heading}>I am here as:</h2>
        <div>
          <button
            type="button"
            className={cn(styles.button, artist && styles.active)}
            disabled={artist}
            onClick={() => {
              setArtist(true)
              setFan(false)
            }}
          >
            An Artist
          </button>
          <button type="button" className={cn(styles.button, fan && styles.active)} disabled={fan} onClick={pickFan}>
            A Fan
          </button>
        </div>
        {artist ? (
          <div>
            <h2 className={cn(styles.heading, styles.categoriesHeading)}>I make:</h2>
            <div className={styles.categories}>
              {categories.map((category) => {
                const active = ids.includes(category.id)
                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-pressed={active}
                    className={cn(styles.button, styles.category, active && styles.active)}
                    onClick={() => pickCategory(category.id)}
                  >
                    {category.name}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
      <OnboardingNavbar>
        <OnboardingNext disabled={pending} onClick={next}>
          Create Account
        </OnboardingNext>
      </OnboardingNavbar>
    </div>
  )
}
