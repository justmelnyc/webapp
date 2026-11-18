'use client'

import type { MouseEvent, ReactElement } from 'react'
import {
  FacebookIcon,
  GooglePlusIcon,
  LinkedInIcon,
  MailIcon,
  PinterestIcon,
  RedditIcon,
  TumblrIcon,
  TwitterIcon,
  XIcon,
} from '@/components/icons'
import { Modal } from '@/components/ui/modal'
import { SHARE_DIMENSIONS, shareUrl, type ShareContent, type ShareType } from '@/utils/share'
import styles from './share-dialog.module.css'

const BUTTONS: { type: ShareType; label: string; icon: ReactElement }[] = [
  { type: 'email', label: 'Email', icon: <MailIcon /> },
  { type: 'facebook', label: 'Facebook', icon: <FacebookIcon /> },
  { type: 'twitter', label: 'Twitter', icon: <TwitterIcon /> },
  { type: 'pinterest', label: 'Pinterest', icon: <PinterestIcon /> },
  { type: 'google+', label: 'Google+', icon: <GooglePlusIcon /> },
  { type: 'tumblr', label: 'Tumblr', icon: <TumblrIcon /> },
  { type: 'reddit', label: 'Reddit', icon: <RedditIcon /> },
  { type: 'linkedin', label: 'LinkedIn', icon: <LinkedInIcon /> },
]

/** `onClickOpenShareWindow`: mail opens the mail client, the rest a centered pop-up window. */
const openShare = (type: ShareType, content: ShareContent): void => {
  const url = shareUrl(type, content)
  if (type === 'email') {
    window.location.href = url
    return
  }
  const { width, height } = SHARE_DIMENSIONS[type]
  const left = window.innerWidth / 2 - width / 2
  const top = window.innerHeight / 2 - height / 2
  window.open(
    url,
    'sharewindow',
    `width=${width}, height=${height}, left=${left}, top=${top}, toolbar=0, location=0, menubar=0, directories=0, scrollbars=0`,
  )
}

interface ShareDialogProps {
  content: ShareContent
  onDismiss: () => void
}

/** The original's `ShareDialog`: the link in a read-only field and one button per channel. */
export const ShareDialog = ({ content, onDismiss }: ShareDialogProps) => (
  <Modal label="Share" onDismiss={onDismiss}>
    <div className={styles.dialog}>
      <input
        className={styles.control}
        type="url"
        readOnly
        aria-label="Link"
        value={content.link}
        onClick={(e: MouseEvent<HTMLInputElement>) => e.currentTarget.select()}
      />
      <div className={styles.links}>
        {BUTTONS.map(({ type, label, icon }) => (
          <button key={type} type="button" className={styles.link} aria-label={label} onClick={() => openShare(type, content)}>
            {icon}
          </button>
        ))}
      </div>
      <button type="button" className={`CloseModal ${styles.dismiss}`} aria-label="Close" onClick={onDismiss}>
        <XIcon />
      </button>
    </div>
  </Modal>
)
