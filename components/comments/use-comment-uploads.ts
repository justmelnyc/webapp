'use client'

import { useCallback, useEffect, useRef } from 'react'
import { uploadImage, validateImage } from '@/lib/client/upload'
import { errorMessage } from '@/lib/errors'
import { toast } from '@/stores/toast-store'
import type { CommentImageBlock } from './use-comment-blocks'

interface UploadTarget {
  addImage: (previewUrl: string) => string
  updateImage: (id: string, patch: Partial<Pick<CommentImageBlock, 'url' | 'status'>>) => void
}

/** The post editor's upload flow (credentials, then browser -> storage) for the comment editor's pictures. */
export const useCommentUploads = ({ addImage, updateImage }: UploadTarget) => {
  // Files stay outside the blocks so a failed upload can be retried.
  const files = useRef(new Map<string, File>())
  const previews = useRef(new Set<string>())
  const removed = useRef(new Set<string>())

  const run = useCallback(
    async (id: string, file: File): Promise<void> => {
      updateImage(id, { status: 'uploading' })
      try {
        const url = await uploadImage(file)
        if (removed.current.has(id)) return
        updateImage(id, { status: 'done', url })
        files.current.delete(id)
      } catch (error) {
        if (removed.current.has(id)) return
        updateImage(id, { status: 'error' })
        toast.error(errorMessage(error))
      }
    },
    [updateImage],
  )

  const addFiles = useCallback(
    (list: Iterable<File>): void => {
      for (const file of list) {
        const problem = validateImage(file)
        if (problem) {
          toast.error(`${file.name}: ${problem}`)
          continue
        }
        const preview = URL.createObjectURL(file)
        previews.current.add(preview)
        const id = addImage(preview)
        files.current.set(id, file)
        void run(id, file)
      }
    },
    [addImage, run],
  )

  const retry = useCallback(
    (id: string): void => {
      const file = files.current.get(id)
      if (file) void run(id, file)
    },
    [run],
  )

  /** A picture was taken out of the comment: stop caring about its upload. */
  const forget = useCallback((id: string): void => {
    removed.current.add(id)
    files.current.delete(id)
  }, [])

  const releasePreviews = useCallback((): void => {
    previews.current.forEach((url) => URL.revokeObjectURL(url))
    previews.current.clear()
  }, [])

  useEffect(() => releasePreviews, [releasePreviews])

  return { addFiles, retry, forget, releasePreviews }
}
