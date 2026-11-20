'use client'

import type { Size } from './image-scale'
import { LightboxImage, type LightboxSources } from './lightbox-image'
import { assetIdOf, samePair, type LightboxItem, type LightboxPair } from './lightbox-queue'
import { lightboxAssetDomId } from './scroll-to-asset'
import { cn } from '@/utils/cn'

interface SharedProps {
  selected: LightboxPair
  /** Where the lightbox was opened decides the pictures' `srcset`. */
  sources: LightboxSources
  sizes: Readonly<Record<string, Size>>
  onMeasure: (image: HTMLElement) => void
  onPick: (assetId: string, postId: string) => void
}

interface ItemProps extends SharedProps {
  item: LightboxItem
  isComment: boolean
}

/** The original's `RegionItems` with `isLightBox`: only the pictures, one `div` per region list. */
const ItemBodies = ({ item, isComment, selected, sources, sizes, onMeasure, onPick }: ItemProps) => (
  <>
    {item.bodies.map((regions, bodyIndex) =>
      bodyIndex > 0 && regions.length === 0 ? null : (
        <div key={bodyIndex}>
          {regions.map((region, index) => {
            const assetId = region.kind === 'image' ? assetIdOf(region) : null
            if (region.kind !== 'image' || !assetId) return null
            const pair = { postId: item.id, assetId }
            return (
              <LightboxImage
                key={index}
                pair={pair}
                region={region}
                asset={item.assets.find((asset) => asset.id === assetId)}
                isSelected={samePair(pair, selected)}
                sources={sources}
                isComment={isComment}
                size={sizes[lightboxAssetDomId(pair)]}
                onMeasure={onMeasure}
                onPick={onPick}
              />
            )
          })}
        </div>
      ),
    )}
  </>
)

export interface QueueProps extends SharedProps {
  items: LightboxItem[]
}

/** A stream's or a post page's queue: each post as the original's `PostContainer isLightBox`. */
export const PostQueue = ({ items, ...shared }: QueueProps) =>
  items.map((item) => (
    <div key={item.id} className={cn('Post', !item.isRepost && 'isPostHeaderHidden')}>
      <div className="PostBody">
        <ItemBodies item={item} isComment={false} {...shared} />
      </div>
    </div>
  ))

/** A comment list's queue: each comment as the original's `CommentContainer isLightBox`. */
export const CommentQueue = ({ items, ...shared }: QueueProps) =>
  items.map((item) => (
    <div key={item.id} className="Comment">
      <div className="CommentBody">
        <ItemBodies item={item} isComment {...shared} />
      </div>
    </div>
  ))
