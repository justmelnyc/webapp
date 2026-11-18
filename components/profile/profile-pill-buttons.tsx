'use client'

import { useState } from 'react'
import { messageUser } from '@/actions/moderation-actions'
import { MessageDialog } from '@/components/moderation/message-dialog'
import { toast } from '@/stores/toast-store'
import type { MessageKind } from '@/lib/schemas/moderation'
import styles from './profile-pill-buttons.module.css'

interface ProfilePillButtonsProps {
  userId: string
  /** What the dialog calls the person: their name, or their username. */
  name: string
  signedIn: boolean
  isCollaborateable: boolean
  isHireable: boolean
}

const TITLES: Record<MessageKind, string> = { collaborate: 'Collaborate with', hire_me: 'Hire' }

/** The Collab and Hire pills of `UserProfileButtons` (shown for people who are open to both), with their message dialogs. */
export const ProfilePillButtons = ({ userId, name, signedIn, isCollaborateable, isHireable }: ProfilePillButtonsProps) => {
  const [kind, setKind] = useState<MessageKind | null>(null)

  const open = (next: MessageKind): void => {
    if (!signedIn) return void toast.info('Log in to send a message')
    setKind(next)
  }

  const send = async (message: string): Promise<string | null> => {
    if (!kind) return null
    const result = await messageUser(userId, kind, message)
    return result.ok ? null : result.error
  }

  return (
    <>
      {isCollaborateable ? (
        <button type="button" className={styles.pill} onClick={() => open('collaborate')}>
          Collab
        </button>
      ) : null}
      {isHireable ? (
        <button type="button" className={styles.pill} onClick={() => open('hire_me')}>
          Hire
        </button>
      ) : null}
      {kind ? <MessageDialog name={name} titlePrefix={TITLES[kind]} onSend={send} onDismiss={() => setKind(null)} /> : null}
    </>
  )
}
