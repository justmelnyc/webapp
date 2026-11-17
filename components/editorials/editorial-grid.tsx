import Link from 'next/link'
import { ElloImage } from '@/components/ui/ello-image'
import type { Editorial } from '@/types/content'
import { cn } from '@/utils/cn'
import { responsiveUrl } from '@/utils/images'

const Tile = ({ editorial, wide, first }: { editorial: Editorial; wide: boolean; first: boolean }) => {
  const image = responsiveUrl(wide ? editorial.twoByOneImage : editorial.oneByOneImage)
  const href = editorial.path ?? editorial.url ?? '#'
  return (
    <Link
      href={href}
      className={cn('group relative flex min-h-72 items-start overflow-hidden bg-ink p-8 text-white', wide && 'md:col-span-2')}
    >
      {image && (
        <ElloImage src={image} width={800} height={wide ? 400 : 800} priority={first} className="absolute inset-0 size-full object-cover opacity-70 transition-opacity group-hover:opacity-90" />
      )}
      <div className="relative">
        <h2 className="text-4xl font-light">{editorial.title}</h2>
        {editorial.subtitle && <p className="mt-2 text-sm">{editorial.subtitle}</p>}
      </div>
    </Link>
  )
}

/** Wide tiles on a repeating rhythm: wide, square, square, wide, ... */
export const EditorialGrid = ({ editorials }: { editorials: Editorial[] }) => (
  <section className="grid gap-5 md:grid-cols-3">
    {editorials.map((editorial, index) => (
      <Tile key={editorial.id} editorial={editorial} wide={index % 3 === 0} first={index < 3} />
    ))}
  </section>
)
