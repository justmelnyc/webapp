'use client'

import { useRef, type ChangeEvent } from 'react'
import { useSubmitPost } from '@/components/composer/use-submit-post'
import { GreenButton, OutlineButton, TextButton } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ACCEPTED_IMAGE_TYPES } from '@/constants/upload'
import { canPost, hasUploadsInFlight, useComposerStore } from '@/stores/composer-store'

interface ComposerFooterProps {
  onFiles: (files: File[]) => void
  onRequestClose: () => void
}

export const ComposerFooter = ({ onFiles, onRequestClose }: ComposerFooterProps) => {
  const blocks = useComposerStore((s) => s.blocks)
  const isSubmitting = useComposerStore((s) => s.isSubmitting)
  const addText = useComposerStore((s) => s.addText)
  const { submit, isPending } = useSubmitPost()
  const inputRef = useRef<HTMLInputElement>(null)
  const busy = isSubmitting || isPending
  const uploading = hasUploadsInFlight(blocks)

  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onFiles(Array.from(e.target.files ?? []))
    e.target.value = '' // allow picking the same file again
  }

  return (
    <footer className="border-stone flex items-center gap-3 border-t px-5 py-4">
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        onChange={onChange}
        aria-label="Choose images"
      />
      <OutlineButton onClick={() => inputRef.current?.click()}>Add image</OutlineButton>
      <TextButton onClick={() => addText()}>+ Text</TextButton>
      {uploading && (
        <span className="text-slate flex items-center gap-2 text-xs">
          <Spinner className="size-4" /> Uploading...
        </span>
      )}
      <TextButton className="ml-auto" onClick={onRequestClose}>
        Cancel
      </TextButton>
      <GreenButton disabled={!canPost(blocks) || busy} onClick={submit}>
        {busy ? 'Posting...' : 'Post'}
      </GreenButton>
    </footer>
  )
}
