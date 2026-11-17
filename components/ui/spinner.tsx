import { cn } from '@/utils/cn'

/** A loading indicator in the original's greys (#e5e5e5 track, #aaa arc). */
export const Spinner = ({ className }: { className?: string }) => (
  <span
    role="status"
    aria-label="Loading"
    className={cn('inline-block size-20 animate-spin rounded-full border-2 border-solid border-ge5 border-t-gaa', className)}
  />
)
