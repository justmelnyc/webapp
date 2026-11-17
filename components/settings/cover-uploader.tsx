'use client'

import { useState, type DragEvent } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { useImageUpload } from '@/hooks/use-image-upload'
import { cn } from '@/utils/cn'
import { ImagePicker } from './image-picker'

interface CoverUploaderProps {
  src: string | null | undefined
}

export const CoverUploader = ({ src }: CoverUploaderProps) => {
  const { preview, busy, upload } = useImageUpload('cover')
  const [dragging, setDragging] = useState(false)
  const shown = preview ?? src

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file && !busy) void upload(file)
  }

  return (
    <div
      onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn('bg-stone relative h-48 w-full overflow-hidden rounded-sm sm:h-64', dragging && 'ring-ink ring-2')}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local blob previews and API-sized images */}
      {shown ? <img src={shown} alt="Header" className="size-full object-cover" /> : null}
      <ImagePicker
        onPick={upload}
        label="Change header image"
        disabled={busy}
        className="bg-ink/0 text-paper hover:bg-ink/40 focus-visible:bg-ink/40 absolute inset-0 flex items-center justify-center text-sm opacity-0 transition hover:opacity-100 focus-visible:opacity-100"
      >
        {busy ? <Spinner /> : shown ? 'Change header image' : 'Add a header image (or drop one here)'}
      </ImagePicker>
      {!shown && !busy ? (
        <span className="text-slate pointer-events-none absolute inset-0 flex items-center justify-center text-sm">
          Click or drop a header image
        </span>
      ) : null}
    </div>
  )
}
