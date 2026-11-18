import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { ElloBuyButton, hasBuyLink } from '@/components/posts/ello-buy-button'
import { timeAgoInWords } from '@/components/posts/time-ago-in-words'
import { Avatar } from '@/components/ui/avatar'
import type { Asset, Region } from '@/types/post'
import type { SummaryRegion } from './notification-parts'
import type { Author } from '@/types/user'
import { cn } from '@/utils/cn'
import { avatarUrl } from '@/utils/images'
import '@/components/posts/post-body.css'
import './notifications.css'

const Root = ({ className, hasAsset, ...props }: ComponentProps<'div'> & { hasAsset?: boolean }) => (
  <div className={cn('Notification', className, hasAsset && 'hasAsset')} {...props} />
)

const Header = ({ notifier }: { notifier: Author }) => (
  <header>
    <Avatar href={`/${notifier.username}`} src={avatarUrl(notifier.avatar, 'regular')} name={notifier.username} size={30} />
  </header>
)

/** The first image of the summary, floated right at 80px. */
const AssetThumb = ({ region, assets, href }: { region: Region; assets: Asset[]; href: string }) => {
  if (region.kind !== 'image') return null
  const attachment = assets.find((asset) => asset.id === region.links?.assets)?.attachment
  const src = attachment?.hdpi?.url ?? attachment?.optimized?.url ?? region.data.url
  if (!src) return null
  return (
    <div className="NotificationAsset">
      <div className="ImageRegion">
        <div className="RegionContent">
          <Link href={href}>
            {/* eslint-disable-next-line @next/next/no-img-element -- the original's plain 80px thumbnail */}
            <img className="ImageAttachment" role="presentation" alt="" src={src} />
          </Link>
          {hasBuyLink(region.linkUrl) ? <ElloBuyButton to={region.linkUrl} /> : null}
        </div>
      </div>
    </div>
  )
}

interface BodyProps {
  children: ReactNode
  /** Text regions of the summary (shown under the sentence). */
  texts?: SummaryRegion[]
  /** Free-form text under the sentence, for kinds that have no post to quote. */
  extra?: ReactNode
}

const Body = ({ children, texts = [], extra }: BodyProps) => (
  <div className="NotificationBody">
    {children}
    {(texts.length > 0 || extra) && (
      <div className="NotificationTexts">
        {extra}
        {texts.map((region, index) =>
          region.kind === 'text' ? (
            <div key={index} className="TextRegion">
              <div className="RegionContent" dangerouslySetInnerHTML={{ __html: region.data }} />
            </div>
          ) : (
            <hr key={index} style={{ margin: '0.375rem', border: 0 }} />
          ),
        )}
      </div>
    )}
  </div>
)

const Footer = ({ href, createdAt }: { href: string; createdAt: string }) => (
  <footer>
    <Link href={href}>{timeAgoInWords(createdAt)}</Link>
  </footer>
)

/** <Notification><Notification.Header/><Notification.Asset/><Notification.Body/><Notification.Footer/></Notification> */
export const Notification = Object.assign(Root, { Header, Asset: AssetThumb, Body, Footer })
