'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { checkAvailability } from '@/actions/account-actions'
import { ArrowIcon } from '@/components/icons'
import type { Availability } from '@/lib/schemas/profile'
import { cn } from '@/utils/cn'
import { emailClientError } from '@/utils/availability'
import { useMediaQuery } from './use-media-query'
import styles from './footer-form.module.css'

/** How long "Subscribed. See you tomorrow" stays before the form empties itself again. */
export const SUBSCRIBED_RESET_DELAY = 1666

type FormStatus = 'indeterminate' | 'success' | 'failure'
interface FormState {
  status: FormStatus
  message: string
}

const INDETERMINATE: FormState = { status: 'indeterminate', message: '' }
const STATUS_CLASS: Record<FormStatus, string> = { indeterminate: 'isIndeterminate', success: 'isSucceeding', failure: 'isFailing' }

/** `getEmailStateFromServer`, as the footer reads it: a free address subscribes, anything else is "invalid". */
export const subscriptionState = (availability: Availability | null): FormState => {
  if (availability?.email) return { status: 'success', message: 'Subscribed. See you tomorrow' }
  const suggestion = availability?.suggestions.email?.full
  return { status: 'failure', message: suggestion ? `Did you mean ${suggestion}?` : 'That email is invalid' }
}

/**
 * The footer's daily-inspiration signup (`FooterForm` + `FooterContainer`). Like the original it asks the
 * availability endpoint about the address: the button unlocks once the text looks like an email, a free
 * address gets a green "Subscribed. See you tomorrow" bubble and the form resets after 1666ms, a taken or
 * malformed one a red "That email is invalid". Typing again takes the bubble away.
 */
export const FooterForm = () => {
  const isMobile = useMediaQuery('(max-width: 39.9375em)')
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>(INDETERMINATE)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current)
  }, [])

  const onChange = (value: string): void => {
    setEmail(value)
    if (state.status !== 'indeterminate') setState(INDETERMINATE)
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    const result = await checkAvailability({ email })
    const next = subscriptionState(result.ok ? result.data : null)
    setState(next)
    if (next.status !== 'success') return
    resetTimer.current = setTimeout(() => {
      setEmail('')
      setState(INDETERMINATE)
    }, SUBSCRIBED_RESET_DELAY)
  }

  return (
    <form className={cn(styles.form, STATUS_CLASS[state.status])} noValidate onSubmit={(event) => void onSubmit(event)}>
      <div className={styles.control}>
        <label htmlFor="FooterEmailInput" hidden>
          Email
        </label>
        <input
          id="FooterEmailInput"
          className={cn('inFooter', styles.input)}
          type="email"
          name="user[email]"
          autoCapitalize="off"
          autoCorrect="off"
          placeholder={isMobile ? 'Subscribe' : 'Enter email for daily inspiration'}
          value={email}
          onChange={(event) => onChange(event.target.value.trim())}
        />
      </div>
      <button
        type="submit"
        className={cn('FormButton inFooter', styles.button)}
        disabled={emailClientError(email) !== null}
        aria-label={isMobile ? 'Subscribe' : undefined}
      >
        {isMobile ? <ArrowIcon /> : 'Subscribe'}
      </button>
      {state.message ? (
        <span className={cn('FormControlStatusBubble inFooter', styles.bubble)} role="status">
          {state.message}
        </span>
      ) : null}
    </form>
  )
}
