'use client'

import { useState } from 'react'
import { DeleteAccountDialog } from '@/components/settings/delete-account-dialog'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'
import styles from './settings-panels.module.css'

/** The original's Delete button. The mock API never deletes accounts: confirming only says so. */
export const DeleteAccountButton = () => {
  const [open, setOpen] = useState(false)

  const onConfirm = (): void => {
    setOpen(false)
    toast.info('The mock API does not delete accounts, so your account was not deleted.')
  }

  return (
    <>
      <button type="button" className={cn('SettingsButton asDangerous', styles.button, styles.dangerous)} onClick={() => setOpen(true)}>
        Delete
      </button>
      {open ? <DeleteAccountDialog onConfirm={onConfirm} onDismiss={() => setOpen(false)} /> : null}
    </>
  )
}
