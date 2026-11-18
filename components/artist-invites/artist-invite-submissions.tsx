import { getSession } from '@/lib/session'
import { getSubmissionPage } from '@/services/artist-invites'
import { submissionKeySchema, type ArtistInvite, type SubmissionKey } from '@/types/artist-invite'
import { isCuratorView, streamKeys } from '@/utils/artist-invite'
import { SubmissionStream } from './submission-stream'
import { SubmissionTabs } from './submission-tabs'
import styles from './submissions.module.css'

interface Props {
  invite: ArtistInvite
  /** `?submissionType=` from the URL; only curators have tabs. */
  submissionType?: string
}

const DEFAULT_KEY: SubmissionKey = 'unapprovedSubmissions'

const Curator = async ({ invite, submissionType }: Props) => {
  const session = await getSession()
  const links = invite.links ?? {}
  const parsed = submissionKeySchema.safeParse(submissionType)
  const selected = parsed.success && links[parsed.data] ? parsed.data : DEFAULT_KEY
  const href = links[selected]?.href
  if (!href) return null
  const page = await getSubmissionPage(href, 1)
  return (
    <>
      <SubmissionTabs
        tabs={streamKeys(invite.links).map((key) => ({ key, label: links[key]?.label ?? '' }))}
        selected={selected}
      />
      <SubmissionStream key={selected} href={href} initialPage={page} signedIn viewerId={session?.id} infinite />
    </>
  )
}

/** Closed invites lead with the curators' selections; open and selecting ones show accepted work only. */
const PUBLIC_STREAMS: Partial<Record<ArtistInvite['status'], { key: SubmissionKey; title: string }[]>> = {
  closed: [
    { key: 'selectedSubmissions', title: 'Selections' },
    { key: 'approvedSubmissions', title: 'Submissions' },
  ],
  open: [{ key: 'approvedSubmissions', title: 'Submissions' }],
  selecting: [{ key: 'approvedSubmissions', title: 'Submissions' }],
}

const Visitor = async ({ invite }: Props) => {
  const session = await getSession()
  const links = invite.links ?? {}
  const streams = (PUBLIC_STREAMS[invite.status] ?? []).flatMap(({ key, title }) => {
    const href = links[key]?.href
    return href ? [{ key, title, href }] : []
  })
  const pages = await Promise.all(streams.map((stream) => getSubmissionPage(stream.href, 1)))
  // Accepted work includes the selections, so an empty accepted stream means no submissions at all.
  const accepted = streams.findIndex((stream) => stream.key === 'approvedSubmissions')
  if (accepted >= 0 && pages[accepted]?.submissions.length === 0) {
    return (
      <div className={`StreamContainer ZeroState ${styles.zeroState}`}>
        <h1 className={styles.title}>No Submissions{invite.status !== 'closed' && <span> Yet</span>}</h1>
      </div>
    )
  }
  return (
    <>
      {streams.map((stream, i) => {
        const page = pages[i]
        return page ? (
          <SubmissionStream
            key={stream.key}
            href={stream.href}
            initialPage={page}
            headerText={stream.title}
            signedIn={!!session}
            viewerId={session?.id}
          />
        ) : null
      })}
    </>
  )
}

/** `ArtistInviteSubmissionsContainer`: the curator's tabs and stream, or the public streams. */
export const ArtistInviteSubmissions = async ({ invite, submissionType }: Props) => {
  const links = invite.links
  if (!links || Object.keys(links).length === 0) return null
  const session = await getSession()
  return (
    <section className={`Submissions ${styles.root}`}>
      {isCuratorView(links) && session ? <Curator invite={invite} submissionType={submissionType} /> : null}
      {!isCuratorView(links) ? <Visitor invite={invite} /> : null}
    </section>
  )
}
