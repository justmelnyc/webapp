import type { Asset, Region } from '@/types/post'
import type { ResponsiveImage } from '@/types/image'
import styles from './post-detail.module.css'

interface DetailBodyProps {
  postId: string
  regions: Region[]
  assets: Asset[]
}

/** Candidates in the original's `srcset` order and descriptors (no `sizes`, like the original). */
const srcSetOf = (image: ResponsiveImage): string =>
  ([['mdpi', 180], ['hdpi', 750], ['xhdpi', 1500], ['optimized', 1920]] as const)
    .flatMap(([key, width]) => {
      const url = image[key]?.url
      return url ? [`${url} ${width}w`] : []
    })
    .join(', ')

/** The original's `PostBody` for post detail: text regions and static image regions. */
export const DetailBody = ({ postId, regions, assets }: DetailBodyProps) => (
  <div className={`with-lightbox ${styles.body}`}>
    <div className="PostBody">
      <div>
        {regions.map((region, index) => {
          if (region.kind === 'text') {
            return (
              <div key={index} className="TextRegion">
                <div className="RegionContent" dangerouslySetInnerHTML={{ __html: region.data }} />
              </div>
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
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  </div>
)
