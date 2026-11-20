import { ButtonSpecimens } from './button-specimens'
import { ChoiceSpecimens } from './choice-specimens'
import { DialogSpecimens } from './dialog-specimens'
import { FormSpecimens } from './form-specimens'
import { GuideIntro, GuideSection } from './guide-section'
import { MediaSpecimens } from './media-specimens'
import { PostSpecimens } from './post-specimens'

interface PrimitiveSectionProps {
  assetOrigin: string
  avatarUrl: string
}

/** Every primitive of components/ui in each variant and state, then the shared pieces of posts, editors and heroes. They are live: hover, focus and click them. */
export const PrimitiveSection = ({ assetOrigin, avatarUrl }: PrimitiveSectionProps) => (
  <GuideSection id="primitives" title="Primitives">
    <GuideIntro>
      The shared components of <code>components/ui</code>. Reach for one of these before writing a new button, field or
      dialog; if a page needs it to look different, override it from the page&rsquo;s own CSS module.
    </GuideIntro>
    <ButtonSpecimens />
    <FormSpecimens />
    <ChoiceSpecimens />
    <DialogSpecimens />
    <MediaSpecimens assetOrigin={assetOrigin} avatarUrl={avatarUrl} />
    <PostSpecimens avatarUrl={avatarUrl} />
  </GuideSection>
)
