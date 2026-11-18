'use client'

import { XIcon } from '@/components/icons'
import { useToastStore, type Toast } from '@/stores/toast-store'
import styles from './toaster.module.css'

interface ToastAlertProps {
  toast: Toast
  onDismiss: () => void
}

/** The original's Alert: black box, `Dialog` inside (h2 title, p body, white X top right). */
const ToastAlert = ({ toast, onDismiss }: ToastAlertProps) => (
  <div role={toast.kind === 'error' ? 'alert' : 'status'} className={`Alert isActive ${styles.alert}`} onClick={onDismiss}>
    <div className={styles.dialog}>
      {toast.title ? <h2>{toast.title}</h2> : null}
      {toast.title ? <p>{toast.message}</p> : <h2>{toast.message}</h2>}
      <button
        type="button"
        aria-label="Dismiss"
        className={styles.dismiss}
        onClick={(e) => {
          e.stopPropagation()
          onDismiss()
        }}
      >
        <XIcon />
      </button>
    </div>
  </div>
)

export const Toaster = () => {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)
  return (
    <div aria-live="polite" className={styles.alerts}>
      {toasts.map((t) => (
        <ToastAlert key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  )
}
