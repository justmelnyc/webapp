import { assetIdOf } from '@/components/lightbox/lightbox-queue'
import { LightboxRegion, LightboxTriggerButton } from '@/components/lightbox/lightbox-triggers'
import { ElloBuyButton, hasBuyLink } from '@/components/posts/ello-buy-button'
import { EmbedRegion } from '@/components/posts/embed-region'
import { embedFields } from '@/components/posts/embed-fields'
import { Avatar } from '@/components/ui/avatar'
import type { Asset, Post, Region } from '@/types/post'
import { altOf } from '@/utils/image-region'
import { avatarUrl } from '@/utils/images'
import type { ResponsiveImage } from '@/types/image'
import '@/components/posts/repost-body.css'
import styles from './post-detail.module.css'

interface DetailBodyProps {
  postId: string
  /** What the post shows: its own content, or on a repost the original's (`repostContent`). */
  regions: Region[]
  assets: Asset[]
  /** Reposts only: what the reposter added, shown under the original with their avatar. */
  repostAuthor?: Post['author']
  repostRegions?: Region[]
}

/** Candidates in the original's `srcset` order and descriptors (no `sizes`, like the original). */
const srcSetOf = (image: ResponsiveImage): string =>
  (
    [
      ['mdpi', 180],
      ['hdpi', 750],
      ['xhdpi', 1500],
      ['optimized', 1920],
    ] as const
  )
    .flatMap(([key, width]) => {
      const url = image[key]?.url
      return url ? [`${url} ${width}w`] : []
    })
    .join(', ')

interface DetailRegionsProps {
  postId: string
  regions: Region[]
  assets: Asset[]
}

/** The original's `RegionItems` for post detail: text regions and static image regions. */
const DetailRegions = ({ postId, regions, assets }: DetailRegionsProps) => (
  <div>
    {regions.map((region, index) => {
      if (region.kind === 'text') {
        return (
          <div key={index} className="TextRegion">
            <div className="RegionContent" dangerouslySetInnerHTML={{ __html: region.data }} />
          </div>
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
          />
        )
      }
      if (region.kind !== 'image') return null
      const assetId = assetIdOf(region)
      const attachment = assets.find((asset) => asset.id === assetId)?.attachment
      const src = attachment?.hdpi?.url ?? region.data.url
      if (!src) return null
      const holder = (
        <div className="ImgHolder">
          {/* eslint-disable-next-line @next/next/no-img-element -- srcset without sizes mirrors the original's rendering; like the original no empty alt, so a picture that fails shows the browser's broken-image mark */}
          <img
            id={assetId ? `asset_${assetId}_${postId}` : undefined}
            className="ImageAttachment"
            role="presentation"
            alt={altOf(region.data.alt, attachment) || undefined}
            src={src}
            srcSet={attachment ? srcSetOf(attachment) : undefined}
          />
          {assetId ? <LightboxTriggerButton withBuy={hasBuyLink(region.linkUrl)} /> : null}
          {hasBuyLink(region.linkUrl) ? <ElloBuyButton to={region.linkUrl} /> : null}
        </div>
      )
      return (
        <div key={index} className="ImageRegion">
          {assetId ? (
            <LightboxRegion postId={postId} assetId={assetId} className={styles.imageHolder}>
              {holder}
            </LightboxRegion>
          ) : (
            <div className={styles.imageHolder}>{holder}</div>
          )}
        </div>
      )
    })}
  </div>
)

/** The original's `PostBody` for post detail; a repost adds the reposter's own words below. */
export const DetailBody = ({ postId, regions, assets, repostAuthor, repostRegions }: DetailBodyProps) => (
  <div className={`with-lightbox ${styles.body}`}>
    <div className="PostBody">
      <DetailRegions postId={postId} regions={regions} assets={assets} />
      {repostAuthor && repostRegions && repostRegions.length > 0 ? (
        <div className="PostBody RepostedBody">
          <Avatar
            href={`/${repostAuthor.username}`}
            src={avatarUrl(repostAuthor.avatar, 'regular')}
            name={repostAuthor.username}
          />
          <DetailRegions postId={postId} regions={repostRegions} assets={assets} />
        </div>
      ) : null}
    </div>
  </div>
)
