'use client'

import { useState } from 'react'
import { deleteAccount } from '@/actions/account-actions'
import { DeleteAccountDialog } from '@/components/settings/delete-account-dialog'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'
import styles from './settings-panels.module.css'

/** The original's Delete button: confirming deletes the account, then the action sends you to the homepage. */
export const DeleteAccountButton = () => {
  const [open, setOpen] = useState(false)

  const onConfirm = (): void => {
    void deleteAccount().then((result) => {
      if (result?.ok === false) {
        setOpen(false)
        toast.error(result.error)
      }
    })
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
