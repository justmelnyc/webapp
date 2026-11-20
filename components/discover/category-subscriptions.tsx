'use client'

import {
  createContext,
  useContext,
  useMemo,
  useOptimistic,
  useTransition,
  type ReactNode,
} from 'react'
import { subscribeToCategories } from '@/actions/category-actions'
import { useRegistrationDialog } from '@/components/auth/registration-dialog'
import { toast } from '@/stores/toast-store'

interface CategorySubscriptions {
  isSubscribed: (categoryId: string) => boolean
  /** Subscribe or unsubscribe; logged-out visitors get the sign-up dialog instead. */
  toggle: (categoryId: string) => void
}

const CategorySubscriptionsContext = createContext<CategorySubscriptions>({
  isSubscribed: () => false,
  toggle: () => undefined,
})

export const useCategorySubscriptions = (): CategorySubscriptions =>
  useContext(CategorySubscriptionsContext)

interface ProviderProps {
  isLoggedIn: boolean
  /** The viewer's `followedCategoryIds`. */
  subscribedIds: string[]
  children: ReactNode
}

/** The viewer's category subscriptions, shared by the subscribe buttons and the hero's check mark. */
export const CategorySubscriptionsProvider = ({
  isLoggedIn,
  subscribedIds,
  children,
}: ProviderProps) => {
  const [ids, setOptimisticIds] = useOptimistic<string[], string[]>(
    subscribedIds,
    (_, next) => next,
  )
  const [, startTransition] = useTransition()
  const registration = useRegistrationDialog()

  const value = useMemo<CategorySubscriptions>(
    () => ({
      isSubscribed: (categoryId) => isLoggedIn && ids.includes(categoryId),
      toggle: (categoryId) => {
        if (!isLoggedIn) return registration.open('subscribe-from-page-header')
        const next = ids.includes(categoryId)
          ? ids.filter((id) => id !== categoryId)
          : [...ids, categoryId]
        startTransition(async () => {
          setOptimisticIds(next)
          const result = await subscribeToCategories(next)
          if (!result.ok) toast.error(result.error)
        })
      },
    }),
    [ids, isLoggedIn, registration, setOptimisticIds],
  )
  return (
    <CategorySubscriptionsContext.Provider value={value}>
      {children}
    </CategorySubscriptionsContext.Provider>
  )
}
