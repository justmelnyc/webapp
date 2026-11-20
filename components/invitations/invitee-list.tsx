'use client'

import Link from 'next/link'
import { useEffect, useTransition } from 'react'
import { sendInvitations } from '@/actions/invitation-actions'
import { useLayoutModeStore } from '@/components/layout/layout-mode-store'
import { RelationshipButton } from '@/components/profile/relationship-button'
import { Avatar } from '@/components/ui/avatar'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'
import type { Invitee } from '@/types/invitation'
import { avatarUrl } from '@/utils/images'
import styles from './invitations.module.css'
import '@/components/streams/columns.css'

const PendingInvitee = ({ email, className }: { email: string; className: string }) => {
  const [pending, startTransition] = useTransition()
  const reinvite = (): void => {
    startTransition(async () => {
      const result = await sendInvitations({ emails: [email] })
      if (!result.ok) toast.error(result.error)
    })
  }
  return (
    <div className={className}>
      <div className={`UserInviteeHeader ${styles.inviteeHeader}`}>
        <a className={`UserInviteeUserLink truncate ${styles.inviteeLink}`} href={`mailto: ${email}`}>
          <Avatar src={null} name={email} />
          <span className={`UserInviteeEmail ${styles.inviteeText}`}>{email}</span>
        </a>
      </div>
      <button type="button" className={`UserInviteeAction ${styles.action}`} onClick={reinvite} disabled={pending}>
        <span>Re-Invite</span>
      </button>
    </div>
  )
}

const AcceptedInvitee = ({ user, className }: { user: NonNullable<Invitee['user']>; className: string }) => (
  <div className={className}>
    <div className={`UserInviteeHeader ${styles.inviteeHeader}`}>
      <Link className={`UserInviteeUserLink truncate ${styles.inviteeLink}`} href={`/${user.username}`}>
        <Avatar src={avatarUrl(user.avatar)} name={user.username} />
        <span className={`UserInviteeUsername ${styles.inviteeText}`}>{`@${user.username}`}</span>
      </Link>
    </div>
    <div className={styles.relationship}>
      <RelationshipButton userId={user.id} username={user.username} priority={user.relationshipPriority} signedIn />
    </div>
  </div>
)

/**
 * The original's `Users.asInviteeList` / `asInviteeGrid`. /invitations starts in list mode (reducers/gui.js);
 * the footer's layout tool switches it.
 */
export const InviteeList = ({ invitees }: { invitees: Invitee[] }) => {
  const mode = useLayoutModeStore((state) => state.mode)
  useEffect(() => {
    useLayoutModeStore.setState({ mode: 'list' })
    return () => useLayoutModeStore.setState({ mode: 'grid' })
  }, [])
  const isGrid = mode === 'grid'
  const rowClass = cn('UserInvitee', styles.invitee, isGrid && ['UserInviteeGrid Column', styles.gridItem])
  return (
    <section className={`StreamContainer ${styles.stream}`}>
      <div className={cn('Users', isGrid ? ['asInviteeGrid Columns', styles.grid] : 'asInviteeList')}>
        {invitees.map((invitee) =>
          invitee.user ? (
            <AcceptedInvitee key={invitee.id} user={invitee.user} className={rowClass} />
          ) : (
            <PendingInvitee key={invitee.id} email={invitee.email} className={rowClass} />
          ),
        )}
      </div>
    </section>
  )
}
