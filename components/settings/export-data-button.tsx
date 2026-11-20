'use client'

import { useState } from 'react'
import { requestDataExport } from '@/actions/account-actions'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'
import styles from './settings-panels.module.css'

const isSafeUrl = (url: string): boolean => /^https?:\/\//i.test(url)

/**
 * The original's "Request Export" button: clicking disables it and makes it read "Exported"; once the API has
 * answered with the export's address (`profile.dataExport`), a "Download Export" link takes its place.
 */
export const ExportDataButton = () => {
  const [requested, setRequested] = useState(false)
  const [url, setUrl] = useState<string | null>(null)

  const onClick = async (): Promise<void> => {
    setRequested(true)
    const result = await requestDataExport()
    if (!result.ok) {
      setRequested(false)
      toast.error(result.error)
      return
    }
    if (isSafeUrl(result.data.url)) setUrl(result.data.url)
  }

  if (url) {
    return (
      <a className={cn('SettingsButton', styles.button)} href={url} rel="noopener noreferrer" target="_blank">
        Download Export
      </a>
    )
  }

  return (
    <button type="button" className={cn('SettingsButton', styles.button)} disabled={requested} onClick={onClick}>
      {requested ? 'Exported' : 'Request Export'}
    </button>
  )
}
