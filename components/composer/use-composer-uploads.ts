'use client'

import { useCallback } from 'react'
import { uploadImage, validateImage } from '@/lib/client/upload'
import { errorMessage } from '@/lib/errors'
import { useComposerStore } from '@/stores/composer-store'
import { toast } from '@/stores/toast-store'

// Files stay outside the store (not serializable UI state) so a failed upload can be retried.
const files = new Map<string, File>()

const run = async (id: string, file: File): Promise<void> => {
  const { updateImage } = useComposerStore.getState()
  updateImage(id, { status: 'uploading' })
  try {
    const url = await uploadImage(file)
    // The block may have been removed while uploading.
    if (!useComposerStore.getState().blocks.some((b) => b.id === id)) return
    updateImage(id, { status: 'done', url })
    files.delete(id)
  } catch (error) {
    updateImage(id, { status: 'error' })
    toast.error(errorMessage(error))
  }
}

export const forgetUpload = (id: string): void => {
  files.delete(id)
}

export const useComposerUploads = (): {
  addFiles: (list: Iterable<File>) => void
  retry: (id: string) => void
} => {
  const addFiles = useCallback((list: Iterable<File>): void => {
    for (const file of list) {
      const problem = validateImage(file)
      if (problem) {
        toast.error(`${file.name}: ${problem}`)
        continue
      }
      const id = useComposerStore.getState().addImage(URL.createObjectURL(file))
      files.set(id, file)
      void run(id, file)
    }
  }, [])

  const retry = useCallback((id: string): void => {
    const file = files.get(id)
    if (file) void run(id, file)
  }, [])

  return { addFiles, retry }
}
