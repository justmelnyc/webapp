'use client'

import { useRouter } from 'next/navigation'
import { ElloOutlineMark } from '@/components/icons'
import { Uploader } from '@/components/settings/uploader'
import { useImageUpload } from '@/hooks/use-image-upload'
import { ONBOARDING_ROUTES } from '@/constants/onboarding'
import type { InfoInput } from '@/lib/schemas/profile'
import { cn } from '@/utils/cn'
import { OnboardingInfoForm } from './onboarding-info-form'
import { OnboardingDone, OnboardingNavbar, OnboardingNext } from './onboarding-navbar'
import { OnboardingTitle, OnboardingView } from './onboarding-view'
import styles from './settings.module.css'

interface SettingsStepProps {
  avatarUrl: string | null
  coverUrl: string | null
  /** The profile's `has_avatar_present` / `has_cover_image_present`: only then is the picker not "blank". */
  hasAvatar: boolean
  hasCover: boolean
  info: InfoInput
}

/** The original's `selectIsInfoFormBlank`. */
export const isInfoBlank = ({ name, bio, links }: InfoInput): boolean => !name && !bio && links.length === 0

/** `/onboarding/settings`: header image, avatar and the info form, with "I'm Done" once something is filled in. */
export const SettingsStep = ({ avatarUrl, coverUrl, hasAvatar, hasCover, info }: SettingsStepProps) => {
  const router = useRouter()
  const cover = useImageUpload('cover')
  const avatar = useImageUpload('avatar')
  // A local preview counts as an image, like the original's `tmp`.
  const avatarSrc = avatar.preview ?? avatarUrl
  const coverSrc = cover.preview ?? coverUrl
  const avatarBlank = !avatar.preview && !(hasAvatar && avatarUrl)
  const coverBlank = !cover.preview && !(hasCover && coverUrl)
  const nextDisabled = avatarBlank && coverBlank && isInfoBlank(info)

  return (
    <OnboardingView className={styles.main}>
      <OnboardingTitle text1="Grow your creative influence. " text2="Completed profiles get way more views." />
      <div className={styles.cover}>
        <Uploader
          variant="plain"
          className={cn('isCoverUploader', coverBlank && 'isCoverImageBlank', styles.coverUploader)}
          title="Upload Header"
          lines={['2560 x 1440', 'Animated Gifs work too', 'Drag & Drop']}
          onPick={(file) => void cover.upload(file)}
          disabled={cover.busy}
          isBlank={coverBlank}
        />
        <div className={cn('BackgroundImage hasOverlay6 inOnboarding', styles.coverImage)} style={coverSrc ? { backgroundImage: `url("${coverSrc}")` } : undefined} />
      </div>
      <div className={cn('OnboardingAvatarPicker', styles.avatar)}>
        <Uploader
          variant="plain"
          className={cn('isAvatarUploader isXLUploader', avatarBlank && 'isAvatarBlank', styles.avatarUploader, avatarBlank && styles.blank)}
          title="Upload Avatar"
          lines={['360 x 360', 'Animated Gifs work too', 'Drag & Drop']}
          onPick={(file) => void avatar.upload(file)}
          disabled={avatar.busy}
          isBlank={avatarBlank}
        />
        {avatarBlank ? <ElloOutlineMark /> : null}
        {avatarBlank ? null : (
          <div className={cn('Avatar isXLarge', styles.avatarImage)} style={avatarSrc ? { backgroundImage: `url("${avatarSrc}")` } : undefined} />
        )}
      </div>
      <OnboardingInfoForm defaults={info} className={styles.form} />
      <OnboardingNavbar>
        <OnboardingNext disabled={nextDisabled} onClick={() => router.push(ONBOARDING_ROUTES.collaborate)}>
          Get Hired &amp; Collaborate
        </OnboardingNext>
        {nextDisabled ? null : <OnboardingDone onClick={() => router.push(ONBOARDING_ROUTES.done)} />}
      </OnboardingNavbar>
    </OnboardingView>
  )
}
