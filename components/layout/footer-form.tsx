'use client'

import { useState, type FormEvent } from 'react'
import { ArrowIcon } from '@/components/icons'
import { toast } from '@/stores/toast-store'
import { useMediaQuery } from './use-media-query'
import styles from './footer-form.module.css'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** The footer's daily-inspiration signup. The mock API has no mailing list, so it only says so. */
export const FooterForm = () => {
  const isMobile = useMediaQuery('(max-width: 39.9375em)')
  const [email, setEmail] = useState('')

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    toast.info('The mock API has no mailing list, so nothing was subscribed.')
    setEmail('')
  }

  return (
    <form className={styles.form} noValidate onSubmit={onSubmit}>
      <div className={styles.control}>
        <label htmlFor="FooterEmailInput" hidden>
          Email
        </label>
        <input
          id="FooterEmailInput"
          className={styles.input}
          type="email"
          name="user[email]"
          autoCapitalize="off"
          autoCorrect="off"
          placeholder={isMobile ? 'Subscribe' : 'Enter email for daily inspiration'}
          value={email}
          onChange={(event) => setEmail(event.target.value.trim())}
        />
      </div>
      <button
        type="submit"
        className={styles.button}
        disabled={!EMAIL.test(email)}
        aria-label={isMobile ? 'Subscribe' : undefined}
      >
        {isMobile ? <ArrowIcon /> : 'Subscribe'}
      </button>
    </form>
  )
}
