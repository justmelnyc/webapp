import { getSession } from '@/lib/session'
import type { ArtistInvite } from '@/types/artist-invite'
import { cn } from '@/utils/cn'
import { cleanHtml } from '@/utils/sanitize'
import { ArtistInviteSubmissions } from './artist-invite-submissions'
import { InviteDateRange, InviteStatus } from './artist-invite-status'
import { InviteImage } from './invite-image'
import { SeeSubmissionsButton } from './scroll-button'
import { SubmitButton } from './submit-button'
import styles from './artist-invite-detail.module.css'
import card from './artist-invite.module.css'

interface Props {
  invite: ArtistInvite
  submissionType?: string
}

/** The /invites/:slug page body (`ArtistInviteDetail`): header image, status, description, guide, then submissions. */
export const ArtistInviteDetail = async ({ invite, submissionType }: Props) => {
  const session = await getSession()
  const isUpcoming = invite.status === 'upcoming'
  return (
    <div>
      <article className={cn(styles.detail, isUpcoming && styles.upcoming)}>
        <InviteImage invite={invite} />
        <div className={styles.content}>
          <div className={styles.column}>
            <h1 className={card.title}>{invite.title}</h1>
            <p className={card.inviteType}>{invite.inviteType}</p>
            <InviteStatus status={invite.status} />
            <InviteDateRange status={invite.status} openedAt={invite.openedAt} closedAt={invite.closedAt} />
            {!isUpcoming && <SeeSubmissionsButton />}
            <div dangerouslySetInnerHTML={{ __html: cleanHtml(invite.description ?? '') }} />
          </div>
          <div className={styles.column}>
            {invite.status === 'open' && <SubmitButton isLoggedIn={!!session} invite={invite} />}
            {(invite.guide ?? []).map((guide) => (
              <div className={styles.guide} key={guide.title}>
                <h3 className={styles.guideHeader}>{guide.title}</h3>
                <div className={styles.guideContent} dangerouslySetInnerHTML={{ __html: cleanHtml(guide.renderedBody) }} />
              </div>
            ))}
          </div>
        </div>
      </article>
      {!isUpcoming && <ArtistInviteSubmissions invite={invite} submissionType={submissionType} />}
    </div>
  )
}
