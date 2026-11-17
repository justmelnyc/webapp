import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/utils/cn'

/** Form field building blocks: <Field><Field.Label/><Field.Input/><Field.Error/></Field> */
const Root = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('flex flex-col gap-1.5', className)} {...props} />
)

const Label = ({ className, ...props }: ComponentProps<'label'>) => (
  <label className={cn('text-slate text-xs tracking-wide uppercase', className)} {...props} />
)

const Input = ({ className, ...props }: ComponentProps<'input'>) => (
  <input
    className={cn(
      'bg-mist focus:border-ink w-full rounded-sm border border-transparent px-3 py-3 text-base outline-none',
      'aria-[invalid=true]:border-ello-red',
      className,
    )}
    {...props}
  />
)

const Textarea = ({ className, ...props }: ComponentProps<'textarea'>) => (
  <textarea
    className={cn(
      'bg-mist focus:border-ink min-h-24 w-full resize-y rounded-sm border border-transparent px-3 py-3 text-base outline-none',
      'aria-[invalid=true]:border-ello-red',
      className,
    )}
    {...props}
  />
)

const FieldError = ({ children }: { children?: ReactNode }) =>
  children ? (
    <p role="alert" className="text-ello-red text-sm">
      {children}
    </p>
  ) : null

export const Field = Object.assign(Root, { Label, Input, Textarea, Error: FieldError })
