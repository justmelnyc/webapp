'use client'

import { useState } from 'react'
import { JoinAccountForm } from '@/components/auth/join-account-form'
import { JoinEmailForm } from '@/components/auth/join-email-form'

interface JoinFormProps {
  invitationCode: string | null
  /** The address the invitation was sent to; it prefills step one. */
  invitationEmail: string | null
  /** Overrides the "Already have an account?" link's class (the sign-up dialog restyles it). */
  altLinkClassName?: string
}

/** The original's `RegistrationRequestForm`: the email step, then (`JoinForm`) username and password. */
export const JoinForm = ({ invitationCode, invitationEmail, altLinkClassName }: JoinFormProps) => {
  const [email, setEmail] = useState<string | null>(null)
  if (email === null) return <JoinEmailForm initialEmail={invitationEmail} onAccepted={setEmail} altLinkClassName={altLinkClassName} />
  return <JoinAccountForm email={email} invitationCode={invitationCode} />
}
