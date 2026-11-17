'use client'

import { useToastStore } from '@/stores/toast-store'
import { cn } from '@/utils/cn'

export const Toaster = () => {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)
  return (
    <div aria-live="polite" className="fixed right-4 bottom-4 z-[2000] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          className={cn(
            'rounded-sm px-4 py-3 text-left text-sm text-white shadow-lg',
            t.kind === 'error' && 'bg-ello-red',
            t.kind === 'success' && 'bg-ello-green',
            t.kind === 'info' && 'bg-ink',
          )}
        >
          {t.message}
        </button>
      ))}
    </div>
  )
}
