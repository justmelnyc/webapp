'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ElloBuyButton, hasBuyLink } from '@/components/posts/ello-buy-button'
import { EMBED_FALLBACK_THUMBNAIL } from '@/components/posts/embed-fallback'
import { embedPlayerSrc } from '@/utils/embed-services'
import './embetter.css'

interface EmbedRegionProps {
  service: string
  id: string
  url: string
  thumbnailLargeUrl: string
  /** Grid mode links the thumbnail to the post; the detail page links to the embedded url. */
  detailPath?: string
  linkUrl?: string | null
}

/**
 * The original's EmbedRegion plus what `embetter` made of it: a thumbnail with a play button that swaps
 * in the service's player iframe.
 */
export const EmbedRegion = ({
  service,
  id,
  url,
  thumbnailLargeUrl,
  detailPath,
  linkUrl,
}: EmbedRegionProps) => {
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  // embetter: a broken image still under 50px tall after 4 seconds gets the fallback too.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (imageRef.current && imageRef.current.height < 50) setFailed(true)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])
  const src = playing ? embedPlayerSrc(service, id, true) : null
  const thumbnail = (
    // eslint-disable-next-line @next/next/no-img-element -- the original's plain thumbnail; embetter sizes it
    <img
      ref={imageRef}
      src={failed ? EMBED_FALLBACK_THUMBNAIL : thumbnailLargeUrl}
      alt={service}
      onError={() => setFailed(true)}
    />
  )
  return (
    <div className={`EmbedRegion ${service}`}>
      <div
        className={playing ? 'embetter embetter-ready embetter-playing' : 'embetter embetter-ready'}
        {...{ [`data-${service}-id`]: id }}
      >
        {detailPath ? (
          <Link className="EmbedRegionContent" href={detailPath}>
            {thumbnail}
          </Link>
        ) : (
          <a className="EmbedRegionContent" href={url}>
            {thumbnail}
          </a>
        )}
        {hasBuyLink(linkUrl) ? <ElloBuyButton to={linkUrl} /> : null}
        <div className="embetter-loading" />
        <div
          className="embetter-play-button"
          onClick={() => setPlaying(true)}
          role="presentation"
        />
        {src ? (
          <iframe
            className="video"
            src={src}
            title={service}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : null}
      </div>
    </div>
  )
}
