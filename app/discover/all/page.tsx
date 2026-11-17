import type { Metadata } from 'next'
import Link from 'next/link'
import { ElloImage } from '@/components/ui/ello-image'
import { getCategories } from '@/services/content'
import { responsiveUrl } from '@/utils/images'

export const metadata: Metadata = { title: 'All categories' }

const AllCategoriesPage = async () => {
  const categories = await getCategories()
  return (
    <section className="grid grid-cols-2 gap-5 md:grid-cols-4">
      {categories.map((category) => {
        const image = responsiveUrl(category.tileImage)
        return (
          <Link
            key={category.id}
            href={`/discover/${category.slug}`}
            className="group bg-ink relative flex aspect-square items-end overflow-hidden p-5 text-white"
          >
            {image && <ElloImage src={image} width={300} height={300} className="absolute inset-0 size-full object-cover opacity-60 transition-opacity group-hover:opacity-80" />}
            <span className="relative text-2xl font-light">{category.name}</span>
          </Link>
        )
      })}
    </section>
  )
}

export default AllCategoriesPage
