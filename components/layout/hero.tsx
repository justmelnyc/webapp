import Link from 'next/link'
import { ElloImage } from '@/components/ui/ello-image'
import type { PageHeader } from '@/types/content'
import { responsiveUrl } from '@/utils/images'

export const Hero = ({ header }: { header: PageHeader }) => {
  const image = responsiveUrl(header.image)
  return (
    <section className="relative flex min-h-[26rem] items-end overflow-hidden bg-ink text-white">
      {image && <ElloImage src={image} width={1600} height={800} priority className="absolute inset-0 size-full object-cover opacity-60" />}
      <div className="relative flex w-full flex-col gap-2 p-8 md:p-14">
        <h1 className="max-w-4xl text-5xl leading-tight font-light md:text-7xl">{header.header}</h1>
        {header.subheader && <p className="text-xl">{header.subheader}</p>}
        {header.user && (
          <p className="mt-6 text-sm">
            Posted by{' '}
            <Link href={`/${header.user.username}`} className="underline">
              @{header.user.username}
            </Link>
          </p>
        )}
      </div>
    </section>
  )
}
