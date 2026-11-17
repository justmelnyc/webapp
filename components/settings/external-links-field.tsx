'use client'

import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { Field } from '@/components/ui/field'
import { OutlineButton, TextButton } from '@/components/ui/button'
import type { ProfileInput } from '@/lib/schemas/profile'

interface ExternalLinksFieldProps {
  control: Control<ProfileInput>
  register: UseFormRegister<ProfileInput>
  errors: FieldErrors<ProfileInput>
}

export const ExternalLinksField = ({ control, register, errors }: ExternalLinksFieldProps) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'links' })
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-slate mb-1.5 text-xs tracking-wide uppercase">Links</legend>
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-col gap-1">
          <div className="flex items-start gap-2">
            <Field className="flex-1">
              <Field.Input
                aria-label={`Link ${index + 1} URL`}
                placeholder="https://"
                aria-invalid={!!errors.links?.[index]?.url}
                {...register(`links.${index}.url`)}
              />
            </Field>
            <Field className="flex-1">
              <Field.Input
                aria-label={`Link ${index + 1} label`}
                placeholder="Label (optional)"
                {...register(`links.${index}.text`)}
              />
            </Field>
            <TextButton onClick={() => remove(index)} aria-label={`Remove link ${index + 1}`} className="py-3">
              Remove
            </TextButton>
          </div>
          <Field.Error>{errors.links?.[index]?.url?.message}</Field.Error>
        </div>
      ))}
      <Field.Error>{errors.links?.message ?? errors.links?.root?.message}</Field.Error>
      <div>
        <OutlineButton onClick={() => append({ url: '', text: '' })} disabled={fields.length >= 10}>
          Add a link
        </OutlineButton>
      </div>
    </fieldset>
  )
}
