import { AvatarUploader } from './avatar-uploader'
import { CoverUploader } from './cover-uploader'

interface ProfileImagesProps {
  coverSrc: string | null | undefined
  avatarSrc: string | null | undefined
  name: string
}

export const ProfileImages = ({ coverSrc, avatarSrc, name }: ProfileImagesProps) => (
  <div className="relative mb-16">
    <CoverUploader src={coverSrc} />
    <div className="absolute -bottom-14 left-4">
      <AvatarUploader src={avatarSrc} name={name} />
    </div>
  </div>
)
