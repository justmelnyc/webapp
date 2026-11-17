'use client'

import { useRef, type ChangeEvent, type ReactNode } from 'react'
import { ACCEPTED_IMAGE_TYPES } from '@/constants/upload'

interface ImagePickerProps {
  onPick: (file: File) => void
  label: string
  disabled?: boolean
  className?: string
  children: ReactNode
}

/** A button-like wrapper that opens the file dialog; children are what you click. */
export const ImagePicker = ({ onPick, label, disabled, className, children }: ImagePickerProps) => {
  const input = useRef<HTMLInputElement>(null)
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) onPick(file)
  }
  return (
    <>
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={() => input.current?.click()}
        className={className}
      >
        {children}
      </button>
      <input
        ref={input}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={onChange}
        tabIndex={-1}
      />
    </>
  )
}
