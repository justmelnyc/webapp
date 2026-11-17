import type { ReactNode } from 'react'
import { BackgroundImage } from '@/components/heroes/background-image'
import { HeroCredits } from '@/components/heroes/hero-credits'
import type { PageHeader } from '@/types/content'
import { responsiveUrl } from '@/utils/images'
import styles from './auth.module.css'

const APPLE_STORE = 'https://itunes.apple.com/app/apple-store/id953614327?pt=117139389&ct=webapp&mt=8'
const GOOGLE_PLAY = 'https://play.google.com/store/apps/details?id=co.ello.ElloApp'

const AppStores = () => (
  <div className={styles.stores}>
    <a className={styles.store} href={APPLE_STORE} rel="noopener noreferrer" target="_blank">
      <span className="sr-only">Apple Store</span>
    </a>
    <a className={`${styles.store} ${styles.google}`} href={GOOGLE_PLAY} rel="noopener noreferrer" target="_blank">
      <span className="sr-only">Google Play Store</span>
    </a>
  </div>
)

/** The original's `HeroPromotionAuth`: a fixed full screen photo with credits and app store links. */
const AuthHero = ({ header }: { header: PageHeader | null }) => (
  <div className={`Hero ${styles.hero}`}>
    <BackgroundImage src={header ? responsiveUrl(header.image) : null} overlay={4} />
    {header?.user && <HeroCredits user={header.user} />}
    <AppStores />
  </div>
)

interface AuthViewProps {
  header: PageHeader | null
  children: ReactNode
}

/** `MainView.Authentication > .AuthenticationFormDialog` over the hero photo (/enter and /join). */
export const AuthView = ({ header, children }: AuthViewProps) => (
  <>
    <AuthHero header={header} />
    <div className={`Authentication ${styles.authentication}`}>
      <div className={`AuthenticationFormDialog ${styles.dialog}`}>{children}</div>
    </div>
  </>
)
