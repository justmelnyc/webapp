'use client'

import { useState } from 'react'
import { MarkerIcon } from '@/components/icons'
import { Field } from '@/components/ui/field'
import { FormControl, type ControlStatus } from '@/components/ui/form-control'
import { DarkStage, GreyStage, Specimen, Stage, Variant } from './specimen'

const STATUSES: ReadonlyArray<{ status: ControlStatus; label: string; message?: string }> = [
  { status: 'indeterminate', label: 'indeterminate' },
  { status: 'request', label: 'request (checking)' },
  { status: 'success', label: 'success' },
  { status: 'failure', label: 'failure', message: 'That email is invalid.' },
]

/** FormControl in each appearance and status, and the lighter Field. */
export const FormSpecimens = () => {
  const [picked, setPicked] = useState('')
  return (
    <>
      <Specimen name="FormControl" about="The original's form control as parts: Label, Input or Textarea, Icon, Status, Message, Suggestions. Its 40px box sits on white (auth) or on grey (settings); the line and white looks are underlined.">
        {STATUSES.map(({ status, label, message }) => (
          <Variant key={status} label={`appearance="box", ${label}`}>
            <Stage>
              <FormControl appearance="box" status={status} initialValue={status === 'indeterminate' ? '' : 'ada@example.com'}>
                <FormControl.Label htmlFor={`sg-box-${status}`}>Email</FormControl.Label>
                <FormControl.Input id={`sg-box-${status}`} type="email" placeholder="Enter your email" defaultValue={status === 'indeterminate' ? '' : 'ada@example'} />
                <FormControl.Status />
                {message ? <FormControl.Message>{message}</FormControl.Message> : null}
              </FormControl>
            </Stage>
          </Variant>
        ))}
        <Variant label={'appearance="box-grey", with an Icon'}>
          <GreyStage>
            <FormControl appearance="box-grey" className="hasIcon">
              <FormControl.Icon>
                <MarkerIcon />
              </FormControl.Icon>
              <FormControl.Label htmlFor="sg-grey">Location</FormControl.Label>
              <FormControl.Input id="sg-grey" type="text" placeholder="Location" />
              <FormControl.Status />
            </FormControl>
          </GreyStage>
        </Variant>
        <Variant label={'appearance="box-grey", Textarea'}>
          <GreyStage>
            <FormControl appearance="box-grey">
              <FormControl.Label htmlFor="sg-bio">Bio</FormControl.Label>
              <FormControl.Textarea id="sg-bio" placeholder="Bio" />
            </FormControl>
          </GreyStage>
        </Variant>
        <Variant label={'appearance="line" (the default)'}>
          <Stage>
            <FormControl>
              <FormControl.Label htmlFor="sg-line">Name</FormControl.Label>
              <FormControl.Input id="sg-line" type="text" placeholder="Name" />
              <FormControl.Status />
            </FormControl>
          </Stage>
        </Variant>
        <Variant label={'appearance="white" (on black)'}>
          <DarkStage>
            <FormControl appearance="white">
              <FormControl.Label htmlFor="sg-white">Email</FormControl.Label>
              <FormControl.Input id="sg-white" type="email" placeholder="Enter email" />
              <FormControl.Status />
            </FormControl>
          </DarkStage>
        </Variant>
        <Variant label={`Suggestions${picked ? ` (picked ${picked})` : ''}`}>
          <Stage>
            <FormControl appearance="box" status="failure" initialValue="ada">
              <FormControl.Label htmlFor="sg-username">Username</FormControl.Label>
              <FormControl.Input id="sg-username" type="text" placeholder="Enter your username" defaultValue="ada" />
              <FormControl.Status />
              <FormControl.Suggestions suggestions={['ada-1', 'ada-lovelace', 'the-ada']} onPick={setPicked} />
            </FormControl>
          </Stage>
        </Variant>
      </Specimen>
      <Specimen name="Field" about="A lighter underlined field for small forms that need none of FormControl's state: Label, Input, Textarea, Error.">
        <Variant label="Input">
          <Stage>
            <Field>
              <Field.Label htmlFor="sg-field">Subject</Field.Label>
              <Field.Input id="sg-field" placeholder="Subject" />
            </Field>
          </Stage>
        </Variant>
        <Variant label="Invalid, with Error">
          <Stage>
            <Field>
              <Field.Label htmlFor="sg-field-bad">Subject</Field.Label>
              <Field.Input id="sg-field-bad" placeholder="Subject" aria-invalid="true" />
              <Field.Error>Tell them what it is about.</Field.Error>
            </Field>
          </Stage>
        </Variant>
        <Variant label="Textarea">
          <Stage>
            <Field>
              <Field.Label htmlFor="sg-field-text">Message</Field.Label>
              <Field.Textarea id="sg-field-text" placeholder="Message" />
            </Field>
          </Stage>
        </Variant>
      </Specimen>
    </>
  )
}
