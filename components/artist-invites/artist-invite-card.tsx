import Link from 'next/link'
import type { ArtistInvite } from '@/types/artist-invite'
import { cleanHtml } from '@/utils/sanitize'
import { inviteHref } from '@/utils/artist-invite'
import { InviteDateRange, InviteStatus } from './artist-invite-status'
import { InviteImage } from './invite-image'
import styles from './artist-invite.module.css'

/** A card on /invites (`ArtistInviteGrid`). Invites with a redirect open the partner's site in a new tab. */
export const ArtistInviteCard = ({ invite }: { invite: ArtistInvite }) => {
  const href = inviteHref(invite)
  return (
    <Link className={styles.grid} href={href} target={invite.redirectUrl ? '_blank' : undefined}>
      <InviteImage invite={invite} />
      <div className={styles.content}>
        <h2 className={styles.title}>{invite.title}</h2>
        <div className={styles.details}>
          <p className={styles.inviteType}>{invite.inviteType}</p>
          <InviteStatus status={invite.status} bullet />
          <InviteDateRange status={invite.status} openedAt={invite.openedAt} closedAt={invite.closedAt} />
        </div>
        <div className={styles.shortDescription} dangerouslySetInnerHTML={{ __html: cleanHtml(invite.shortDescription ?? '') }} />
      </div>
    </Link>
  )
}
