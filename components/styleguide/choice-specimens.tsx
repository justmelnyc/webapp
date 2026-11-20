'use client'

import { useState } from 'react'
import { CategoryOptionButton, OptionButton } from '@/components/ui/option-button'
import { ToggleControl } from '@/components/ui/toggle-control'
import { Inline, Specimen, Stage, Variant } from './specimen'

const CATEGORIES = ['Art', 'Design', 'Photography'] as const

const toggle = (names: readonly string[], name: string): string[] =>
  names.includes(name) ? names.filter((existing) => existing !== name) : [...names, name]

/** The Yes / No toggle and the option buttons (click them: they are live). */
export const ChoiceSpecimens = () => {
  const [on, setOn] = useState(true)
  const [artist, setArtist] = useState(true)
  const [made, setMade] = useState<string[]>(['Design'])
  return (
    <>
      <Specimen name="ToggleControl" about="A Yes / No preference around a real checkbox. Settings uses it as it is; onboarding restyles it from its own module into a big button, and passes a check or an X as its child to draw before the text.">
        <Variant label={on ? 'Checked' : 'Unchecked'}>
          <Stage>
            <ToggleControl id="sg-toggle" checked={on} onChange={setOn} />
          </Stage>
        </Variant>
        <Variant label="Unchecked / checked, disabled">
          <Stage>
            <Inline>
              <ToggleControl id="sg-toggle-off" checked={false} disabled onChange={() => undefined} />
              <ToggleControl id="sg-toggle-on" checked disabled onChange={() => undefined} />
            </Inline>
          </Stage>
        </Variant>
      </Specimen>
      <Specimen name="OptionButton, CategoryOptionButton" about="Outlined choices that turn black once picked: two to a row for one-of-two, three to a row (from 26.25em) for pick-any. From the creator type picker of settings and onboarding.">
        <Variant label="OptionButton (the picked one is disabled)">
          <Stage>
            <div>
              <OptionButton active={artist} disabled={artist} onClick={() => setArtist(true)}>
                An Artist
              </OptionButton>
              <OptionButton active={!artist} disabled={!artist} onClick={() => setArtist(false)}>
                A Fan
              </OptionButton>
            </div>
          </Stage>
        </Variant>
        <Variant label="CategoryOptionButton">
          <Stage>
            <div>
              {CATEGORIES.map((name) => (
                <CategoryOptionButton key={name} active={made.includes(name)} onClick={() => setMade(toggle(made, name))}>
                  {name}
                </CategoryOptionButton>
              ))}
            </div>
          </Stage>
        </Variant>
      </Specimen>
    </>
  )
}
