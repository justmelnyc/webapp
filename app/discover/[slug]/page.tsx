import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ServerStream } from '@/components/streams/server-stream'
import { getCategories } from '@/services/content'

interface Props {
  params: Promise<{ slug: string }>
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params
  const category = (await getCategories()).find((c) => c.slug === slug)
  return { title: category?.name ?? 'Discover' }
}

const CategoryPage = async ({ params }: Props) => {
  const { slug } = await params
  const category = (await getCategories()).find((c) => c.slug === slug)
  if (!category) notFound()
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-light">{category.name}</h1>
        {category.description && <p className="text-slate mt-1">{category.description}</p>}
      </div>
      <ServerStream spec={{ type: 'category', slug, kind: 'RECENT' }} emptyMessage="No posts in this category yet." />
    </div>
  )
}

export default CategoryPage
