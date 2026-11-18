import Link from 'next/link'
import type { ReactNode } from 'react'
import { LightBoxTrigger } from '@/components/icons'
import { EmbedRegion } from '@/components/posts/embed-region'
import { embedFields } from '@/components/posts/embed-fields'
import { ElloBuyButton, hasBuyLink } from '@/components/posts/ello-buy-button'
import { ContentWarningButton } from '@/components/posts/content-warning-button'
import { HotTextRegion } from '@/components/posts/hot-text-region'
import { ElloImage } from '@/components/ui/ello-image'
import type { ImageVersion } from '@/types/image'
import type { Asset, ImageRegion, Region } from '@/types/post'
import './post-body.css'

interface PostBodyProps {
  regions: Region[]
  assets?: Asset[]
  /** Use 'eager' for above-the-fold posts so the browser fetches their images first. */
  loading?: 'eager' | 'lazy'
  /**
   * Grid mode: link the images and text to this post path (the original's `asGrid` regions, with
   * the lightbox trigger). Omit it for the static regions used on post pages and in comments.
   */
  detailPath?: string
  /** NSFW label: shows the Content Warning button above the regions (streams only, never on a post page). */
  contentWarning?: string | null
  /** Rendered inside the body after the regions (a repost's `RepostedBody`). */
  children?: ReactNode
}

const DEFAULT_SIZE = { width: 1200, height: 800 }

/** The original's list-mode `srcSet` (ImageRegion.getImageSourceSet): its `w` descriptors decide the size. */
const listSrcSet = (asset: Asset | undefined): string | undefined => {
  const attachment = asset?.attachment
  if (!attachment) return undefined
  const candidates: [ImageVersion | null | undefined, string][] = [
    [attachment.mdpi, '180w'],
    [attachment.hdpi, '750w'],
    [attachment.xhdpi, '1500w'],
    [attachment.optimized, '1920w'],
  ]
  const entries = candidates.flatMap(([version, width]) =>
    version?.url ? [`${version.url} ${width}`] : [],
  )
  return entries.length > 0 ? entries.join(', ') : undefined
}

/** Grid streams use the original's `hdpi` rendition; static regions use the best one. */
const pickVersion = (asset: Asset | undefined, preferHdpi: boolean): ImageVersion | null => {
  const attachment = asset?.attachment
  if (!attachment) return null
  const order = preferHdpi
    ? [attachment.hdpi, attachment.optimized, attachment.xhdpi]
    : [attachment.optimized, attachment.xhdpi, attachment.hdpi]
  return [...order, attachment.mdpi, attachment.original].find((version) => !!version?.url) ?? null
}

interface RegionImageProps {
  region: ImageRegion
  assets: Asset[]
  loading: 'eager' | 'lazy'
  detailPath?: string
}

const RegionImage = ({ region, assets, loading, detailPath }: RegionImageProps) => {
  const asset = assets.find((a) => a.id === region.links?.assets)
  const version = pickVersion(asset, !!detailPath)
  const src = version?.url ?? region.data.url
  if (!src) return null
  const buyLink = hasBuyLink(region.linkUrl) ? region.linkUrl : null
  if (!detailPath) {
    return (
      <div className="ImageRegion">
        <div className="StreamImage">
          <div className="ImgHolder">
            {/* eslint-disable-next-line @next/next/no-img-element -- the original's srcset sizing (w descriptors, no sizes) sets the displayed size */}
            <img
              src={src}
              srcSet={listSrcSet(asset)}
              alt={region.data.alt ?? ''}
              role="presentation"
              loading={loading}
              className="ImageAttachment"
            />
            {buyLink ? <ElloBuyButton to={buyLink} /> : null}
          </div>
        </div>
      </div>
    )
  }
  const image = (
    <ElloImage
      src={src}
      alt={region.data.alt ?? ''}
      role="presentation"
      width={version?.metadata?.width ?? DEFAULT_SIZE.width}
      height={version?.metadata?.height ?? DEFAULT_SIZE.height}
      loading={loading}
      className="ImageAttachment"
    />
  )
  return (
    <div className="ImageRegion">
      <div className="RegionContent">
        <Link href={detailPath}>{image}</Link>
        <Link
          href={detailPath}
          className={buyLink ? 'lightbox-trigger with-buy' : 'lightbox-trigger'}
          tabIndex={-1}
        >
          <span className="label">Open Lightbox</span>
          <span className="icon">
            <LightBoxTrigger />
          </span>
        </Link>
        {buyLink ? <ElloBuyButton to={buyLink} /> : null}
      </div>
    </div>
  )
}

interface BodyRegionsProps {
  regions: Region[]
  assets?: Asset[]
  loading?: 'eager' | 'lazy'
  detailPath?: string
}

/** The original's `RegionItems`: just the region blocks, without the `PostBody` wrapper. */
export const PostBodyRegions = ({
  regions,
  assets = [],
  loading = 'lazy',
  detailPath,
}: BodyRegionsProps) => (
  <div>
    {regions.map((region, index) => {
      if (region.kind === 'text') {
        if (detailPath) return <HotTextRegion key={index} html={region.data} path={detailPath} />
        return (
          <div key={index} className="TextRegion">
            <div className="RegionContent" dangerouslySetInnerHTML={{ __html: region.data }} />
          </div>
        )
      }
      if (region.kind === 'image') {
        return (
          <RegionImage
            key={index}
            region={region}
            assets={assets}
            loading={loading}
            detailPath={detailPath}
          />
        )
      }
      if (region.kind === 'embed') {
        const { service, id, url, thumbnailLargeUrl } = embedFields(region.data)
        if (!service || !thumbnailLargeUrl) return null
        return (
          <EmbedRegion
            key={index}
            service={service}
            id={id}
            url={url}
            thumbnailLargeUrl={thumbnailLargeUrl}
            detailPath={detailPath}
            linkUrl={region.linkUrl}
          />
        )
      }
      return null
    })}
  </div>
)

/** Renders post content blocks. Text HTML is already sanitized by the data layer. */
export const PostBody = ({
  regions,
  assets = [],
  loading = 'lazy',
  detailPath,
  contentWarning,
  children,
}: PostBodyProps) => (
  <div className="PostBody">
    {contentWarning ? <ContentWarningButton contentWarning={contentWarning} /> : null}
    <PostBodyRegions regions={regions} assets={assets} loading={loading} detailPath={detailPath} />
    {children}
  </div>
)
