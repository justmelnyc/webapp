'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sendResetLink } from '@/actions/password-actions'
import { authFormClass } from '@/components/auth/auth-styles'
import { joinFormSchema, type JoinInput } from '@/components/auth/auth-validation'
import { FormButton } from '@/components/ui/button'
import { FormControl } from '@/components/ui/form-control'
import { toast } from '@/stores/toast-store'

/** What the original shows once the request is sent (whether or not the email exists). */
export const SubmittedNotice = () => (
  <div>
    If your email address exists in our database, you will receive a password recovery link at your email address in a
    few minutes.
  </div>
)

/** The original's `ForgotPasswordForm` followed by its submitted state. */
export const ForgotPasswordForm = () => {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<JoinInput>({ resolver: zodResolver(joinFormSchema), mode: 'onChange', defaultValues: { email: '' } })
  const value = useWatch({ control, name: 'email' })

  const onSubmit = async ({ email }: JoinInput): Promise<void> => {
    setSubmitted(true)
    const result = await sendResetLink({ email })
    if (result.ok) return
    setSubmitted(false)
    toast.error(result.error)
  }

  if (submitted) return <SubmittedNotice />
  return (
    <form id="ForgotPasswordForm" className={authFormClass} noValidate onSubmit={handleSubmit(onSubmit)}>
      <FormControl appearance="box" className="EmailControl">
        <FormControl.Label htmlFor="email">Email</FormControl.Label>
        <FormControl.Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        <FormControl.Status />
      </FormControl>
      <FormControl.Message>{value ? errors.email?.message : undefined}</FormControl.Message>
      <FormButton disabled={!isValid} tabIndex={2}>
        Reset password
      </FormButton>
    </form>
  )
}
