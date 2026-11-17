'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authAltLinkClass, authFormClass } from '@/components/auth/auth-styles'
import { joinFormSchema, type JoinInput } from '@/components/auth/auth-validation'
import { FormButton } from '@/components/ui/button'
import { FormControl } from '@/components/ui/form-control'

const NOT_AVAILABLE = 'Sign up is not part of the mock API. Use one of the seeded accounts to log in.'

/** The original's `RegistrationRequestForm` (email step of /join). */
export const JoinForm = () => {
  const [notice, setNotice] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<JoinInput>({ resolver: zodResolver(joinFormSchema), mode: 'onChange', defaultValues: { email: '' } })
  const value = useWatch({ control, name: 'email' })
  const error = errors.email?.message
  // The original shows the message for failures and for a validated email.
  const message = value ? (error ?? notice) : null

  return (
    <div className="relative z-[1]">
      <h1>Join The Creators Network.</h1>
      <h2>Be part of what&apos;s next in art, design, fashion, web culture &amp; more.</h2>
      <form
        id="RegistrationRequestForm"
        className={authFormClass}
        noValidate
        onSubmit={handleSubmit(() => setNotice(NOT_AVAILABLE))}
      >
        <FormControl appearance="box" className="JoinEmailControl EmailControl">
          <FormControl.Label htmlFor="email" className="JoinEmailControl">
            Email
          </FormControl.Label>
          <FormControl.Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            aria-invalid={!!error}
            {...register('email')}
          />
          <FormControl.Status />
        </FormControl>
        {message && <FormControl.Message>{message}</FormControl.Message>}
        <FormButton className="isGreen" disabled={!isValid}>
          Create account
        </FormButton>
      </form>
      <Link className={authAltLinkClass} href="/enter">
        Already have an account?
      </Link>
    </div>
  )
}
