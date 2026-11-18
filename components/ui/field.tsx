import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/utils/cn'

/*
 * Light form field parts, with the original's plain FormControlInput look (transparent, #aaa underline,
 * black on focus, red when invalid; forms/FormControl.css). The auth and settings forms use the richer
 * `FormControl` (components/ui/form-control.tsx) instead.
 */
const Root = ({ className, ...props }: ComponentProps<'div'>) => <div className={cn('relative', className)} {...props} />

const Label = ({ className, ...props }: ComponentProps<'label'>) => (
  <label className={cn('text-14 text-gaa', className)} {...props} />
)

const control =
  'inline-block w-full border-0 border-b border-solid border-gaa bg-transparent text-14 text-black ' +
  'transition-[border-color] duration-200 ease-ello outline-none placeholder:text-gaa focus:border-black ' +
  'aria-[invalid=true]:border-red'

const Input = ({ className, ...props }: ComponentProps<'input'>) => (
  <input className={cn(control, 'min-h-40', className)} {...props} />
)

const Textarea = ({ className, ...props }: ComponentProps<'textarea'>) => (
  <textarea className={cn(control, 'mt-10 min-h-60 resize-y', className)} {...props} />
)

const FieldError = ({ children }: { children?: ReactNode }) =>
  children ? (
    <p role="alert" className="my-10 text-14 text-red">
      {children}
    </p>
  ) : null

export const Field = Object.assign(Root, { Label, Input, Textarea, Error: FieldError })
