import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CreatorTypeStep } from '@/components/onboarding/creator-type-step'
import { ONBOARDING_VERSION } from '@/constants/onboarding'
import { requireSession } from '@/lib/require-session'
import { getCreatorTypes } from '@/services/settings'
import { getViewer } from '@/services/viewer'

export const metadata: Metadata = { title: 'Welcome' }

const CreatorTypePage = async () => {
  await requireSession('/onboarding/creator-type')
  const [viewer, creatorTypes] = await Promise.all([getViewer(), getCreatorTypes()])
  // Like the original's `onEnter`: whoever finished onboarding goes home.
  if (viewer?.webOnboardingVersion === ONBOARDING_VERSION) redirect('/')
  return <CreatorTypeStep {...creatorTypes} />
}

export default CreatorTypePage
