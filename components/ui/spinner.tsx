import { cn } from '@/utils/cn'

export const Spinner = ({ className }: { className?: string }) => (
  <span
    role="status"
    aria-label="Loading"
    className={cn('border-stone border-t-ink inline-block size-5 animate-spin rounded-full border-2', className)}
  />
)
