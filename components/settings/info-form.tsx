'use client'

import { MarkerIcon } from '@/components/icons'
import { FieldError } from '@/components/settings/field-status'
import { linksToText, useInfoForm } from '@/components/settings/use-info-form'
import { FormControl } from '@/components/ui/form-control'
import type { InfoInput } from '@/lib/schemas/profile'

interface InfoFormProps {
  defaults: InfoInput
}

/** The original's `InfoForm` as the settings page shows it. */
export const InfoForm = ({ defaults }: InfoFormProps) => {
  const { initial, register, errors, values, linksText, linkError, status, queueSave, onChangeLinks } = useInfoForm(defaults)

  return (
    <form className="SettingsInfoForm InfoForm" noValidate onSubmit={(event) => event.preventDefault()}>
      <FormControl
        appearance="box-grey"
        status={status('name', !!values.name, errors.name?.message)}
        initialValue={initial.name}
        hideInitialStatus
        className="NameControl"
      >
        <FormControl.Label htmlFor="name">Name</FormControl.Label>
        <FormControl.Input id="name" type="text" autoComplete="name" placeholder="Name" aria-invalid={!!errors.name} {...register('name', { onChange: () => queueSave('name') })} />
        <FormControl.Status />
        <FieldError message={errors.name?.message} />
      </FormControl>
      <FormControl
        appearance="box-grey"
        status={status('location', !!values.location, errors.location?.message)}
        initialValue={initial.location}
        hideInitialStatus
        className="LocationControl hasIcon"
      >
        <FormControl.Icon>
          <MarkerIcon />
        </FormControl.Icon>
        <FormControl.Label htmlFor="location">Location</FormControl.Label>
        <FormControl.Input
          id="location"
          type="text"
          autoComplete="off"
          placeholder="Location"
          aria-invalid={!!errors.location}
          {...register('location', { onChange: () => queueSave('location') })}
        />
        <FormControl.Status />
        <FieldError message={errors.location?.message} />
      </FormControl>
      <FormControl
        appearance="box-grey"
        status={status('bio', !!values.bio, errors.bio?.message)}
        initialValue={initial.bio}
        hideInitialStatus
      >
        <FormControl.Label htmlFor="bio">Bio</FormControl.Label>
        <FormControl.Textarea id="bio" placeholder="Bio" aria-invalid={!!errors.bio} {...register('bio', { onChange: () => queueSave('bio') })} />
        <FormControl.Status />
        <FieldError message={errors.bio?.message} />
      </FormControl>
      <FormControl
        appearance="box-grey"
        status={status('links', linksText.length > 0, linkError)}
        initialValue={linksToText(initial.links)}
        hideInitialStatus
        className="LinksControl"
      >
        <FormControl.Label htmlFor="links">Links</FormControl.Label>
        <FormControl.Input
          id="links"
          type="text"
          placeholder="Links"
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
