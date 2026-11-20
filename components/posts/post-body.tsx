import type { ReactNode } from 'react'
import { EmbedRegion } from '@/components/posts/embed-region'
import { embedFields } from '@/components/posts/embed-fields'
import { ContentWarningButton } from '@/components/posts/content-warning-button'
import { HotTextRegion } from '@/components/posts/hot-text-region'
import { ImageRegionView, type RegionOwner } from '@/components/posts/image-region'
import type { Asset, Region } from '@/types/post'
import './post-body.css'

interface PostBodyProps {
  /** The post (or comment) the regions belong to: lets its pictures open the lightbox around them. */
  postId?: string
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

interface BodyRegionsProps {
  postId?: string
  regions: Region[]
  assets?: Asset[]
  loading?: 'eager' | 'lazy'
  detailPath?: string
  /** 'comment' for a comment's regions (the original's `isComment`): no buy button, stills on a post page. */
  owner?: RegionOwner
}

/** The original's `RegionItems`: just the region blocks, without the `PostBody` wrapper. */
export const PostBodyRegions = ({
  postId,
  regions,
  assets = [],
  loading = 'lazy',
  detailPath,
  owner = 'post',
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
          <ImageRegionView
            key={index}
            postId={postId}
            region={region}
            assets={assets}
            loading={loading}
            detailPath={detailPath}
            owner={owner}
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
          />
        )
      }
      return null
    })}
  </div>
)

/** Renders post content blocks. Text HTML is already sanitized by the data layer. */
export const PostBody = ({
  postId,
  regions,
  assets = [],
  loading = 'lazy',
  detailPath,
  contentWarning,
  children,
}: PostBodyProps) => (
  <div className="PostBody">
    {contentWarning ? <ContentWarningButton contentWarning={contentWarning} /> : null}
    <PostBodyRegions postId={postId} regions={regions} assets={assets} loading={loading} detailPath={detailPath} />
    {children}
  </div>
)
