'use client'

import { Avatar } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { useImageUpload } from '@/hooks/use-image-upload'
import { ImagePicker } from './image-picker'

interface AvatarUploaderProps {
  src: string | null | undefined
  name: string
}

export const AvatarUploader = ({ src, name }: AvatarUploaderProps) => {
  const { preview, busy, upload } = useImageUpload('avatar')
  return (
    <ImagePicker
      onPick={upload}
      label="Change avatar"
      disabled={busy}
      className="group border-paper relative rounded-full border-4"
    >
      <Avatar src={preview ?? src} name={name} size={120} />
      <span className="bg-ink/50 text-paper absolute inset-0 flex items-center justify-center rounded-full text-xs opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {busy ? <Spinner /> : 'Change'}
      </span>
    </ImagePicker>
  )
}
