'use client'

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { ACCEPTED_IMAGE_TYPES } from '@/constants/upload'
import { cn } from '@/utils/cn'
import uploaderStyles from './settings-uploader.module.css'

interface UploaderProps {
  /** `coverUploader` or `avatarUploader` layout from settings.module.css */
  variant: 'cover' | 'avatar'
  title: string
  lines: string[]
  onPick: (file: File) => void
  disabled?: boolean
  /** No image yet: the button turns green like the original's `.isAvatarBlank`. */
  isBlank?: boolean
}

/** The original's `Uploader`: a button (with a drop target) over the image, with size hints under it. */
export const Uploader = ({ variant, title, lines, onPick, disabled, isBlank }: UploaderProps) => {
  const input = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) onPick(file)
  }

  const onDrop = (event: DragEvent): void => {
    event.preventDefault()
    event.stopPropagation()
    setDragOver(false)
    const file = event.dataTransfer.files[0]
    if (file && !disabled) onPick(file)
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => input.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          setDragOver(false)
        }}
        onDrop={onDrop}
        className={cn(
          'Uploader',
          variant === 'cover' ? 'isCoverUploader' : 'isAvatarUploader',
          uploaderStyles.uploader,
          variant === 'cover' ? uploaderStyles.coverUploader : uploaderStyles.avatarUploader,
          dragOver && ['hasDragOver', uploaderStyles.dragOver],
        )}
      >
        <span className={cn(uploaderStyles.uploadButton, isBlank && uploaderStyles.blank)}>{title}</span>
        <div className={uploaderStyles.message}>
          {lines.map((line, index) => (
            <p key={line} className={index === 2 ? uploaderStyles.dragLine : undefined}>
              {line}
            </p>
          ))}
        </div>
      </button>
      <input
        ref={input}
        type="file"
        hidden
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        onChange={onChange}
        tabIndex={-1}
        aria-label={title}
      />
    </>
  )
}
