'use client'

import { useRouter } from 'next/navigation'
import { useState, type ChangeEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { saveInfo } from '@/actions/profile-actions'
import { MarkerIcon } from '@/components/icons'
import { FieldError, outcome } from '@/components/settings/field-status'
import { FormControl, type ControlStatus } from '@/components/ui/form-control'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { infoSchema, type InfoInput } from '@/lib/schemas/profile'
import { toast } from '@/stores/toast-store'

interface InfoFormProps {
  defaults: InfoInput
}

type Link = InfoInput['links'][number]
type Field = 'name' | 'location' | 'bio' | 'links'

/** The original's InfoForm saves 300ms after the last keystroke. */
const SAVE_DELAY = 300

/** The original's Links control is one text field of URLs separated by commas or spaces. */
const linksToText = (links: Link[]): string => links.map((link) => link.url).join(' ')

const textToLinks = (text: string, known: Link[]): Link[] =>
  text
    .split(/[,\s]+/)
    .filter(Boolean)
    .map((url) => ({ url, text: known.find((link) => link.url === url)?.text ?? '' }))

/**
 * The original's `InfoForm`: name, location, bio and links save by themselves while you type. A control shows
 * the spinner while its change is waiting to be saved, then a check (or nothing when it is empty).
 */
export const InfoForm = ({ defaults }: InfoFormProps) => {
  const router = useRouter()
  const [initial] = useState(defaults)
  const [pending, setPending] = useState<ReadonlySet<Field>>(new Set())
  const [linksText, setLinksText] = useState(linksToText(defaults.links))
  const [knownLinks, setKnownLinks] = useState(defaults.links)
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<InfoInput>({ resolver: zodResolver(infoSchema), mode: 'onChange', defaultValues: defaults })
  const values = useWatch({ control })
  const linkError =
    errors.links?.message ?? errors.links?.root?.message ?? errors.links?.find?.((l) => l?.url)?.url?.message

  const onValid = async (input: InfoInput): Promise<void> => {
    const result = await saveInfo(input)
    setPending(new Set())
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setKnownLinks(input.links)
    router.refresh()
  }

  const saveSoon = useDebouncedCallback(() => {
    void handleSubmit(onValid, () => setPending(new Set()))()
  }, SAVE_DELAY)

  const queueSave = (field: Field): void => {
    setPending((current) => new Set(current).add(field))
    saveSoon()
  }

  const status = (field: Field, hasValue: boolean, error: string | undefined): ControlStatus => {
    if (error) return 'failure'
    return pending.has(field) && hasValue ? 'request' : outcome(hasValue, undefined)
  }

  const onChangeLinks = (event: ChangeEvent<HTMLInputElement>): void => {
    setLinksText(event.target.value)
    setValue('links', textToLinks(event.target.value, knownLinks), { shouldDirty: true, shouldValidate: true })
    queueSave('links')
  }

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
