import type { LightboxPair } from './lightbox-queue'

/** The id of a picture in the page (`asset_…`) and of its copy in the lightbox queue (`lightBoxAsset_…`). */
export const assetDomId = ({ assetId, postId }: LightboxPair): string => `asset_${assetId}_${postId}`
export const lightboxAssetDomId = ({ assetId, postId }: LightboxPair): string => `lightBoxAsset_${assetId}_${postId}`

const visible = (className: string): HTMLElement | null => {
  const element = document.getElementsByClassName(className)[0]
  return element instanceof HTMLElement && element.getClientRects().length > 0 ? element : null
}

/**
 * Port of `scrollToSelectedAsset`: behind the lightbox the page follows along, so the selected
 * picture sits a tenth of the viewport from the top when the lightbox closes. A post page from 60em
 * scrolls its post column (or, for comment pictures, its sidebar); everything else scrolls the window.
 */
export const scrollToAsset = (pair: LightboxPair, isCommentStream: boolean): void => {
  const asset = document.getElementById(assetDomId(pair))
  if (!asset) return
  const top = asset.getBoundingClientRect().top
  const padding = window.innerHeight / 10
  const sideBar = visible('PostSideBar')
  const postList = visible('PostList')
  if (!sideBar) {
    window.scrollTo(0, top + window.scrollY - padding)
    return
  }
  const pane = isCommentStream ? sideBar : postList
  if (!pane) return
  pane.scrollLeft = 0
  pane.scrollTop = top + pane.scrollTop - padding
}
