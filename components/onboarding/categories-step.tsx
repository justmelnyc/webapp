'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { followCategories } from '@/actions/onboarding-actions'
import { CheckIconSM } from '@/components/icons'
import { CATEGORIES_NEEDED, ONBOARDING_ROUTES } from '@/constants/onboarding'
import type { OnboardingCategory } from '@/services/onboarding'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'
import styles from './categories.module.css'
import { OnboardingNavbar, OnboardingNext } from './onboarding-navbar'
import { OnboardingTitle, OnboardingView } from './onboarding-view'

interface CategoryButtonProps {
  category: OnboardingCategory
  active: boolean
  onToggle: () => void
}

/** The original's `CategoryButton`: a tile that toggles on click and shows a check when picked. */
const CategoryButton = ({ category, active, onToggle }: CategoryButtonProps) => (
  <button
    type="button"
    aria-pressed={active}
    className={cn(styles.button, active && ['isActive', styles.active])}
    style={category.imageUrl ? { backgroundImage: `url("${category.imageUrl}")` } : undefined}
    onClick={onToggle}
  >
    <span className={styles.text}>
      {active ? <CheckIconSM /> : null}
      {category.name}
    </span>
  </button>
)

/** `/onboarding/categories`: pick what you are into; the next button counts down how many are still needed. */
export const CategoriesStep = ({ categories }: { categories: OnboardingCategory[] }) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [ids, setIds] = useState<string[]>([])
  const missing = CATEGORIES_NEEDED - ids.length

  const toggle = (id: string): void =>
    setIds((current) => (current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id]))

  const next = (): void => {
    startTransition(async () => {
      const result = await followCategories(ids.map(Number))
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      router.push(ONBOARDING_ROUTES.settings)
    })
  }

  return (
    <OnboardingView className="OnboardingCategories">
      <OnboardingTitle text1="Pick what you're into. " text2="Slow down & check out some cool ass shit." />
      <section className="StreamContainer">
        <div className={styles.categories}>
          {categories.map((category) => (
            <CategoryButton key={category.id} category={category} active={ids.includes(category.id)} onToggle={() => toggle(category.id)} />
          ))}
        </div>
      </section>
      <OnboardingNavbar>
        <OnboardingNext disabled={missing > 0 || pending} onClick={next}>
          {missing > 0 ? `Pick ${missing}` : 'Create Your Profile'}
        </OnboardingNext>
      </OnboardingNavbar>
    </OnboardingView>
  )
}
