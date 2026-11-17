import { ElloImage } from '@/components/ui/ello-image'
import type { Asset, Region } from '@/types/post'
import { responsiveVersion } from '@/utils/images'

interface PostBodyProps {
  regions: Region[]
  assets?: Asset[]
  /** Use 'eager' for above-the-fold posts so the browser fetches their images first. */
  loading?: 'eager' | 'lazy'
}

const DEFAULT_SIZE = { width: 1200, height: 800 }

/** Renders post content blocks. Text HTML is already sanitized by the data layer. */
export const PostBody = ({ regions, assets = [], loading = 'lazy' }: PostBodyProps) => (
  <div className="flex flex-col gap-3">
    {regions.map((region, index) => {
      if (region.kind === 'text') {
        return <div key={index} className="rich-text" dangerouslySetInnerHTML={{ __html: region.data }} />
      }
      if (region.kind === 'image') {
        const assetId = region.links?.assets
        const asset = assets.find((a) => a.id === assetId)
        const version = responsiveVersion(asset?.attachment)
        const src = version?.url ?? region.data.url
        if (!src) return null
        const width = version?.metadata?.width ?? DEFAULT_SIZE.width
        const height = version?.metadata?.height ?? DEFAULT_SIZE.height
        return (
          <ElloImage
            key={index}
            src={src}
            alt={region.data.alt ?? ''}
            width={width}
            height={height}
            loading={loading}
            className="h-auto w-full"
          />
        )
      }
      return null
    })}
  </div>
)
