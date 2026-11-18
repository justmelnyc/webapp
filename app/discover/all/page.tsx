import type { Metadata } from 'next'
import { CategoryGrid } from '@/components/discover/category-grid'
import { HeroFrame } from '@/components/discover/discover-hero'
import { getCategories } from '@/services/content'
import { getViewer } from '@/services/viewer'

export const metadata: Metadata = { title: 'All categories' }

const AllCategoriesPage = async () => {
  const [categories, viewer] = await Promise.all([getCategories(), getViewer()])
  return (
    <>
      <HeroFrame isDiscover={false} />
      <CategoryGrid categories={categories} isLoggedIn={!!viewer} />
    </>
  )
}

export default AllCategoriesPage
