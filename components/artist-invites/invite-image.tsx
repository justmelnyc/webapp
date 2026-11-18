import { BackgroundImage } from '@/components/heroes/background-image'
import type { ArtistInvite } from '@/types/artist-invite'
import { responsiveUrl } from '@/utils/images'
import styles from './artist-invite.module.css'

/** The header photo (tinted) with the invite's logo centered over it. */
export const InviteImage = ({ invite }: { invite: ArtistInvite }) => {
  const logo = invite.logoImage.optimized?.url
  return (
    <div className={styles.image}>
      <BackgroundImage src={responsiveUrl(invite.headerImage)} overlay={3} />
      {/* eslint-disable-next-line @next/next/no-img-element -- the logo keeps its natural size, capped by CSS */}
      {logo && <img className={styles.logo} alt="" src={logo} />}
    </div>
  )
}
