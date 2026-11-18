'use client'

import { useRef, useState, type FormEvent } from 'react'
import { sendInvitations } from '@/actions/invitation-actions'
import { FormButton } from '@/components/ui/button'
import { FormControl } from '@/components/ui/form-control'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'
import { hasEmails, splitEmails } from '@/utils/invitations'
import styles from './invitations.module.css'

type Phase = 'idle' | 'submitted' | 'failed'

const HINT = 'Invite as many people as you want, just separate their email addresses with commas.'
const MESSAGES: Record<Phase, string> = {
  idle: HINT,
  submitted: 'Your invitations have been sent.',
  failed: 'There was an error submitting that form. Please contact support.',
}

/** The original's `InvitationFormContainer`: a box textarea of addresses and an outlined Invite button. */
export const InviteForm = () => {
  const [emails, setEmails] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const reset = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isValid = hasEmails(emails)

  const settle = (next: Phase): void => {
    setPhase(next)
    if (reset.current) clearTimeout(reset.current)
    // the original sets the form back to its initial state after two seconds
    reset.current = setTimeout(() => setPhase('idle'), 2000)
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (!isValid) return settle('failed')
    const list = splitEmails(emails).filter(Boolean)
    setEmails('')
    settle('submitted')
    const result = await sendInvitations({ emails: list })
    if (!result.ok) toast.error(result.error)
  }

  return (
    <div className="InvitationsForm">
      <form method="POST" noValidate onSubmit={onSubmit}>
        <FormControl appearance="box-grey" className="BatchEmailControl" style={{ marginBottom: 25 }}>
          <FormControl.Label htmlFor="emails">Emails </FormControl.Label>
          <FormControl.Textarea
            id="emails"
            name="invitations[email]"
            placeholder="Enter email addresses"
            tabIndex={1}
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            style={{ height: 160 }}
          />
          <FormControl.Status />
        </FormControl>
        <p className={styles.suggestion}>{MESSAGES[phase]}</p>
        <FormButton
          className={cn('isAutoSize isOutlined', styles.button, isValid && 'px-30!')}
          disabled={!isValid}
          tabIndex={2}
        >
          Invite
        </FormButton>
      </form>
    </div>
  )
}
