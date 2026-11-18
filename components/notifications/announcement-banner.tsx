'use client'

import Link from 'next/link'
import { useEffect, type ReactNode } from 'react'
import { closeAnnouncement } from '@/actions/notification-actions'
import { XIcon } from '@/components/icons'
import { useAnnouncementStore } from '@/stores/announcement-store'
import { cn } from '@/utils/cn'
import { responsiveUrl } from '@/utils/images'
import './announcement.css'

const isInternal = (href: string): boolean => href.startsWith('/')

interface CtaProps {
  href: string | null | undefined
  className?: string
  children: ReactNode
}

/** The original's link: internal paths route in the app, anything else opens in a new tab. */
const Cta = ({ href, className, children }: CtaProps) => {
  if (!href) return <>{children}</>
  if (isInternal(href)) return <Link href={href} className={cn(className, 'js-ANCTA')}>{children}</Link>
  return <a href={href} className={cn(className, 'js-ANCTA')} rel="noopener noreferrer" target="_blank">{children}</a>
}

/**
 * The original's `AnnouncementNotification`: a black banner above the notifications, closable.
 * Showing it counts as seeing it (the red dot on the bolt goes away).
 */
export const AnnouncementBanner = () => {
  const announcement = useAnnouncementStore((state) => state.announcement)
  useEffect(() => {
    // Like the original, only what is already loaded when the notifications open counts as seen.
    const current = useAnnouncementStore.getState().announcement
    if (current) useAnnouncementStore.getState().markSeen(current.id)
  }, [])
  if (!announcement) return null

  const src = responsiveUrl(announcement.image)
  const { header, body, ctaCaption, ctaHref } = announcement
  const onClose = (): void => {
    useAnnouncementStore.getState().dismiss()
    void closeAnnouncement()
  }
  return (
    <div className={cn('AnnouncementNotification', src && 'hasAsset', announcement.isStaffPreview && 'isStaffPreview')}>
      {src ? (
        <Cta href={ctaHref} className="AnnouncementAsset">
          {/* eslint-disable-next-line @next/next/no-img-element -- the original's plain 70px image */}
          <img alt={header || src} src={src} className={ctaHref ? undefined : 'AnnouncementAsset'} />
        </Cta>
      ) : null}
      {header ? <h2 className="AnnouncementTitle">{header}</h2> : null}
      {body ? <div className="AnnouncementBody">{body}</div> : null}
      {ctaHref ? <Cta href={ctaHref} className="AnnouncementCTA">{ctaCaption || 'Learn More'}</Cta> : null}
      <button type="button" className="js-closeAnnouncement" onClick={onClose}>
        <XIcon />
      </button>
    </div>
  )
}
