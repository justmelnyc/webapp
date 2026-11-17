'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { saveProfile } from '@/actions/profile-actions'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { profileSchema, type ProfileInput } from '@/lib/schemas/profile'
import { toast } from '@/stores/toast-store'
import { ExternalLinksField } from './external-links-field'

interface ProfileFormProps {
  defaults: ProfileInput
}

export const ProfileForm = ({ defaults }: ProfileFormProps) => {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), mode: 'onChange', defaultValues: defaults })

  const onSubmit = async (values: ProfileInput): Promise<void> => {
    setSaving(true)
    const result = await saveProfile(values)
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    reset(values)
    toast.success('Profile saved')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <Field>
        <Field.Label htmlFor="name">Name</Field.Label>
        <Field.Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register('name')} />
        <Field.Error>{errors.name?.message}</Field.Error>
      </Field>
      <Field>
        <Field.Label htmlFor="username">Username</Field.Label>
        <Field.Input id="username" autoComplete="username" aria-invalid={!!errors.username} {...register('username')} />
        <Field.Error>{errors.username?.message}</Field.Error>
      </Field>
      <Field>
        <Field.Label htmlFor="email">Email</Field.Label>
        <Field.Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
        <Field.Error>{errors.email?.message}</Field.Error>
      </Field>
      <Field>
        <Field.Label htmlFor="bio">Bio</Field.Label>
        <Field.Textarea id="bio" aria-invalid={!!errors.bio} {...register('bio')} />
        <Field.Error>{errors.bio?.message}</Field.Error>
      </Field>
      <Field>
        <Field.Label htmlFor="location">Location</Field.Label>
        <Field.Input id="location" aria-invalid={!!errors.location} {...register('location')} />
        <Field.Error>{errors.location?.message}</Field.Error>
      </Field>
      <ExternalLinksField control={control} register={register} errors={errors} />
      <div>
        <Button type="submit" disabled={!isDirty || !isValid || saving} className="px-6 py-3">
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
