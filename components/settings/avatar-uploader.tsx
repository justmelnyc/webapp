'use client'

import { Uploader } from '@/components/settings/uploader'
import { Avatar } from '@/components/ui/avatar'
import { useImageUpload } from '@/hooks/use-image-upload'
import { cn } from '@/utils/cn'
import uploaderStyles from './settings-uploader.module.css'

interface AvatarUploaderProps {
  src: string | null | undefined
  name: string
}

/** `.SettingsAvatarPicker`: the large avatar (120px, 180px from 60em) with its Uploader. */
export const AvatarUploader = ({ src, name }: AvatarUploaderProps) => {
  const { preview, busy, upload } = useImageUpload('avatar')
  const shown = preview ?? src
  return (
    <div className={cn('SettingsAvatarPicker', uploaderStyles.avatarPicker)}>
      <Uploader
        variant="avatar"
        title="Upload Avatar"
        lines={['360 x 360', 'Animated Gifs work too', 'Drag & Drop']}
        onPick={(file) => void upload(file)}
        disabled={busy}
        isBlank={!shown}
      />
      <Avatar
        src={shown}
        name={name}
        className={cn('isLarge', 'absolute inset-x-0 top-0 z-[1] size-120 bp3:size-180', busy && uploaderStyles.requesting)}
      />
    </div>
  )
}
