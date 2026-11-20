'use client'

import { FieldError } from '@/components/settings/field-status'
import { linksToText } from '@/components/settings/links-text'
import { useInfoForm } from '@/components/settings/use-info-form'
import { FormControl } from '@/components/ui/form-control'
import type { InfoInput } from '@/lib/schemas/profile'
import { cn } from '@/utils/cn'
import styles from './onboarding-info-form.module.css'

interface OnboardingInfoFormProps {
  defaults: InfoInput
  className?: string
}

const ONBOARDING = 'isOnboardingControl'

/** The original's `InfoForm` with `isOnboardingControl`: plain line controls (no location icon) that autosave. */
export const OnboardingInfoForm = ({ defaults, className }: OnboardingInfoFormProps) => {
  const { initial, register, errors, values, linksText, linkError, status, queueSave, onChangeLinks } = useInfoForm(defaults)

  return (
    <form className={cn('OnboardingInfoForm InfoForm', styles.form, className)} noValidate onSubmit={(event) => event.preventDefault()}>
      <FormControl status={status('name', !!values.name, errors.name?.message)} initialValue={initial.name} className={cn(ONBOARDING, 'NameControl')}>
        <FormControl.Label htmlFor="name" className={ONBOARDING}>Name</FormControl.Label>
        <FormControl.Input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Name"
          className={ONBOARDING}
          aria-invalid={!!errors.name}
          {...register('name', { onChange: () => queueSave('name') })}
        />
        <FormControl.Status />
        <FieldError message={errors.name?.message} />
      </FormControl>
      <FormControl status={status('location', !!values.location, errors.location?.message)} initialValue={initial.location} className={cn(ONBOARDING, 'LocationControl', 'text')}>
        <FormControl.Label htmlFor="location" className={ONBOARDING}>Location</FormControl.Label>
        <FormControl.Input
          id="location"
          type="text"
          autoComplete="off"
          placeholder="Location"
          className={ONBOARDING}
          aria-invalid={!!errors.location}
          {...register('location', { onChange: () => queueSave('location') })}
        />
        <FormControl.Status />
        <FieldError message={errors.location?.message} />
      </FormControl>
      <FormControl status={status('bio', !!values.bio, errors.bio?.message)} initialValue={initial.bio} className={ONBOARDING}>
        <FormControl.Label htmlFor="bio" className={ONBOARDING}>Bio</FormControl.Label>
        <FormControl.Textarea
          id="bio"
          placeholder="Bio"
          className={ONBOARDING}
          aria-invalid={!!errors.bio}
          {...register('bio', { onChange: () => queueSave('bio') })}
        />
        <FormControl.Status />
        <FieldError message={errors.bio?.message} />
      </FormControl>
      <FormControl status={status('links', linksText.length > 0, linkError)} initialValue={linksToText(initial.links)} className={cn(ONBOARDING, 'LinksControl')}>
        <FormControl.Label htmlFor="links" className={ONBOARDING}>Links</FormControl.Label>
        <FormControl.Input
          id="links"
          type="text"
          placeholder="Links"
          className={ONBOARDING}
          value={linksText}
          onChange={onChangeLinks}
          aria-invalid={!!linkError}
        />
        <FormControl.Status />
        <FieldError message={linkError} />
      </FormControl>
    </form>
  )
}
