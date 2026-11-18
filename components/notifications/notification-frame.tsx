import type { ReactNode } from 'react'
import type { Notification as NotificationData } from '@/types/notification'
import type { Asset, Post, Region } from '@/types/post'
import type { Author } from '@/types/user'
import { cn } from '@/utils/cn'
import { Notification } from './notification'
import { kindClass, splitSummary, summaryRegions } from './notification-parts'

/** What a notification thumbnails and quotes: a post's summary and the images it points at. */
export interface SummarySource {
  summary: Region[]
  assets: Asset[]
}

/** The original of a repost, as the notification query returns it (its summary is only asked for there). */
export const sourceSummary = (source: Post['repostedSource']): SummarySource | null =>
  source ? { summary: source.summary ?? [], assets: source.assets ?? [] } : null

interface FrameProps {
  data: NotificationData
  /** Who the avatar shows; none for kinds that are not about a person. */
  notifier?: Author | null
  /** The post whose thumbnail and text accompany the sentence. */
  post?: SummarySource | null
  /** A comment whose text follows the post's. */
  comment?: { content: Region[] } | null
  path: string
  /** Replaces the original's per-kind class (a few kinds reuse another kind's). */
  className?: string
  children: ReactNode
}

/** One notification: avatar, thumbnail, sentence, text summary and age. */
export const Frame = ({ data, notifier, post, comment, path, className, children }: FrameProps) => {
  const { image, texts } = post ? splitSummary(summaryRegions(post, comment)) : { image: null, texts: [] }
  return (
    <Notification className={cn(className ?? kindClass[data.kind])} hasAsset={!!image}>
      {notifier ? <Notification.Header notifier={notifier} /> : null}
      {image && post ? <Notification.Asset region={image} assets={post.assets} href={path} /> : null}
      <Notification.Body texts={texts}>
        <p>{children}</p>
      </Notification.Body>
      <Notification.Footer href={path} createdAt={data.createdAt} />
    </Notification>
  )
}
