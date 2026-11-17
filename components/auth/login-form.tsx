'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { login } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { loginSchema, type LoginInput } from '@/lib/schemas/auth'
import { toast } from '@/stores/toast-store'

/** Only follow same-site paths so a crafted ?next= can't bounce people elsewhere. */
const safeNext = (next: string | undefined): string => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/')

export const LoginForm = ({ next }: { next?: string }) => {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), mode: 'onChange' })

  const onSubmit = async (values: LoginInput) => {
    setSubmitting(true)
    const result = await login(values)
    if (!result.ok) {
      setSubmitting(false)
      toast.error(result.error)
      return
    }
    router.replace(safeNext(next))
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <Field>
        <Field.Label htmlFor="usernameOrEmail">Username or email</Field.Label>
        <Field.Input
          id="usernameOrEmail"
          autoComplete="username"
          aria-invalid={!!errors.usernameOrEmail}
          {...register('usernameOrEmail')}
        />
        <Field.Error>{errors.usernameOrEmail?.message}</Field.Error>
      </Field>
      <Field>
        <Field.Label htmlFor="password">Password</Field.Label>
        <Field.Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        <Field.Error>{errors.password?.message}</Field.Error>
      </Field>
      <Button type="submit" disabled={!isValid || submitting} className="py-3">
        {submitting ? 'Logging in…' : 'Log in'}
      </Button>
    </form>
  )
}
