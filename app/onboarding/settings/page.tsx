import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { SettingsStep } from '@/components/onboarding/settings-step'
import { requireSession } from '@/lib/require-session'
import { getViewer } from '@/services/viewer'

export const metadata: Metadata = { title: 'Welcome' }

const SettingsPage = async () => {
  await requireSession('/onboarding/settings')
  const viewer = await getViewer()
  if (!viewer) redirect('/enter?next=%2Fonboarding%2Fsettings')
  const avatar = viewer.avatar
  const cover = viewer.coverImage
  return (
    <SettingsStep
      avatarUrl={avatar?.large?.url ?? avatar?.regular?.url ?? avatar?.original?.url ?? null}
      coverUrl={cover?.hdpi?.url ?? cover?.optimized?.url ?? cover?.original?.url ?? null}
      hasAvatar={viewer.hasAvatarPresent === true}
      hasCover={viewer.hasCoverImagePresent === true}
      info={{
        name: viewer.name ?? '',
        bio: viewer.shortBio ?? '',
        location: viewer.location ?? '',
        links: (viewer.externalLinksList ?? []).map((link) => ({ url: link.url, text: link.text ?? '' })),
      }}
    />
  )
}

export default SettingsPage
