'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { saveCredentials } from '@/actions/profile-actions'
import { FieldError, outcome } from '@/components/settings/field-status'
import { FormButton } from '@/components/ui/button'
import { FormControl, type ControlStatus } from '@/components/ui/form-control'
import { useAvailability } from '@/hooks/use-availability'
import { credentialsSchema, type CredentialsInput } from '@/lib/schemas/profile'
import { toast } from '@/stores/toast-store'
import { emailClientError, emailFromServer, usernameClientError, usernameFromServer } from '@/utils/availability'
import { cn } from '@/utils/cn'
import styles from './settings.module.css'

interface CredentialsFormProps {
  username: string
  email: string
}

/**
 * The original's credentials form (`SettingsForm`): username, email and a new password. Changing any of them
 * opens `SettingsCredentialActions`, which asks for the current password and shows the Save button.
 */
export const CredentialsForm = ({ username, email }: CredentialsFormProps) => {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const defaults: CredentialsInput = { username, email, password: '', currentPassword: '' }
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    control,
    formState: { errors, dirtyFields },
  } = useForm<CredentialsInput>({ resolver: zodResolver(credentialsSchema), mode: 'onChange', defaultValues: defaults })
  const password = useWatch({ control, name: 'password' })
  const usernameCheck = useAvailability({
    field: 'username',
    current: username,
    clientError: usernameClientError,
    fromServer: usernameFromServer,
  })
  const emailCheck = useAvailability({
    field: 'email',
    current: email,
    clientError: emailClientError,
    fromServer: emailFromServer,
  })
  const [currentPasswordFailed, setCurrentPasswordFailed] = useState(false)
  const settled = (state: { status: string }): boolean => state.status !== 'failure' && state.status !== 'request'
  const changed = (field: 'username' | 'email'): boolean =>
    !!dirtyFields[field] && !errors[field] && settled(field === 'username' ? usernameCheck.state : emailCheck.state)
  const requiresSave =
    changed('username') || changed('email') || (password.length > 0 && !errors.password) || currentPasswordFailed
  const statusOf = (field: 'username' | 'email'): ControlStatus => {
    const { status } = field === 'username' ? usernameCheck.state : emailCheck.state
    if (status !== 'indeterminate' && !errors[field]) return status
    return outcome(!!dirtyFields[field] && status === 'indeterminate', errors[field]?.message)
  }
  const checkMessage = (field: 'username' | 'email'): string | undefined => {
    const { message } = field === 'username' ? usernameCheck.state : emailCheck.state
    return errors[field]?.message ?? (message || undefined)
  }

  const onSubmit = async (input: CredentialsInput): Promise<void> => {
    setSaving(true)
    const result = await saveCredentials(input)
    setSaving(false)
    if (!result.ok) {
      const fields = 'fields' in result ? result.fields : null
      if (!fields) {
        toast.error(result.error)
        return
      }
      for (const [field, message] of Object.entries(fields)) {
        if (field !== 'currentPassword') setError(field as 'username' | 'email' | 'password', { type: 'server', message })
      }
      setCurrentPasswordFailed(!!fields.currentPassword)
      return
    }
    setCurrentPasswordFailed(false)
    usernameCheck.reset()
    emailCheck.reset()
    reset({ ...input, password: '', currentPassword: '' })
    toast.success('Profile saved')
    router.refresh()
  }

  return (
    <form id="SettingsForm" onSubmit={handleSubmit(onSubmit)} className="SettingsForm" noValidate>
      <FormControl
        appearance="box-grey"
        status={statusOf('username')}
        initialValue={username}
        className="UsernameControl"
      >
        <FormControl.Label htmlFor="username">Username</FormControl.Label>
        <FormControl.Input
          id="username"
          type="text"
          autoComplete="username"
          placeholder="Enter your username"
          aria-invalid={!!errors.username}
          {...register('username', { onChange: (e) => usernameCheck.check(e.target.value) })}
        />
        <FormControl.Status />
        <FieldError message={checkMessage('username')} />
        <FormControl.Suggestions
          suggestions={usernameCheck.state.suggestions}
          onPick={(suggestion) => {
            setValue('username', suggestion, { shouldDirty: true, shouldValidate: true })
            usernameCheck.check(suggestion)
          }}
        />
      </FormControl>
      <FormControl
        appearance="box-grey"
        status={statusOf('email')}
        initialValue={email}
        className="EmailControl"
      >
        <FormControl.Label htmlFor="email">Email</FormControl.Label>
        <FormControl.Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          aria-invalid={!!errors.email}
          {...register('email', { onChange: (e) => emailCheck.check(e.target.value) })}
        />
        <FormControl.Status />
        <FieldError message={checkMessage('email')} />
      </FormControl>
      <FormControl
        appearance="box-grey"
        status={outcome(password.length > 0, errors.password?.message)}
        className="PasswordControl"
      >
        <FormControl.Label htmlFor="password">Password</FormControl.Label>
        <FormControl.Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Set a new password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        <FormControl.Status />
        <FieldError message={errors.password?.message} />
      </FormControl>
      <div
        inert={!requiresSave}
        className={cn('SettingsCredentialActions', styles.actions, requiresSave && ['requiresSave', styles.actionsOpen])}
      >
        <p>To save changes you must re-enter your current Ello password.</p>
        <FormControl
          appearance="box-grey"
          status={currentPasswordFailed ? 'failure' : 'indeterminate'}
          className="PasswordControl"
        >
          <FormControl.Label htmlFor="current_password">Password - Please enter your current one.</FormControl.Label>
          <FormControl.Input
            id="current_password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter current password"
            {...register('currentPassword')}
          />
          <FormControl.Status />
        </FormControl>
        <FormButton disabled={!requiresSave || saving} className="h-40! w-160! leading-[40px]!">
          Save
        </FormButton>
      </div>
    </form>
  )
}
