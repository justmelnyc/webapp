import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AvatarUploader } from '@/components/settings/avatar-uploader'
import { CoverUploader } from '@/components/settings/cover-uploader'
import { PreferenceToggles } from '@/components/settings/preference-toggles'
import { ProfileForm } from '@/components/settings/profile-form'
import styles from '@/components/settings/settings.module.css'
import { YourData } from '@/components/settings/your-data'
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
  const links = viewer.externalLinksList ?? []
  return (
    <div className={`Settings ${styles.settings}`}>
      <CoverUploader src={cover?.hdpi?.url ?? cover?.optimized?.url ?? cover?.original?.url} />
      <div className={`SettingsBody ${styles.body}`}>
        <AvatarUploader src={avatar?.large?.url ?? avatar?.regular?.url ?? avatar?.original?.url} name={viewer.username} />
        <div className={`SettingsRight ${styles.right}`}>
          <header className={`SettingsHeader ${styles.header}`}>
            <h1 className={`SettingsHeading ${styles.heading}`}>Profile</h1>
            <p>
              Your username, name, bio and links appear on your public Ello profile. Your email address remains
              private.
            </p>
          </header>
          <ProfileForm
            key={`${viewer.username}-${viewer.email ?? ''}`}
            defaults={{
              name: viewer.name ?? '',
              username: viewer.username,
              email: viewer.email ?? '',
              bio: viewer.shortBio ?? '',
              location: viewer.location ?? '',
              links: links.map((l) => ({ url: l.url, text: l.text ?? '' })),
            }}
          />
          <p className={`SettingsLinks ${styles.links}`}>
            <Link className={styles.link} href={`/${viewer.username}`}>
              View profile
            </Link>
            <Link className={styles.link} href="/invites">
              Invite people
            </Link>
          </p>
          <div className={`SettingsPreferences ${styles.preferences}`}>
            <PreferenceToggles sections={sections} />
            <YourData
              username={viewer.username}
              name={viewer.name}
              bio={viewer.shortBio}
              links={links}
              avatarUrl={avatar?.original?.url}
              coverUrl={cover?.original?.url}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
