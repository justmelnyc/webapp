import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

/*
 * Button primitives with the original's values.
 *  - Button / GreenButton: PostActionButton (PostActionBar.js): 40px high, 5px radius, #000 / #00d100
 *  - FormButton: forms/FormButton.js (full width, 60px high, green, #7ac97a when disabled)
 *  - OutlineButton: the ZeroState PostActionButton.forSubmit outline (#aaa, fills black on hover)
 *  - TextButton: PostActionBar's cancelTextButtonStyle (#aaa, #6a6a6a on hover)
 */
const action =
  'inline-flex h-40 items-center justify-center whitespace-nowrap rounded-[5px] px-20 text-14 leading-[40px] text-white ' +
  'transition-[background-color,color] duration-200 ease-in-out disabled:pointer-events-none disabled:bg-gaa'

/** Solid black call to action. */
export const Button = ({ className, type = 'button', ...props }: ComponentProps<'button'>) => (
  <button type={type} className={cn(action, 'bg-black hover:bg-[#6a6a6a]', className)} {...props} />
)

export const GreenButton = ({ className, type = 'button', ...props }: ComponentProps<'button'>) => (
  <button type={type} className={cn(action, 'bg-green hover:bg-[#02b302]', className)} {...props} />
)

export const OutlineButton = ({ className, type = 'button', ...props }: ComponentProps<'button'>) => (
  <button
    type={type}
    className={cn(
      action,
      'border border-solid border-current bg-white text-gaa hover:border-black hover:bg-black hover:text-white disabled:bg-white',
      className,
    )}
    {...props}
  />
)

export const TextButton = ({ className, type = 'button', ...props }: ComponentProps<'button'>) => (
  <button
    type={type}
    className={cn('text-14 text-gaa transition-colors duration-200 ease-in-out hover:text-[#6a6a6a]', className)}
    {...props}
  />
)

/** The original's `FormButton` (isRounded is the default here; use `FormButtonSquare` for the plain one). */
const formButton =
  'h-60 w-full whitespace-nowrap border border-solid border-green bg-green px-30 text-14 leading-[60px] text-white ' +
  'transition-[background-color,border-color,color,width] duration-200 ease-ello ' +
  'enabled:active:border-[#00b100] enabled:active:bg-[#00b100] enabled:hover:border-[#00b100] enabled:hover:bg-[#00b100] ' +
  'disabled:border-[#7ac97a] disabled:bg-[#7ac97a]'

export const FormButton = ({ className, type = 'submit', ...props }: ComponentProps<'button'>) => (
  <button type={type} className={cn('FormButton isRounded', formButton, 'rounded-[5px]', className)} {...props} />
)

export const FormButtonSquare = ({ className, type = 'submit', ...props }: ComponentProps<'button'>) => (
  <button type={type} className={cn('FormButton', formButton, className)} {...props} />
)
