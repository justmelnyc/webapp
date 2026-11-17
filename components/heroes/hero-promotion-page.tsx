import Link from 'next/link'
import { BackgroundImage } from '@/components/heroes/background-image'
import { HeroCredits } from '@/components/heroes/hero-credits'
import type { PageHeader } from '@/types/content'
import { responsiveUrl } from '@/utils/images'

const Cta = ({ caption, href }: { caption: string; href: string }) => {
  const label = <span className="[border-bottom:1px_solid]">{caption}</span>
  if (href.startsWith('/')) {
    return (
      <Link href={href} className="leading-[1.3]">
        {label}
      </Link>
    )
  }
  return (
    <a href={href} className="leading-[1.3]" rel="noopener noreferrer" target="_blank">
      {label}
    </a>
  )
}

/** Port of `HeroPromotionPage` (page header kind GENERIC): the Discover hero. */
export const HeroPromotionPage = ({ header }: { header: PageHeader }) => {
  const { ctaLink } = header
  return (
    <div className="relative flex min-h-[240px] w-full overflow-hidden text-white bp2:min-h-[380px] bp2:items-center">
      <BackgroundImage src={responsiveUrl(header.image)} overlay={4} />
      <div className="relative mx-10 py-20 text-14 bp2:mx-20 bp4:mx-40 bp4:pr-40">
        <h1 className="text-18 bp2:text-48">{header.header}</h1>
        <h2 className="text-14 bp2:text-28">{header.subheader}</h2>
        {ctaLink?.text && ctaLink.url ? <Cta caption={ctaLink.text} href={ctaLink.url} /> : <span className="leading-[1.3]" />}
      </div>
      {header.user && <HeroCredits user={header.user} />}
    </div>
  )
}
