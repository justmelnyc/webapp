import { ElloBuyButton, hasBuyLink } from '@/components/posts/ello-buy-button'
import { EmbedRegion } from '@/components/posts/embed-region'
import { embedFields } from '@/components/posts/embed-fields'
import { Avatar } from '@/components/ui/avatar'
import type { Asset, Post, Region } from '@/types/post'
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
            linkUrl={region.linkUrl}
          />
        )
      }
      if (region.kind !== 'image') return null
      const assetId = region.links?.assets
      const attachment = assets.find((asset) => asset.id === assetId)?.attachment
      const src = attachment?.hdpi?.url ?? region.data.url
      if (!src) return null
      return (
        <div key={index} className="ImageRegion">
          <div className={styles.imageHolder}>
            <div className="ImgHolder">
              {/* eslint-disable-next-line @next/next/no-img-element -- srcset without sizes mirrors the original's rendering */}
              <img
                id={assetId ? `asset_${assetId}_${postId}` : undefined}
                className="ImageAttachment"
                role="presentation"
                alt=""
                src={src}
                srcSet={attachment ? srcSetOf(attachment) : undefined}
              />
              {hasBuyLink(region.linkUrl) ? <ElloBuyButton to={region.linkUrl} /> : null}
            </div>
          </div>
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
