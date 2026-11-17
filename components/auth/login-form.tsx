'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type ChangeEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { login } from '@/actions/auth'
import { authAltLinkClass, authFormClass } from '@/components/auth/auth-styles'
import { MESSAGES, signInFormSchema } from '@/components/auth/auth-validation'
import { useQuietFor } from '@/components/auth/use-delayed-errors'
import { FormButton } from '@/components/ui/button'
import { FormControl } from '@/components/ui/form-control'
import { toast } from '@/stores/toast-store'
import type { z } from 'zod'

type SignInInput = z.input<typeof signInFormSchema>

/** Only follow same-site paths so a crafted ?next= can't bounce people elsewhere. */
const safeNext = (next: string | undefined): string => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/')

export const LoginForm = ({ next }: { next?: string }) => {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInFormSchema),
    mode: 'onChange',
    defaultValues: { usernameOrEmail: '', password: '' },
  })
  const userValue = useWatch({ control, name: 'usernameOrEmail' })
  const passwordValue = useWatch({ control, name: 'password' })
  const userQuiet = useQuietFor(userValue)
  const passwordQuiet = useQuietFor(passwordValue)
  const userError = errors.usernameOrEmail?.message
  const passwordError = errors.password?.message
  const userRegistration = register('usernameOrEmail')

  // The original trims whitespace out of the username field as you type.
  const onChangeUser = (e: ChangeEvent<HTMLInputElement>): void => {
    if (/\s/.test(e.target.value)) e.target.value = e.target.value.trim()
    void userRegistration.onChange(e)
  }

  const onSubmit = async (values: SignInInput): Promise<void> => {
    setSubmitting(true)
    setFailure(null)
    const result = await login({ usernameOrEmail: values.usernameOrEmail.trim(), password: values.password })
    if (!result.ok) {
      setSubmitting(false)
      setFailure(MESSAGES.credentials)
      toast.error(result.error)
      return
    }
    router.replace(safeNext(next))
    router.refresh()
  }

  return (
    <>
      <form
        id="NewSessionForm"
        onSubmit={handleSubmit(onSubmit)}
        className={authFormClass}
        noValidate
      >
        <FormControl appearance="box" className="TextControl">
          <FormControl.Label htmlFor="usernameOrEmail">Username or Email</FormControl.Label>
          <FormControl.Input
            id="usernameOrEmail"
            type="text"
            autoComplete="username"
            placeholder="Enter your username or email"
            aria-invalid={!!userError}
            {...userRegistration}
            onChange={onChangeUser}
          />
          <FormControl.Status />
          {userQuiet && userValue && userError && <FormControl.Message>{userError}</FormControl.Message>}
        </FormControl>
        <FormControl appearance="box" className="PasswordControl">
          <FormControl.Label htmlFor="password">Password</FormControl.Label>
          <FormControl.Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={!!passwordError}
            {...register('password')}
          />
          <FormControl.Status />
          {passwordQuiet && passwordValue && passwordError && <FormControl.Message>{passwordError}</FormControl.Message>}
        </FormControl>
        {failure && <p>{failure}</p>}
        <FormButton disabled={!isValid || submitting}>Log in</FormButton>
      </form>
      <Link className={authAltLinkClass} href="/forgot-password">
        Forgot password?
      </Link>
    </>
  )
}
