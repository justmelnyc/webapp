import { Button, FormButton, FormButtonSquare, GreenButton, OutlineButton, TextButton } from '@/components/ui/button'
import { BlackBorderRoundedRect, GreenBorderRoundedRect, GreenRoundedRect, GreenXLRoundedRect } from '@/components/ui/rounded-rect'
import { Inline, Specimen, Stage, Variant } from './specimen'

/** The buttons of components/ui/button.tsx and rounded-rect.tsx, at rest and disabled (hover them). */
export const ButtonSpecimens = () => (
  <>
    <Specimen name="Button, GreenButton, OutlineButton, TextButton" about="The 40px action buttons of the editor bar: black for the main action, green to submit, the outline for a quiet call to action and plain text to cancel. They size to their label.">
      <Variant label="At rest">
        <Stage>
          <Inline>
            <Button>Post</Button>
            <GreenButton>Submit</GreenButton>
            <OutlineButton>Find people</OutlineButton>
            <TextButton>Cancel</TextButton>
          </Inline>
        </Stage>
      </Variant>
      <Variant label="Disabled">
        <Stage>
          <Inline>
            <Button disabled>Post</Button>
            <GreenButton disabled>Submit</GreenButton>
            <OutlineButton disabled>Find people</OutlineButton>
          </Inline>
        </Stage>
      </Variant>
    </Specimen>
    <Specimen name="FormButton, FormButtonSquare" about="The 60px submit button of a form, as wide as the form. Rounded in the auth and settings forms, square where it closes a dialog.">
      <Variant label="FormButton">
        <Stage>
          <FormButton type="button">Log in</FormButton>
        </Stage>
      </Variant>
      <Variant label="FormButton, disabled">
        <Stage>
          <FormButton type="button" disabled>
            Log in
          </FormButton>
        </Stage>
      </Variant>
      <Variant label="FormButtonSquare">
        <Stage>
          <FormButtonSquare type="button">Add</FormButtonSquare>
        </Stage>
      </Variant>
    </Specimen>
    <Specimen name="GreenRoundedRect, GreenBorderRoundedRect, BlackBorderRoundedRect, GreenXLRoundedRect" about="The original's RoundedRect: 40px, 12px text, full width up to 235px. Used on artist invites; the XL one is the big Submit.">
      <Variant label="Green">
        <Stage>
          <GreenRoundedRect>Submit</GreenRoundedRect>
        </Stage>
      </Variant>
      <Variant label="Green border">
        <Stage>
          <GreenBorderRoundedRect>See submissions</GreenBorderRoundedRect>
        </Stage>
      </Variant>
      <Variant label="Black border (40% opaque)">
        <Stage>
          <BlackBorderRoundedRect>Closed</BlackBorderRoundedRect>
        </Stage>
      </Variant>
      <Variant label="Green XL">
        <Stage>
          <GreenXLRoundedRect>Submit</GreenXLRoundedRect>
        </Stage>
      </Variant>
    </Specimen>
  </>
)
