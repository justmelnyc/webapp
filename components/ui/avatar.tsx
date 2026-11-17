import { ElloImage } from '@/components/ui/ello-image'
import { cn } from '@/utils/cn'

interface AvatarProps {
  src: string | null | undefined
  name: string
  /** Pixel size of the circle. */
  size?: number
  className?: string
}

export const Avatar = ({ src, name, size = 40, className }: AvatarProps) => (
  <span
    className={cn('bg-stone relative inline-block shrink-0 overflow-hidden rounded-full', className)}
    style={{ width: size, height: size }}
  >
    {src ? (
      <ElloImage src={src} alt={name} width={size} height={size} className="size-full object-cover" />
    ) : (
      <span className="text-slate flex size-full items-center justify-center text-xs uppercase">
        {name.slice(0, 1)}
      </span>
    )}
  </span>
)
