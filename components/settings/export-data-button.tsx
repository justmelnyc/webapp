'use client'

import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'
import styles from './settings-panels.module.css'

/** The original's "Request Export" button. The mock API has no data export, so it only says so. */
export const ExportDataButton = () => (
  <button
    type="button"
    className={cn('SettingsButton', styles.button)}
    onClick={() => toast.info('Data exports are not available in the mock API.')}
  >
    Request Export
  </button>
)
