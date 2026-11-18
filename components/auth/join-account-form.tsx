'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { signup } from '@/actions/signup-actions'
import styles from '@/components/auth/auth.module.css'
import { MESSAGES } from '@/components/auth/auth-validation'
import { useQuietFor } from '@/components/auth/use-delayed-errors'
import { FormButton } from '@/components/ui/button'
import { FormControl } from '@/components/ui/form-control'
import { useAvailability } from '@/hooks/use-availability'
import { toast } from '@/stores/toast-store'
import { usernameClientError, usernameFromServer } from '@/utils/availability'
import { cn } from '@/utils/cn'

interface JoinAccountFormProps {
  email: string
  invitationCode: string | null
}

const PASSWORD = /^.{8,128}$/

/** Step two of /join: the original's `JoinForm` (username with availability suggestions, password). */
export const JoinAccountForm = ({ email, invitationCode }: JoinAccountFormProps) => {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const check = useAvailability({
    field: 'username',
    current: '',
    clientError: usernameClientError,
    fromServer: usernameFromServer,
  })
  const usernameQuiet = useQuietFor(username)
  const passwordQuiet = useQuietFor(password)
  const passwordOk = PASSWORD.test(password)
  const passwordStatus = password === '' ? 'indeterminate' : passwordOk ? 'success' : 'failure'
  const usernameState = check.state
  const isValid = usernameState.status === 'success' && passwordOk

  // the original trims whitespace out of the username as you type
  const onChangeUsername = (e: ChangeEvent<HTMLInputElement>): void => {
    const next = e.target.value.replace(/\s/g, '')
    setUsername(next)
    check.check(next)
  }

  const pick = (suggestion: string): void => {
    setUsername(suggestion)
    check.check(suggestion)
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!isValid || submitting) return
    setSubmitting(true)
    const result = await signup({ email, username, password, invitationCode: invitationCode ?? undefined })
    if (!result.ok) {
      setSubmitting(false)
      toast.error(result.error)
      return
    }
    router.replace(result.data.redirectTo)
    router.refresh()
  }

  return (
    <div className={cn('JoinForm', styles.joinForm)}>
      <form id="RegistrationForm" className="AuthenticationForm" noValidate onSubmit={onSubmit}>
        <FormControl appearance="white" status={usernameState.status} className="UsernameControl">
          <FormControl.Label htmlFor="username" className="UsernameControl">
            Username
          </FormControl.Label>
          <FormControl.Input
            id="username"
            name="user[username]"
            type="text"
            autoFocus
            tabIndex={1}
            maxLength={50}
            placeholder="Username"
            value={username}
            onChange={onChangeUsername}
          />
          <FormControl.Status />
          {usernameQuiet && username && usernameState.status === 'failure' && (
            <p className={cn('FormControlStatusMessage', styles.statusMessage)}>{usernameState.message}</p>
          )}
          <FormControl.Suggestions suggestions={usernameState.suggestions} onPick={pick} />
        </FormControl>
        <FormControl appearance="white" status={passwordStatus} className="PasswordControl">
          <FormControl.Label htmlFor="password" className="PasswordControl">
            Password
          </FormControl.Label>
          <FormControl.Input
            id="password"
            name="user[password]"
            type="password"
            tabIndex={2}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormControl.Status />
          {passwordQuiet && password && passwordStatus === 'failure' && (
            <p className={cn('FormControlStatusMessage', styles.statusMessage)}>{MESSAGES.password}</p>
          )}
        </FormControl>
        <FormButton className="isGreen" tabIndex={2} disabled={!isValid || submitting}>
          Discover Ello
        </FormButton>
      </form>
      <p className="AuthenticationTermsCopy">
        By continuing you are agreeing to our <Link href="/wtf/post/policies">Terms</Link>.
      </p>
    </div>
  )
}
