'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { saveProfileImage } from '@/actions/profile-actions'
import { errorMessage } from '@/lib/errors'
import { uploadImage } from '@/lib/client/upload'
import type { ImageKind } from '@/lib/schemas/profile'
import { toast } from '@/stores/toast-store'

interface ImageUpload {
  preview: string | null
  busy: boolean
  upload: (file: File) => Promise<void>
}

/** Upload a picked image, save it to the profile, and show a local preview straight away. */
export const useImageUpload = (kind: ImageKind): ImageUpload => {
  const router = useRouter()
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [refreshing, startRefresh] = useTransition()

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const upload = async (file: File): Promise<void> => {
    if (file.type === 'image/gif') {
      // The original's alert when a .gif is picked for the avatar or header.
      toast.info('If it’s animated people will only see the animation on your profile page.', 'Looks like you uploaded a .gif.')
    }
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const url = await uploadImage(file)
      const result = await saveProfileImage(kind, url)
      if (!result.ok) throw new Error(result.error)
      toast.success(kind === 'avatar' ? 'Avatar updated' : 'Header image updated')
      startRefresh(() => router.refresh())
    } catch (error) {
      setPreview(null)
      const message = errorMessage(error)
      toast.error(message, message.startsWith('We support') ? 'Invalid file type' : undefined)
    } finally {
      setUploading(false)
    }
  }

  return { preview, busy: uploading || refreshing, upload }
}
