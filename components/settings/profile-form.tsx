'use client'

import { useRouter } from 'next/navigation'
import { useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { saveProfile } from '@/actions/profile-actions'
import { MarkerIcon } from '@/components/icons'
import { FormButton } from '@/components/ui/button'
import { FormControl, type ControlStatus } from '@/components/ui/form-control'
import { profileSchema, type ProfileInput } from '@/lib/schemas/profile'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'
import styles from './settings.module.css'

interface ProfileFormProps {
  defaults: ProfileInput
}

type Link = ProfileInput['links'][number]

/** The original's Links control is one text field of URLs separated by commas or spaces. */
const linksToText = (links: Link[]): string => links.map((link) => link.url).join(' ')

const textToLinks = (text: string, known: Link[]): Link[] =>
  text
    .split(/[,\s]+/)
    .filter(Boolean)
    .map((url) => ({ url, text: known.find((link) => link.url === url)?.text ?? '' }))

const outcome = (hasValue: boolean, error: string | undefined): ControlStatus => {
  if (!hasValue) return 'indeterminate'
  return error ? 'failure' : 'success'
}

const FieldError = ({ message }: { message: string | undefined }) =>
  message ? <p role="alert">{message}</p> : null

export const ProfileForm = ({ defaults }: ProfileFormProps) => {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [linksText, setLinksText] = useState(linksToText(defaults.links))
  const [knownLinks, setKnownLinks] = useState(defaults.links)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid, isDirty, dirtyFields },
  } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), mode: 'onChange', defaultValues: defaults })
  const values = watch()
  const linkError = errors.links?.message ?? errors.links?.root?.message ?? errors.links?.find?.((l) => l?.url)?.url?.message

  const onChangeLinks = (event: ChangeEvent<HTMLInputElement>): void => {
    setLinksText(event.target.value)
    setValue('links', textToLinks(event.target.value, knownLinks), { shouldDirty: true, shouldValidate: true })
  }

  const onSubmit = async (input: ProfileInput): Promise<void> => {
    setSaving(true)
    const result = await saveProfile(input)
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setKnownLinks(input.links)
    reset(input)
    toast.success('Profile saved')
    router.refresh()
  }

  return (
    <form id="SettingsForm" onSubmit={handleSubmit(onSubmit)} className="SettingsForm" noValidate>
      <FormControl
        appearance="box-grey"
        status={outcome(!!dirtyFields.username, errors.username?.message)}
        initialValue={defaults.username}
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
        initialValue={defaults.email}
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
        status={outcome(!!values.name, errors.name?.message)}
        initialValue={defaults.name}
        hideInitialStatus
        className="NameControl"
      >
        <FormControl.Label htmlFor="name">Name</FormControl.Label>
        <FormControl.Input id="name" type="text" autoComplete="name" placeholder="Name" aria-invalid={!!errors.name} {...register('name')} />
        <FormControl.Status />
        <FieldError message={errors.name?.message} />
      </FormControl>
      <FormControl
        appearance="box-grey"
        status={outcome(!!values.location, errors.location?.message)}
        initialValue={defaults.location}
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
          {...register('location')}
        />
        <FormControl.Status />
        <FieldError message={errors.location?.message} />
      </FormControl>
      <FormControl
        appearance="box-grey"
        status={outcome(!!values.bio, errors.bio?.message)}
        initialValue={defaults.bio}
        hideInitialStatus
      >
        <FormControl.Label htmlFor="bio">Bio</FormControl.Label>
        <FormControl.Textarea id="bio" placeholder="Bio" aria-invalid={!!errors.bio} {...register('bio')} />
        <FormControl.Status />
        <FieldError message={errors.bio?.message} />
      </FormControl>
      <FormControl
        appearance="box-grey"
        status={outcome(linksText.length > 0, linkError)}
        initialValue={linksToText(defaults.links)}
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
      <div className={cn('SettingsCredentialActions', styles.actions, isDirty && styles.actionsOpen)}>
        <FormButton
          disabled={!isDirty || !isValid || saving}
          tabIndex={isDirty ? 0 : -1}
          className="mb-20 h-40! w-160! leading-[40px]!"
        >
          Save
        </FormButton>
      </div>
    </form>
  )
}
