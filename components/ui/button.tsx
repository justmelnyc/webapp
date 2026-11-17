import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

const base =
  'inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40'

/** Solid black call to action. */
export const Button = ({ className, type = 'button', ...props }: ComponentProps<'button'>) => (
  <button type={type} className={cn(base, 'bg-ink text-paper hover:bg-ink/80', className)} {...props} />
)

export const GreenButton = ({ className, type = 'button', ...props }: ComponentProps<'button'>) => (
  <button type={type} className={cn(base, 'bg-ello-green text-paper hover:bg-ello-green/85', className)} {...props} />
)

export const OutlineButton = ({ className, type = 'button', ...props }: ComponentProps<'button'>) => (
  <button type={type} className={cn(base, 'border-stone hover:border-ink border bg-transparent', className)} {...props} />
)

export const TextButton = ({ className, type = 'button', ...props }: ComponentProps<'button'>) => (
  <button type={type} className={cn('text-slate hover:text-ink text-sm transition-colors disabled:opacity-40', className)} {...props} />
)
