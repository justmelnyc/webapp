'use client'

import { useRouter } from 'next/navigation'
import { useState, type ChangeEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { saveInfo } from '@/actions/profile-actions'
import { outcome } from '@/components/settings/field-status'
import type { ControlStatus } from '@/components/ui/form-control'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { infoSchema, type InfoInput } from '@/lib/schemas/profile'
import { toast } from '@/stores/toast-store'

type Link = InfoInput['links'][number]
export type InfoField = 'name' | 'location' | 'bio' | 'links'

/** The original's InfoForm saves 300ms after the last keystroke. */
const SAVE_DELAY = 300

/** The original's Links control is one text field of URLs separated by commas or spaces. */
export const linksToText = (links: Link[]): string => links.map((link) => link.url).join(' ')

export const textToLinks = (text: string, known: Link[]): Link[] =>
  text
    .split(/[,\s]+/)
    .filter(Boolean)
    .map((url) => ({ url, text: known.find((link) => link.url === url)?.text ?? '' }))

/**
 * The state of the original's `InfoForm`: name, location, bio and links save by themselves while you type. A control
 * shows the spinner while its change is waiting to be saved, then a check (or nothing when it is empty).
 */
export const useInfoForm = (defaults: InfoInput) => {
  const router = useRouter()
  const [initial] = useState(defaults)
  const [pending, setPending] = useState<ReadonlySet<InfoField>>(new Set())
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

  const queueSave = (field: InfoField): void => {
    setPending((current) => new Set(current).add(field))
    saveSoon()
  }

  const status = (field: InfoField, hasValue: boolean, error: string | undefined): ControlStatus => {
    if (error) return 'failure'
    return pending.has(field) && hasValue ? 'request' : outcome(hasValue, undefined)
  }

  const onChangeLinks = (event: ChangeEvent<HTMLInputElement>): void => {
    setLinksText(event.target.value)
    setValue('links', textToLinks(event.target.value, knownLinks), { shouldDirty: true, shouldValidate: true })
    queueSave('links')
  }

  return { initial, register, errors, values, linksText, linkError, status, queueSave, onChangeLinks }
}
