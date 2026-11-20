'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { EMBED_FALLBACK_THUMBNAIL } from '@/components/posts/embed-fallback'
import { useMobileAutoEmbed } from '@/components/posts/use-mobile-auto-embed'
import { useEmbedPlayerStore } from '@/stores/embed-player-store'
import { embedPlayerSrc } from '@/utils/embed-services'
import { isPostDetailPath } from '@/components/layout/layout-routes'
import './embetter.css'

interface EmbedRegionProps {
  service: string
  id: string
  url: string
  thumbnailLargeUrl: string
  /** The post the thumbnail links to; on a post page that is the page itself, anywhere else without one the embedded url. */
  detailPath?: string
}

/**
 * The original's EmbedRegion plus what `embetter` made of it: a thumbnail with a play button that swaps
 * in the service's player iframe. One player plays at a time: starting another takes this one down.
 * A buy link on an embed is not drawn: the original tests `region.get('linkUrl').size`, which a string
 * does not have, so its published embeds never had the button (only its editor shows one).
 */
export const EmbedRegion = ({
  service,
  id,
  url,
  thumbnailLargeUrl,
  detailPath,
}: EmbedRegionProps) => {
  const key = useId()
  const playing = useEmbedPlayerStore((state) => state.playingKey === key)
  const play = useEmbedPlayerStore((state) => state.play)
  const stop = useEmbedPlayerStore((state) => state.stop)
  const stopThis = useCallback(() => stop(key), [stop, key])
  useEffect(() => stopThis, [stopThis])
  const playerRef = useRef<HTMLDivElement>(null)
  // codepen is left alone: "we don't know what might execute"
  const inView = useMobileAutoEmbed(playerRef, service !== 'codepen', stopThis)
  const embedded = playing || inView
  // the original links the thumbnail to the post everywhere, on the post's own page too (`detailPath || url`)
  const pathname = usePathname()
  const postPath = detailPath ?? (pathname && isPostDetailPath(pathname) ? pathname : null)
  const [failed, setFailed] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  // embetter: a broken image still under 50px tall after 4 seconds gets the fallback too.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (imageRef.current && imageRef.current.height < 50) setFailed(true)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])
  const src = embedded ? embedPlayerSrc(service, id, playing) : null
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
        ref={playerRef}
        className={embedded ? 'embetter embetter-ready embetter-playing' : 'embetter embetter-ready'}
        {...{ [`data-${service}-id`]: id }}
      >
        {postPath ? (
          <Link className="EmbedRegionContent" href={postPath}>
            {thumbnail}
          </Link>
        ) : (
          <a className="EmbedRegionContent" href={url}>
            {thumbnail}
          </a>
        )}
        <div className="embetter-loading" />
        <div
          className="embetter-play-button"
          onClick={() => play(key)}
          role="presentation"
        />
        {src ? (
          <iframe
            className="video"
            src={src}
            title={service}
            // embetter's markup: without these the browser draws its 2px inset frame and scrollbars
            frameBorder="0"
            scrolling="no"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : null}
      </div>
    </div>
  )
}
