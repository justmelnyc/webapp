'use client'

import { usePathname } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { JoinForm } from '@/components/auth/join-form'
import { BackgroundImage } from '@/components/heroes/background-image'
import { HeroCredits } from '@/components/heroes/hero-credits'
import { isAuthenticationPath } from '@/components/layout/layout-routes'
import { DismissButton } from '@/components/ui/dismiss-button'
import { Modal } from '@/components/ui/modal'
import type { PageHeader } from '@/types/content'
import { responsiveUrl } from '@/utils/images'
import styles from './registration-dialog.module.css'

interface RegistrationDialogApi {
  /** The original's `onClickOpenRegistrationRequestDialog(trackPostfix)`. */
  open: (trackPostfix?: string) => void
}

const RegistrationDialogContext = createContext<RegistrationDialogApi | null>(null)

export const useRegistrationDialog = (): RegistrationDialogApi => {
  const value = useContext(RegistrationDialogContext)
  if (!value)
    throw new Error('useRegistrationDialog must be used inside <RegistrationDialogProvider>')
  return value
}

interface DialogProps {
  header: PageHeader
  onDismiss: () => void
}

/** The original's `RegistrationRequestDialog`: the join form over a hero photo, with its credits. */
const RegistrationDialog = ({ header, onDismiss }: DialogProps) => (
  <Modal label="Sign up" onDismiss={onDismiss}>
    <div className={`AuthenticationFormDialog inModal ${styles.dialog}`}>
      <BackgroundImage src={header.image?.hdpi?.url ?? responsiveUrl(header.image)} overlay={6} />
      <JoinForm invitationCode={null} invitationEmail={null} altLinkClassName={styles.alt} />
      {header.user && (
        <HeroCredits user={header.user} label="Posted by" className={styles.credits} />
      )}
      <DismissButton onClick={onDismiss} />
    </div>
  </Modal>
)

interface ProviderProps {
  /** The logged-out visitor's AUTHENTICATION page header (the original's `authPromo`); null when signed in. */
  header: PageHeader | null
  children: ReactNode
}

/**
 * Owner of the sign-up dialog that logged-out visitors get from SUBMIT, follow and subscribe buttons.
 * Like the original it never opens on the authentication pages or without a promo header.
 */
export const RegistrationDialogProvider = ({ header, children }: ProviderProps) => {
  const pathname = usePathname()
  const [isOpen, setOpen] = useState(false)
  const open = useCallback(() => {
    if (header && !isAuthenticationPath(pathname)) setOpen(true)
  }, [header, pathname])
  const close = useCallback(() => setOpen(false), [])
  const api = useMemo(() => ({ open }), [open])

  // Signing up (or following a link) navigates away: the dialog goes with the page.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false)
  }, [pathname])

  return (
    <RegistrationDialogContext value={api}>
      {children}
      {isOpen && header && <RegistrationDialog header={header} onDismiss={close} />}
    </RegistrationDialogContext>
  )
}
