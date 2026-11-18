'use client'

import { Uploader } from '@/components/settings/uploader'
import { useImageUpload } from '@/hooks/use-image-upload'
import { cn } from '@/utils/cn'
import styles from './settings.module.css'
import uploaderStyles from './settings-uploader.module.css'

/** `.SettingsCoverPicker`: the header image (BackgroundImage inSettings hasOverlay6) with its Uploader on top. */
export const CoverUploader = ({ src }: { src: string | null | undefined }) => {
  const { preview, busy, upload } = useImageUpload('cover')
  const shown = preview ?? src
  return (
    <div className={cn('SettingsCoverPicker', styles.coverPicker)}>
      <Uploader
        variant="cover"
        title="Upload Header"
        lines={['2560 x 1440', 'Animated Gifs work too', 'Drag & Drop']}
        onPick={(file) => void upload(file)}
        disabled={busy}
        isBlank={!shown}
      />
      <div className={cn('BackgroundImage', uploaderStyles.cover, busy && uploaderStyles.requesting)}>
        <figure className={uploaderStyles.coverImage} style={shown ? { backgroundImage: `url("${shown}")` } : undefined} />
      </div>
    </div>
  )
}
