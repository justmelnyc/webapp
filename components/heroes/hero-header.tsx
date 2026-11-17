import { BackgroundImage } from '@/components/heroes/background-image'
import { HeroCredits, heroCreditsEditorial } from '@/components/heroes/hero-credits'
import type { PageHeader } from '@/types/content'
import { cleanHtml } from '@/utils/sanitize'
import { responsiveUrl } from '@/utils/images'

/**
 * Port of HeroRenderables.js `HeroHeader`, the home page (`.Editorial`) hero: a 430px image
 * (600px from 85em) with the heading and sub-heading over it and a "Posted by" credit.
 */
export const HeroHeader = ({ header }: { header: PageHeader }) => (
  <div className="HeroHeader relative mx-auto h-[430px] w-full max-bp2:[.isLoggedOut_&]:mt-20 max-w-view px-0 text-white bp2:px-20 bp4:mb-20 bp4:h-[600px] bp4:px-40">
    <div className="relative flex h-[430px] items-center justify-center bp4:h-[600px]">
      <BackgroundImage src={responsiveUrl(header.image)} overlay={4} />
    </div>
    <div className="absolute top-80 left-0 w-full px-20 bp2:top-40 bp2:px-60 bp3:top-1/2 bp3:-translate-y-1/2 bp3:px-80 bp4:px-100">
      <h1 className="font-black text-38 leading-[38px] bp2:text-[60px] bp2:leading-[60px] bp3:text-[90px] bp3:leading-[90px]">
        {header.header}
      </h1>
      <p
        className="m-0 font-sans text-18 leading-[24px] bp2:text-24 bp2:leading-[30px]"
        dangerouslySetInnerHTML={{ __html: cleanHtml(header.subheader ?? '') }}
      />
    </div>
    {header.user && <HeroCredits user={header.user} label="Posted by" className={heroCreditsEditorial} />}
  </div>
)
