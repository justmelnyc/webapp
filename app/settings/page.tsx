import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PreferenceToggles } from '@/components/settings/preference-toggles'
import { ProfileForm } from '@/components/settings/profile-form'
import { ProfileImages } from '@/components/settings/profile-images'
import { requireSession } from '@/lib/require-session'
import { getPreferenceSections } from '@/services/settings'
import { getViewer } from '@/services/viewer'

export const metadata: Metadata = { title: 'Settings' }

const SettingsPage = async () => {
  await requireSession('/settings')
  const [viewer, sections] = await Promise.all([getViewer(), getPreferenceSections()])
  if (!viewer) redirect('/enter?next=%2Fsettings')

  const cover = viewer.coverImage
  const avatar = viewer.avatar
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-8">
      <h1 className="text-2xl">Settings</h1>
      <ProfileImages
        coverSrc={cover?.hdpi?.url ?? cover?.optimized?.url ?? cover?.original?.url}
        avatarSrc={avatar?.large?.url ?? avatar?.regular?.url ?? avatar?.original?.url}
        name={viewer.username}
      />
      <section className="flex flex-col gap-4">
        <h2 className="text-lg">Profile</h2>
        <ProfileForm
          key={`${viewer.username}-${viewer.email ?? ''}`}
          defaults={{
            name: viewer.name ?? '',
            username: viewer.username,
            email: viewer.email ?? '',
            bio: viewer.shortBio ?? '',
            location: viewer.location ?? '',
            links: (viewer.externalLinksList ?? []).map((l) => ({ url: l.url, text: l.text ?? '' })),
          }}
        />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-lg">Preferences</h2>
        <PreferenceToggles sections={sections} />
      </section>
    </main>
  )
}

export default SettingsPage
