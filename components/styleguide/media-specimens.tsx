'use client'

import { Avatar } from '@/components/ui/avatar'
import { AssetOriginProvider, Emoji } from '@/components/ui/emoji'
import { Spinner } from '@/components/ui/spinner'
import { Inline, Specimen, Stage, Variant } from './specimen'

interface MediaSpecimensProps {
  /** Where the emoji images live (the API origin). */
  assetOrigin: string
  /** A picture for the avatars (the viewer's own when logged in). */
  avatarUrl: string
}

const SIZES = [30, 40, 64, 120] as const

/** Avatar, Emoji and Spinner. */
export const MediaSpecimens = ({ assetOrigin, avatarUrl }: MediaSpecimensProps) => (
  <>
    <Specimen name="Avatar" about="A round picture, grey while it is blank. Without a size it is the original's responsive one (30px, 40px from 60em); it becomes a link with href or a button with onClick, and then lightens on hover.">
      <Variant label="Responsive size, blank and with a picture">
        <Stage>
          <Inline>
            <Avatar src={null} name="Nobody" />
            <Avatar src={avatarUrl} name="Somebody" />
          </Inline>
        </Stage>
      </Variant>
      <Variant label={`size: ${SIZES.join(', ')}`}>
        <Stage>
          <Inline>
            {SIZES.map((size) => (
              <Avatar key={size} src={avatarUrl} name="Somebody" size={size} />
            ))}
          </Inline>
        </Stage>
      </Variant>
      <Variant label="As a link and as a button">
        <Stage>
          <Inline>
            <Avatar src={avatarUrl} name="Somebody" size={40} href="/styleguide#primitives" aria-label="A link" />
            <Avatar src={avatarUrl} name="Somebody" size={40} onClick={() => undefined} aria-label="A button" />
          </Inline>
        </Stage>
      </Variant>
    </Specimen>
    <Specimen name="Emoji" about="A 20px emoji from the API's set, by name.">
      <Variant label="v, +1, heart">
        <Stage>
          <AssetOriginProvider value={assetOrigin}>
            <Inline>
              <Emoji name="v" />
              <Emoji name="+1" />
              <Emoji name="heart" />
            </Inline>
          </AssetOriginProvider>
        </Stage>
      </Variant>
    </Specimen>
    <Specimen name="Spinner" about="A small loading indicator in the greys, for places that have no skeleton of their own.">
      <Variant label="Loading">
        <Stage>
          <Spinner />
        </Stage>
      </Variant>
    </Specimen>
  </>
)
