'use client'

import Link from 'next/link'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { checkSignupEmail } from '@/actions/signup-actions'
import { authAltLinkClass, authFormClass } from '@/components/auth/auth-styles'
import { FormButton } from '@/components/ui/button'
import { FormControl } from '@/components/ui/form-control'
import { useAvailability } from '@/hooks/use-availability'
import { CHECKING, emailClientError, emailFromServer, type CheckState } from '@/utils/availability'

const SUCCESS: CheckState = { status: 'success', message: '', suggestions: [] }

interface JoinEmailFormProps {
  initialEmail: string | null
  onAccepted: (email: string) => void
}

/** Step one of /join: the original's `renderEmailForm`. */
export const JoinEmailForm = ({ initialEmail, onAccepted }: JoinEmailFormProps) => {
  const [value, setValue] = useState(initialEmail ?? '')
  // an invitation's address counts as checked, like the original's `checkForInviteCode`
  const [prefilled, setPrefilled] = useState(!!initialEmail)
  const [submitState, setSubmitState] = useState<CheckState | null>(null)
  const check = useAvailability({ field: 'email', current: '', clientError: emailClientError, fromServer: emailFromServer })
  const state = submitState ?? (prefilled ? SUCCESS : check.state)
  const { status, message } = state
  const isValid = status === 'success'
  const showMessage = !!message && (status === 'failure' || status === 'success')

  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPrefilled(false)
    setSubmitState(null)
    setValue(e.target.value)
    check.check(e.target.value)
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!isValid) return
    setSubmitState(CHECKING)
    const result = await checkSignupEmail(value.trim())
    if (result.ok && result.data.email) return onAccepted(value.trim())
    setSubmitState(result.ok ? emailFromServer(result.data) : { ...CHECKING, status: 'failure', message: result.error })
  }

  return (
    <div className="relative z-[1]">
      <h1>Join The Creators Network.</h1>
      <h2>Be part of what&apos;s next in art, design, fashion, web culture &amp; more.</h2>
      <form id="RegistrationRequestForm" className={authFormClass} noValidate onSubmit={onSubmit}>
        <FormControl appearance="box" className="JoinEmailControl EmailControl">
          <FormControl.Label htmlFor="email" className="JoinEmailControl">
            Email
          </FormControl.Label>
          <FormControl.Input
            id="email"
            name="user[email]"
            type="email"
            tabIndex={1}
            autoComplete="email"
            placeholder="Enter your email"
            value={value}
            onChange={onChange}
          />
          <FormControl.Status />
        </FormControl>
        {showMessage && <FormControl.Message>{message}</FormControl.Message>}
        <FormButton className="isGreen" tabIndex={2} disabled={!isValid}>
          Create account
        </FormButton>
      </form>
      <Link className={authAltLinkClass} href="/enter">
        Already have an account?
      </Link>
    </div>
  )
}
