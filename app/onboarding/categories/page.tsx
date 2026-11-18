import type { Metadata } from 'next'
import { CategoriesStep } from '@/components/onboarding/categories-step'
import { requireSession } from '@/lib/require-session'
import { getOnboardingCategories } from '@/services/onboarding'

export const metadata: Metadata = { title: 'Welcome' }

const CategoriesPage = async () => {
  await requireSession('/onboarding/categories')
  return <CategoriesStep categories={await getOnboardingCategories()} />
}

export default CategoriesPage
