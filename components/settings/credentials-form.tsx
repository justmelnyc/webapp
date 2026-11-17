'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { saveCredentials } from '@/actions/profile-actions'
import { FieldError, outcome } from '@/components/settings/field-status'
import { FormButton } from '@/components/ui/button'
import { FormControl } from '@/components/ui/form-control'
import { credentialsSchema, type CredentialsInput } from '@/lib/schemas/profile'
import { toast } from '@/stores/toast-store'
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
    control,
    formState: { errors, dirtyFields },
  } = useForm<CredentialsInput>({ resolver: zodResolver(credentialsSchema), mode: 'onChange', defaultValues: defaults })
  const password = useWatch({ control, name: 'password' })
  const changed = (field: 'username' | 'email'): boolean => !!dirtyFields[field] && !errors[field]
  const requiresSave = changed('username') || changed('email') || (password.length > 0 && !errors.password)

  const onSubmit = async (input: CredentialsInput): Promise<void> => {
    setSaving(true)
    const result = await saveCredentials(input)
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    reset({ ...input, password: '', currentPassword: '' })
    toast.success('Profile saved')
    router.refresh()
  }

  return (
    <form id="SettingsForm" onSubmit={handleSubmit(onSubmit)} className="SettingsForm" noValidate>
      <FormControl
        appearance="box-grey"
        status={outcome(!!dirtyFields.username, errors.username?.message)}
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
          {...register('username')}
        />
        <FormControl.Status />
        <FieldError message={errors.username?.message} />
      </FormControl>
      <FormControl
        appearance="box-grey"
        status={outcome(!!dirtyFields.email, errors.email?.message)}
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
          {...register('email')}
        />
        <FormControl.Status />
        <FieldError message={errors.email?.message} />
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
        <FormControl appearance="box-grey" className="PasswordControl">
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
