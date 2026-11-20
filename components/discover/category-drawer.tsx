'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useCategoryDrawerStore } from '@/stores/category-drawer-store'

interface CategoryDrawer {
  /** The info panel is showing (`selectIsCategoryDrawerOpen`). Always false outside a category page. */
  isOpen: boolean
  /** A brand's category keeps its panel open: there is nothing to close (`!brandAccountId`). */
  isCloseable: boolean
  toggle: () => void
}

const CLOSED: CategoryDrawer = { isOpen: false, isCloseable: true, toggle: () => undefined }

const CategoryDrawerContext = createContext<CategoryDrawer>(CLOSED)

/** The info panel's state on a category page; the hero, the panel and the post columns all follow it. */
export const useCategoryDrawer = (): CategoryDrawer => useContext(CategoryDrawerContext)

interface ProviderProps {
  isCloseable: boolean
  children: ReactNode
}

/** Wraps a category page. Other pages have no provider, so the panel counts as closed there. */
export const CategoryDrawerProvider = ({ isCloseable, children }: ProviderProps) => {
  const isOpenBase = useCategoryDrawerStore((state) => state.isOpen)
  const setOpen = useCategoryDrawerStore((state) => state.setOpen)
  const value = useMemo<CategoryDrawer>(
    () => ({ isOpen: isOpenBase || !isCloseable, isCloseable, toggle: () => setOpen(!isOpenBase) }),
    [isOpenBase, isCloseable, setOpen],
  )
  return <CategoryDrawerContext.Provider value={value}>{children}</CategoryDrawerContext.Provider>
}
