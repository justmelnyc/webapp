import type { ArtistInvite } from '@/types/artist-invite'
import { ArtistInviteCard } from './artist-invite-card'
import styles from './artist-invite-list.module.css'

/** `artistInvites` stream renderer: cards wrapping two to a row. */
export const ArtistInviteList = ({ invites }: { invites: ArtistInvite[] }) => (
  <section className={`StreamContainer ${styles.stream}`}>
    <div className={styles.cards}>
      {invites.map((invite) => (
        <ArtistInviteCard key={invite.id} invite={invite} />
      ))}
    </div>
  </section>
)
