'use client'

import { useState, useTransition } from 'react'
import { requestDataExport } from '@/actions/account-actions'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'
import styles from './settings-panels.module.css'

/** Hands the file to the browser's download manager without leaving the page. */
const download = (url: string): void => {
  const link = document.createElement('a')
  link.href = url
  link.download = ''
  document.body.append(link)
  link.click()
  link.remove()
}

/**
 * The original's "Request Export" button: once requested it is disabled and reads "Exported". Here the mock
 * builds the export on the spot, so the browser downloads it too.
 */
export const ExportDataButton = () => {
  const [exported, setExported] = useState(false)
  const [pending, startTransition] = useTransition()

  const onClick = (): void => {
    startTransition(async () => {
      const result = await requestDataExport()
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setExported(true)
      download(result.data.url)
    })
  }

  return (
    <button type="button" className={cn('SettingsButton', styles.button)} disabled={exported || pending} onClick={onClick}>
      {exported ? 'Exported' : 'Request Export'}
    </button>
  )
}
