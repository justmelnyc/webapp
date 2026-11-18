import type { Metadata } from 'next'
import { InviteForm } from '@/components/invitations/invite-form'
import { InviteeList } from '@/components/invitations/invitee-list'
import styles from '@/components/invitations/invitations.module.css'
import { requireSession } from '@/lib/require-session'
import { getInvitees } from '@/services/invitations'

export const metadata: Metadata = { title: 'Invitations' }

const InvitationsPage = async () => {
  await requireSession('/invitations')
  const invitees = await getInvitees()
  return (
    <div className={styles.main}>
      <div className={styles.column}>
        <header className={styles.header}>
          <h1 className={styles.heading}>Invite some cool people</h1>
          <p>Help Ello grow.</p>
        </header>
        <InviteForm />
      </div>
      <div className={styles.column}>
        <h2 className={styles.streamHeading}>People you&apos;ve invited</h2>
        <InviteeList invitees={invitees} />
      </div>
    </div>
  )
}

export default InvitationsPage
