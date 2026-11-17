'use client'

import { useEffect, useRef, type ComponentProps, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/utils/cn'
import styles from './modal.module.css'

interface ModalProps {
  onDismiss: () => void
  label: string
  className?: string
  children: ReactNode
}

/** The original's `isDangerZone` scrim (account deletion, blocking): pass as `className`. */
export const dangerZone = styles.dangerZone

/**
 * The original's `Modal` kind (ModalContainer): a full screen scrim with the dialog centered in it.
 * Clicking the scrim or pressing Escape dismisses; the page behind stops scrolling (`isModalActive`).
 */
export const Modal = ({ onDismiss, label, className, children }: ModalProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    document.body.classList.add('isModalActive')
    ref.current?.focus()
    return () => {
      document.body.classList.remove('isModalActive')
      previous?.focus()
    }
  }, [])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key !== 'Escape') return
    e.stopPropagation()
    onDismiss()
  }

  const onClick = (e: MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) onDismiss()
  }

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      className={cn('Modal isActive', styles.modal, className)}
      onKeyDown={onKeyDown}
      onClick={onClick}
    >
      {children}
    </div>,
    document.body,
  )
}

export const ModalDialog = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn(styles.dialog, className)} {...props} />
)

export const ModalHeading = ({ className, ...props }: ComponentProps<'h2'>) => (
  <h2 className={cn(styles.heading, className)} {...props} />
)

export const ModalButton = ({ className, type = 'button', ...props }: ComponentProps<'button'>) => (
  <button type={type} className={cn(styles.button, className)} {...props} />
)
