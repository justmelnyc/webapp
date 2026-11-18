import { LockIcon, RepostIcon } from '@/components/icons'
import type { Region } from '@/types/post'
import blockStyles from '@/components/composer/omnibar.module.css'
import styles from './repost-block.module.css'

const regionElement = (region: Region, index: number) => {
  if (region.kind === 'text') return <div key={index} dangerouslySetInnerHTML={{ __html: region.data }} />
  if (region.kind === 'image') {
    // eslint-disable-next-line @next/next/no-img-element -- the original shows the region's own url
    return region.data.url ? <img key={index} src={region.data.url} alt={region.data.alt ?? ''} /> : null
  }
  const thumb = region.data.thumbnailLargeUrl
  // eslint-disable-next-line @next/next/no-img-element -- embed thumbnails come from the service
  return typeof thumb === 'string' ? <img key={index} src={thumb} alt={String(region.data.service ?? '')} /> : null
}

interface RepostBlockProps {
  /** The reposter, shown as "by @username". */
  username: string
  /** What is being reposted (already sanitized). */
  regions: Region[]
}

/** The original's `RepostBlock`: who is reposting and the locked content being reposted. */
export const RepostBlock = ({ username, regions }: RepostBlockProps) => (
  <div className={`editor-block readonly ${blockStyles.block} ${styles.readonly}`}>
    <div className={`RepostBlockLabel ${styles.label}`}>
      <RepostIcon />
      {` by @${username}`}
    </div>
    {regions.map(regionElement)}
    <div className={styles.tools}>
      <LockIcon />
    </div>
  </div>
)
