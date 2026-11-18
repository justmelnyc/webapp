'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePassword } from '@/actions/password-actions'
import { authFormClass } from '@/components/auth/auth-styles'
import { passwordFormSchema, type PasswordInput } from '@/components/auth/auth-validation'
import { FormButton } from '@/components/ui/button'
import { FormControl } from '@/components/ui/form-control'
import { toast } from '@/stores/toast-store'

/** The original's `ResetPasswordForm`: the new password, and a notice when the link has expired. */
export const ResetPasswordForm = ({ token }: { token: string }) => {
  const router = useRouter()
  const [expired, setExpired] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<PasswordInput>({ resolver: zodResolver(passwordFormSchema), mode: 'onChange', defaultValues: { password: '' } })
  const value = useWatch({ control, name: 'password' })

  const onSubmit = async ({ password }: PasswordInput): Promise<void> => {
    setSubmitting(true)
    setExpired(false)
    const result = await changePassword({ password, token })
    if (result.ok) {
      router.replace(result.data.redirectTo)
      router.refresh()
      return
    }
    setSubmitting(false)
    if ('expired' in result) setExpired(true)
    else toast.error(result.error)
  }

  return (
    <form id="ResetPasswordForm" className={authFormClass} noValidate onSubmit={handleSubmit(onSubmit)}>
      {expired && (
        <p>
          <span>
            Your password link has expired. <Link href="/forgot-password">Click here to request another link.</Link>
          </span>
        </p>
      )}
      <FormControl appearance="box" className="PasswordControl">
        <FormControl.Label htmlFor="password">Password</FormControl.Label>
        <FormControl.Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Enter new password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        <FormControl.Status />
      </FormControl>
      <FormControl.Message>{value ? errors.password?.message : undefined}</FormControl.Message>
      <FormButton disabled={!isValid || submitting} tabIndex={2}>
        Change password
      </FormButton>
    </form>
  )
}
