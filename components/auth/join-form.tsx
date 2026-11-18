'use client'

import { useState } from 'react'
import { JoinAccountForm } from '@/components/auth/join-account-form'
import { JoinEmailForm } from '@/components/auth/join-email-form'

interface JoinFormProps {
  invitationCode: string | null
  /** The address the invitation was sent to; it prefills step one. */
  invitationEmail: string | null
}

/** The original's `RegistrationRequestForm`: the email step, then (`JoinForm`) username and password. */
export const JoinForm = ({ invitationCode, invitationEmail }: JoinFormProps) => {
  const [email, setEmail] = useState<string | null>(null)
  if (email === null) return <JoinEmailForm initialEmail={invitationEmail} onAccepted={setEmail} />
  return <JoinAccountForm email={email} invitationCode={invitationCode} />
}
